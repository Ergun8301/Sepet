import React, { useState, useEffect, useRef } from 'react';
import { Clock, MapPinOff, LogOut, User, ShoppingCart, Map as MapIcon, Navigation } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { OffersMap } from '../components/OffersMap';
import { QuantityModal } from '../components/QuantityModal';
import { createReservation } from '@/api/reservations';
import { ewkbPointToLatLng } from '@/utils/ewkb';
import { haversineKm, formatDistance } from '@/utils/distance';
import { getCurrentUserPosition, requestBrowserGeolocation, isGeolocationAvailable } from '@/utils/userLocation';

interface OfferWithLocation {
  id: string;
  merchant_id: string;
  merchant_name: string;
  title: string;
  description: string;
  image_url: string | null;
  price_before: number;
  price_after: number;
  discount_percent: number;
  available_from: string;
  available_until: string;
  quantity: number;
  is_active: boolean;
  updated_at: string;
  location: string | null;
  lat?: number;
  lon?: number;
  distance_km?: number;
}

const CustomerOffersMapPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [offers, setOffers] = useState<OfferWithLocation[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<OfferWithLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPosition, setLoadingPosition] = useState(false);
  const [radiusKm, setRadiusKm] = useState(20);
  const [userPosition, setUserPosition] = useState<{ lat: number; lon: number } | null>(null);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [reserving, setReserving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const offerRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Fetch user position on mount
  useEffect(() => {
    const fetchUserPosition = async () => {
      if (!user) return;

      setLoadingPosition(true);
      const position = await getCurrentUserPosition();
      setUserPosition(position);
      setLoadingPosition(false);
    };

    fetchUserPosition();
  }, [user]);

  // Fetch offers from Supabase
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        const now = new Date().toISOString();

        const { data, error } = await supabase
          .from('offers')
          .select(`
            id,
            merchant_id,
            title,
            description,
            image_url,
            price_before,
            price_after,
            discount_percent,
            available_from,
            available_until,
            quantity,
            is_active,
            updated_at,
            location,
            merchants!inner(company_name)
          `)
          .gte('available_until', now);

        if (error) {
          console.error('Error fetching offers:', error);
          return;
        }

        if (!data) {
          setOffers([]);
          return;
        }

        // Parse offers and decode EWKB locations
        const parsedOffers: OfferWithLocation[] = data.map((offer: any) => {
          const coords = offer.location ? ewkbPointToLatLng(offer.location) : null;

          return {
            id: offer.id,
            merchant_id: offer.merchant_id,
            merchant_name: offer.merchants?.company_name || 'Unknown',
            title: offer.title,
            description: offer.description || '',
            image_url: offer.image_url,
            price_before: parseFloat(offer.price_before),
            price_after: parseFloat(offer.price_after),
            discount_percent: offer.discount_percent,
            available_from: offer.available_from,
            available_until: offer.available_until,
            quantity: offer.quantity,
            is_active: offer.is_active,
            updated_at: offer.updated_at,
            location: offer.location,
            lat: coords?.lat,
            lon: coords?.lon
          };
        });

        setOffers(parsedOffers);
      } catch (err) {
        console.error('Error fetching offers:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOffers();

      // Subscribe to realtime updates
      const channel = supabase
        .channel('offers-map-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'offers' },
          () => { fetchOffers(); }
        )
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [user]);

  // Filter and sort offers when position or radius changes
  useEffect(() => {
    if (!offers.length) {
      setFilteredOffers([]);
      return;
    }

    const now = new Date();

    // Filter offers: active, has stock, not expired, has coordinates (for map display)
    let filtered = offers.filter(offer => {
      const isAvailable =
        offer.is_active &&
        offer.quantity > 0 &&
        new Date(offer.available_until) > now;

      // If we have user position, filter by radius
      if (userPosition && offer.lat !== undefined && offer.lon !== undefined) {
        const distance = haversineKm(userPosition, { lat: offer.lat, lon: offer.lon });
        offer.distance_km = distance;
        return isAvailable && distance <= radiusKm;
      }

      // No position or no offer coords: show all available offers
      return isAvailable;
    });

    // Sort offers
    filtered.sort((a, b) => {
      // 1. Active, in-stock, not expired first (already filtered above)

      // 2. Distance (if available)
      if (userPosition && a.distance_km !== undefined && b.distance_km !== undefined) {
        if (a.distance_km !== b.distance_km) {
          return a.distance_km - b.distance_km;
        }
      }

      // 3. Expires soon first
      const timeA = new Date(a.available_until).getTime();
      const timeB = new Date(b.available_until).getTime();
      if (timeA !== timeB) {
        return timeA - timeB;
      }

      // 4. Recently updated first (reactivated offers)
      const updatedA = new Date(a.updated_at).getTime();
      const updatedB = new Date(b.updated_at).getTime();
      return updatedB - updatedA;
    });

    setFilteredOffers(filtered);
  }, [offers, userPosition, radiusKm]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const formatTimeLeft = (dateString: string): string => {
    const now = new Date();
    const end = new Date(dateString);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''} left`;
    }

    if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    }

    return `${minutes}m left`;
  };

  const getUrgencyColor = (dateString: string): string => {
    const now = new Date();
    const end = new Date(dateString);
    const hours = (end.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hours < 0) return 'text-gray-400';
    if (hours <= 2) return 'text-red-600 font-bold';
    if (hours <= 6) return 'text-red-600';
    if (hours <= 12) return 'text-orange-600';
    if (hours <= 24) return 'text-yellow-600';
    return 'text-green-600';
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleUseCurrentLocation = async () => {
    setLoadingPosition(true);
    const position = await requestBrowserGeolocation();
    if (position) {
      setUserPosition(position);
      setToast({ message: 'Location updated successfully', type: 'success' });
    } else {
      setToast({ message: 'Could not get your location', type: 'error' });
    }
    setLoadingPosition(false);
  };

  const handleReserve = (offerId: string) => {
    if (!user) {
      setToast({ message: 'Please sign in to make a reservation', type: 'error' });
      return;
    }
    setSelectedOfferId(offerId);
  };

  const handleConfirmReservation = async (quantity: number) => {
    const offer = filteredOffers.find(o => o.id === selectedOfferId);
    if (!offer) return;

    setReserving(true);
    try {
      const result = await createReservation(offer.id, offer.merchant_id, quantity);

      if (result.success) {
        setToast({ message: 'Reservation confirmed!', type: 'success' });
        setSelectedOfferId(null);

        // Update local state
        setOffers(prevOffers =>
          prevOffers.map(o =>
            o.id === offer.id ? { ...o, quantity: o.quantity - quantity } : o
          )
        );
      } else {
        setToast({ message: result.error || 'Failed to create reservation', type: 'error' });
      }
    } catch (error: any) {
      setToast({ message: error.message || 'An error occurred', type: 'error' });
    } finally {
      setReserving(false);
    }
  };

  const handleOfferClick = (offerId: string) => {
    const element = offerRefs.current[offerId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('ring-4', 'ring-green-500');
      setTimeout(() => {
        element.classList.remove('ring-4', 'ring-green-500');
      }, 2000);
    }
  };

  // Prepare offers for map (only those with coordinates)
  const mapOffers = filteredOffers
    .filter(offer => offer.lat !== undefined && offer.lon !== undefined)
    .map(offer => ({
      id: offer.id,
      title: offer.title,
      lat: offer.lat!,
      lng: offer.lon!,
      price: offer.price_after,
      image_url: offer.image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      discount: offer.discount_percent
    }));

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">
            Please sign in to view offers near you on the map.
          </p>
          <button
            onClick={() => navigate('/customer/auth')}
            className="w-full bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (loading || loadingPosition) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">
            {loadingPosition ? 'Getting your location...' : 'Loading offers...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                <MapIcon className="w-6 h-6 text-green-600" />
                <span>Offers Map</span>
              </h1>
              <p className="text-sm text-gray-600">
                {filteredOffers.length} offer{filteredOffers.length !== 1 ? 's' : ''}
                {userPosition ? ` within ${radiusKm} km` : ''}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/profile')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Profile"
              >
                <User className="w-6 h-6" />
              </button>
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* No location warning */}
        {!userPosition && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
            <div className="flex items-start">
              <MapPinOff className="w-6 h-6 text-yellow-600 mt-1 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">Location Not Set</h3>
                <p className="text-yellow-800 mb-4">
                  Please set your location in your profile to see offers on the map and filter by distance.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate('/profile')}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors"
                  >
                    Go to Profile
                  </button>
                  {isGeolocationAvailable() && (
                    <button
                      onClick={handleUseCurrentLocation}
                      disabled={loadingPosition}
                      className="bg-white text-yellow-800 border border-yellow-300 px-4 py-2 rounded-lg font-medium hover:bg-yellow-50 transition-colors disabled:opacity-50 flex items-center space-x-2"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>{loadingPosition ? 'Getting location...' : 'Use My Current Location'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No offers message */}
        {userPosition && filteredOffers.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center mb-8">
            <MapPinOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No offers near you
            </h3>
            <p className="text-gray-600 mb-6">
              We couldn't find any active offers within {radiusKm} km of your location.
            </p>
            <button
              onClick={() => navigate('/profile')}
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Change Location
            </button>
          </div>
        )}

        {/* Map */}
        {userPosition && mapOffers.length > 0 && (
          <div className="mb-8">
            <OffersMap
              userLocation={userPosition}
              offers={mapOffers}
              radiusKm={radiusKm}
              onRadiusChange={setRadiusKm}
              onOfferClick={handleOfferClick}
            />
          </div>
        )}

        {/* Offers Grid */}
        {filteredOffers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOffers.map((offer) => (
              <div
                key={offer.id}
                ref={(el) => { offerRefs.current[offer.id] = el; }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="relative">
                  <img
                    src={offer.image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'}
                    alt={offer.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-bold">
                    -{offer.discount_percent}%
                  </div>
                  <div className={`absolute top-4 right-4 flex items-center space-x-1 px-3 py-1 rounded-lg text-sm font-semibold ${getUrgencyColor(offer.available_until)} bg-white`}>
                    <Clock className="w-4 h-4" />
                    <span>{formatTimeLeft(offer.available_until)}</span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{offer.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{offer.description}</p>

                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <span>{offer.merchant_name}</span>
                    {offer.distance_km !== undefined && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{formatDistance(offer.distance_km)}</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-green-600">
                        ${offer.price_after.toFixed(2)}
                      </span>
                      <span className="text-lg text-gray-400 line-through">
                        ${offer.price_before.toFixed(2)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {offer.quantity} left
                    </span>
                  </div>

                  <button
                    onClick={() => handleReserve(offer.id)}
                    disabled={offer.quantity <= 0}
                    className="w-full bg-green-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {offer.quantity <= 0 ? 'Sold Out' : 'Reserve Now'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quantity Modal */}
      {selectedOfferId && (() => {
        const offer = filteredOffers.find(o => o.id === selectedOfferId);
        return offer ? (
          <QuantityModal
            isOpen={true}
            onClose={() => setSelectedOfferId(null)}
            onConfirm={handleConfirmReservation}
            offerTitle={offer.title}
            availableQuantity={offer.quantity}
            price={offer.price_after}
            loading={reserving}
          />
        ) : null;
      })()}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div
            className={`px-6 py-4 rounded-lg shadow-xl ${
              toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white font-medium flex items-center space-x-2`}
          >
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerOffersMapPage;
