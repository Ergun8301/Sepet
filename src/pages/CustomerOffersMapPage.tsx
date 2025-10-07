import React, { useState, useEffect, useRef } from 'react';
import { Clock, MapPinOff, LogOut, User, ShoppingCart, Map as MapIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { OffersMap } from '../components/OffersMap';
import { QuantityModal } from '../components/QuantityModal';
import { createReservation } from '../api/reservations';

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
  location: string | null;
  distance_m?: number;
}

const CustomerOffersMapPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [offers, setOffers] = useState<OfferWithLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [radiusKm, setRadiusKm] = useState(20);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [reserving, setReserving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showAllOffers, setShowAllOffers] = useState(false);

  const offerRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Parse PostGIS POINT format
  const parseLocation = (locationString: string | null): { lat: number; lng: number } | null => {
    if (!locationString) return null;
    const match = locationString.match(/POINT\(([^ ]+) ([^ ]+)\)/);
    if (!match) return null;
    const lng = parseFloat(match[1]);
    const lat = parseFloat(match[2]);
    if (isNaN(lat) || isNaN(lng)) return null;
    return { lat, lng };
  };

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // Fetch user location from clients table
  useEffect(() => {
    const fetchUserLocation = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('clients')
          .select('location')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching user location:', error);
          return;
        }

        if (data?.location) {
          const coords = parseLocation(data.location);
          if (coords) {
            setUserLocation(coords);
          }
        }
      } catch (err) {
        console.error('Error:', err);
      }
    };

    fetchUserLocation();
  }, [user]);

  // Fetch offers with location
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
            location,
            merchants!inner(company_name)
          `)
          .eq('is_active', true)
          .gte('available_until', now)
          .lte('available_from', now)
          .not('location', 'is', null);

        if (error) {
          console.error('Error fetching offers:', error);
          return;
        }

        if (!data) {
          setOffers([]);
          return;
        }

        // Format offers and calculate distances
        const formattedOffers: OfferWithLocation[] = data.map((offer: any) => ({
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
          location: offer.location
        }));

        // Filter by radius if user location is available
        if (userLocation && !showAllOffers) {
          const filteredOffers = formattedOffers
            .map(offer => {
              const offerCoords = parseLocation(offer.location);
              if (!offerCoords) return null;

              const distance = calculateDistance(
                userLocation.lat,
                userLocation.lng,
                offerCoords.lat,
                offerCoords.lng
              );

              return { ...offer, distance_m: distance };
            })
            .filter((offer): offer is OfferWithLocation & { distance_m: number } =>
              offer !== null && offer.distance_m <= radiusKm * 1000
            )
            .sort((a, b) => a.distance_m - b.distance_m);

          setOffers(filteredOffers);
        } else {
          // Show all offers if showAllOffers or no user location
          setOffers(formattedOffers);
        }
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
          {
            event: '*',
            schema: 'public',
            table: 'offers'
          },
          () => {
            fetchOffers();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, userLocation, radiusKm, showAllOffers]);

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

  const handleReserve = (offerId: string) => {
    if (!user) {
      setToast({ message: 'Please sign in to make a reservation', type: 'error' });
      return;
    }
    setSelectedOfferId(offerId);
  };

  const handleConfirmReservation = async (quantity: number) => {
    const offer = offers.find(o => o.id === selectedOfferId);
    if (!offer) return;

    setReserving(true);
    try {
      const result = await createReservation(offer.id, offer.merchant_id, quantity);

      if (result.success) {
        setToast({ message: '✓ Reservation confirmed!', type: 'success' });
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

  // Prepare offers for map
  const mapOffers = offers
    .map(offer => {
      const coords = parseLocation(offer.location);
      if (!coords) return null;
      return {
        id: offer.id,
        title: offer.title,
        lat: coords.lat,
        lng: coords.lng,
        price: offer.price_after,
        image_url: offer.image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
        discount: offer.discount_percent
      };
    })
    .filter((offer): offer is NonNullable<typeof offer> => offer !== null);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading offers near you...</p>
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
                {offers.length} offer{offers.length !== 1 ? 's' : ''} {showAllOffers ? 'in all areas' : `within ${radiusKm} km`}
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
        {!userLocation && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">Location Not Set</h3>
            <p className="text-yellow-800 mb-4">
              Please set your location in your profile to see offers on the map.
            </p>
            <button
              onClick={() => navigate('/profile')}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors"
            >
              Go to Profile
            </button>
          </div>
        )}

        {/* No offers message */}
        {userLocation && !showAllOffers && offers.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center mb-8">
            <MapPinOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No offers near you
            </h3>
            <p className="text-gray-600 mb-6">
              We couldn't find any offers within {radiusKm} km of your location.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowAllOffers(true)}
                className="bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
              >
                View All Offers
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Change Location
              </button>
            </div>
          </div>
        )}

        {/* Map */}
        {userLocation && mapOffers.length > 0 && (
          <div className="mb-8">
            <OffersMap
              userLocation={userLocation}
              offers={mapOffers}
              radiusKm={radiusKm}
              onRadiusChange={(radius) => {
                setRadiusKm(radius);
                setShowAllOffers(false);
              }}
              onOfferClick={handleOfferClick}
            />
          </div>
        )}

        {/* Offers Grid */}
        {offers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
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
                    {offer.distance_m !== undefined && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{(offer.distance_m / 1000).toFixed(1)} km away</span>
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
        const offer = offers.find(o => o.id === selectedOfferId);
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
