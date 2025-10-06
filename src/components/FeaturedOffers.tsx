import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Star, Heart, ArrowRight } from 'lucide-react';
import { getActiveOffers, type Offer } from '../../lib/api';
import { useAuth } from '../hooks/useAuth';

const FeaturedOffers = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const data = await getActiveOffers();
        // Show only first 6 offers for homepage
        setOffers(data.slice(0, 6));
      } catch (error) {
        console.error('Error fetching offers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const formatTimeLeft = (dateString: string) => {
    const now = new Date();
    const end = new Date(dateString);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m left`;
  };

  if (loading) {
    return (
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-80 animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Offers</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover amazing deals from local restaurants. Sign up to see full details and reserve your favorites!
          </p>
        </div>

        {offers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 mb-6">
              No offers available yet. Check back soon!
            </p>
            <p className="text-gray-500">
              Merchants can add offers through their dashboard.
            </p>
          </div>
        ) : (
          <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {offers.map((offer) => (
            <div key={offer.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
              <div className="relative">
                <img
                  src={offer.image_url}
                  alt={offer.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-bold">
                  -{offer.discount_percentage}%
                </div>
                <button className="absolute top-4 right-4 bg-white bg-opacity-90 p-2 rounded-full hover:bg-opacity-100 transition-all">
                  <Heart className="w-5 h-5 text-gray-600 hover:text-red-500" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">{offer.merchant?.avg_rating || 'N/A'}</span>
                  </div>
                  <div className="flex items-center text-sm text-red-600">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatTimeLeft(offer.available_until)}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{offer.title}</h3>
                <p className="text-gray-600 mb-3 text-sm">{offer.description}</p>

                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{offer.merchant?.company_name || 'Unknown Merchant'}</span>
                  {!user && <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Sign in to see full address</span>}
                  {user && offer.merchant?.full_address && (
                    <span className="ml-2 text-xs text-gray-400">• {offer.merchant.full_address}</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-green-600">
                      ${offer.discounted_price}
                    </span>
                    <span className="text-lg text-gray-400 line-through">
                      ${offer.original_price}
                    </span>
                  </div>
                  {user ? (
                    <button className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors">
                      Reserve Now
                    </button>
                  ) : (
                    <button className="bg-gray-300 text-gray-600 px-4 py-2 rounded-lg font-medium cursor-not-allowed">
                      Sign In to Reserve
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start Saving?</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of food lovers who are saving money while helping reduce food waste. 
            Sign up now to access all offers and start reserving your favorite meals!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/customer/teaser"
              className="bg-green-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors inline-flex items-center"
            >
              View All Offers
              <ArrowRight className="w-4 h-4 ml-2" />
            </a>
            {!user && (
              <button className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                Sign Up Free
              </button>
            )}
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
};

export default FeaturedOffers;