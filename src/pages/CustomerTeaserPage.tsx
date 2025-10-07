import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Star, Heart, ArrowRight, Filter, Smartphone, Lock } from 'lucide-react';
import { getActiveOffers, type Offer } from '../api';
import { useNavigate } from 'react-router-dom';

const CustomerTeaserPage = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const navigate = useNavigate();

  const categories = ['All', 'Bakery', 'Fruits', 'Ready Meals', 'Drinks'];

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const data = await getActiveOffers();
        // Show limited teaser offers
        setOffers(data.slice(0, 6));
      } catch (error) {
        console.error('Error fetching offers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const handleOfferClick = () => {
    setShowLoginPrompt(true);
  };

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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Discover Amazing Food Deals
            </h1>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Preview exclusive offers from local restaurants. Sign in to see full details, 
              exact locations, and make reservations.
            </p>
            <button
              onClick={() => navigate('/customer/auth')}
              className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center text-lg shadow-lg"
            >
              Sign In to Access Full Details
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Filter Bar */}
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <Filter className="w-5 h-5 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Browse by category</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-full font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-green-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Teaser Offers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {offers.map((offer) => (
              <div 
                key={offer.id} 
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer relative"
                onClick={handleOfferClick}
              >
                {/* Overlay for locked content */}
                <div className="absolute inset-0 bg-black bg-opacity-20 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white rounded-full p-3 shadow-lg">
                    <Lock className="w-6 h-6 text-gray-600" />
                  </div>
                </div>

                <div className="relative">
                  <img
                    src={offer.image_url}
                    alt={offer.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                    -{offer.discount_percentage}%
                  </div>
                  <button className="absolute top-4 right-4 bg-white bg-opacity-90 p-2 rounded-full hover:bg-opacity-100 transition-all shadow-lg">
                    <Heart className="w-5 h-5 text-gray-600 hover:text-red-500" />
                  </button>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-700">★★★★★</span>
                    </div>
                    <div className="flex items-center text-sm text-red-600 font-medium">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatTimeLeft(offer.available_until)}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">{offer.title}</h3>
                  <p className="text-gray-600 mb-4 text-sm line-clamp-2">{offer.description}</p>

                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="font-medium">Local Restaurant</span>
                    <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      Sign in to see location
                    </span>
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
                    <button className="bg-gray-300 text-gray-600 px-4 py-2 rounded-lg font-medium cursor-not-allowed">
                      Sign In to Reserve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA Section */}
          <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to access exclusive deals?
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-lg">
              Sign in or create an account to see full offer details, exact restaurant locations, 
              customer reviews, and make instant reservations.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button
                onClick={() => navigate('/customer/auth')}
                className="bg-green-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-600 transition-colors inline-flex items-center text-lg shadow-lg"
              >
                Sign In Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              <button
                onClick={() => navigate('/customer/auth')}
                className="bg-gray-900 text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors inline-flex items-center text-lg shadow-lg"
              >
                <Smartphone className="w-5 h-5 mr-2" />
                Create Account
              </button>
            </div>

            <p className="text-gray-500">Join thousands of food lovers saving money and reducing waste</p>
          </div>
        </div>
      </div>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Sign in to access full details</h3>
            <p className="text-gray-600 mb-6">
              Create an account or sign in to see complete offer information, restaurant locations, 
              reviews, and make reservations.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/customer/auth')}
                className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
              >
                Sign In / Create Account
              </button>
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="text-gray-600 hover:text-gray-800 font-medium"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerTeaserPage;