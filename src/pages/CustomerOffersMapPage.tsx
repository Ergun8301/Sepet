import React, { useState, useEffect, useRef } from 'react';
import { Clock, MapPinOff, Settings, LogOut, User, ShoppingCart } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useClientLocation } from '../hooks/useClientLocation';
import { useNearbyOffers } from '../hooks/useNearbyOffers';
import { createReservation } from '../api/reservations';
import { OffersMap } from '../components/OffersMap';
import { QuantityModal } from '../components/QuantityModal';
import { smartSortOffers, formatTimeLeft, getUrgencyColor } from '../utils/offersSorting';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const CustomerOffersMapPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [radiusKm, setRadiusKm] = useState(20);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [reserving, setReserving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showAllOffers, setShowAllOffers] = useState(false);
  const offerRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const { location, loading: locationLoading } = useClientLocation(user?.id || null);

  const {
    offers: nearbyOffers,
    loading: offersLoading,
    refetch
  } = useNearbyOffers({
    clientId: user?.id || null,
    radiusKm: showAllOffers ? 1000 : radiusKm, // 1000km = essentially all offers
    enabled: !!user && !!location
  });

  // Smart sort offers
  const sortedOffers = smartSortOffers(nearbyOffers);

  // Prepare offers for map
  const mapOffers = sortedOffers
    .filter(offer => offer.offer_lat && offer.offer_lng)
    .map(offer => ({
      id: offer.id,
      title: offer.title,
      lat: offer.offer_lat!,
      lng: offer.offer_lng!,
      price: offer.price_after,
      price_before: offer.price_before,
      distance_km: (offer.distance_m / 1000).toFixed(1),
      image_url: offer.image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      discount: offer.discount_percent
    }));

  useEffect(() => {
    const savedRadius = localStorage.getItem('searchRadius');
    if (savedRadius) {
      const radius = parseInt(savedRadius, 10);
      if (!isNaN(radius) && radius >= 1 && radius <= 50) {
        setRadiusKm(radius);
      }
    }
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

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
    const offer = sortedOffers.find(o => o.id === selectedOfferId);
    if (!offer) return;

    setReserving(true);
    try {
      const result = await createReservation(offer.id, offer.merchant_id, quantity);

      if (result.success) {
        setToast({ message: '✓ Reservation confirmed!', type: 'success' });
        setSelectedOfferId(null);
        refetch();
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

  const handleChangeLocation = () => {
    navigate('/profile');
  };

  const userLocationCoords = location
    ? (() => {
        const match = location.match(/POINT\(([^ ]+) ([^ ]+)\)/);
        return match ? { lat: parseFloat(match[2]), lng: parseFloat(match[1]) } : null;
      })()
    : null;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">
            Please sign in to view offers near you and make reservations.
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

  if (locationLoading || offersLoading) {
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
              <h1 className="text-2xl font-bold text-gray-900">
                Offers Near You
              </h1>
              <p className="text-sm text-gray-600">
                {sortedOffers.length} offer{sortedOffers.length !== 1 ? 's' : ''} within {showAllOffers ? 'all areas' : `${radiusKm} km`}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/profile')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Settings"
              >
                <Settings className="w-6 h-6" />
              </button>
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
        {/* Map - Always show if user has location */}
        {userLocationCoords && (
          <div className="mb-8">
            <OffersMap
              userLocation={userLocationCoords}
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

        {/* No offers message */}
        {!showAllOffers && sortedOffers.length === 0 && userLocationCoords && (
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
                onClick={handleChangeLocation}
                className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Change Location
              </button>
            </div>
          </div>
        )}

        {/* Offers Grid */}
        {sortedOffers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedOffers.map((offer) => (
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
                  <div className={`absolute top-4 right-4 flex items-center space-x-1 px-3 py-1 rounded-lg text-sm font-semibold ${getUrgencyColor(offer.expiresInHours)} bg-white`}>
                    <Clock className="w-4 h-4" />
                    <span>{formatTimeLeft(offer.available_until)}</span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{offer.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{offer.description}</p>

                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <span>{offer.merchant_name}</span>
                    <span className="mx-2">•</span>
                    <span>{(offer.distance_m / 1000).toFixed(1)} km away</span>
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
        const offer = sortedOffers.find(o => o.id === selectedOfferId);
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
