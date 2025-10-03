import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Star, Heart, ArrowRight, Filter, Smartphone } from 'lucide-react';
import { getActiveOffers, type Offer } from '../../lib/api';
import { useAuth } from '../hooks/useAuth';

const ExplorePage = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { user } = useAuth();

  const categories = ['All', 'Bakery', 'Fruits', 'Ready Meals', 'Drinks'];

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const data = await getActiveOffers();
        // Show first 6 offers for better grid display
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
      <div className="min-h-screen bg-gray-50">
        {/* Top Banner Skeleton */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="h-8 bg-white bg-opacity-20 rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-white bg-opacity-20 rounded w-48 mx-auto animate-pulse"></div>
          </div>
        </div>
        
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 md:h-[500px] lg:h-[600px] overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200)` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/30"></div>
        </div>

        {/* Content Overlay */}
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center text-white px-4 max-w-4xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Save up to 75% on local deals
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
              Discover amazing discounts from restaurants near you. Fresh food, great prices, zero waste.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filter Bar */}
        <div className="mb-12">
          <div className="flex items-center mb-6">
            <Filter className="w-5 h-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Filter by category</h3>
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

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {offers.map((offer) => (
            <div key={offer.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group">
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
                    <span className="text-sm font-medium text-gray-700">{offer.merchant.rating}</span>
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
                  <span className="font-medium">{offer.merchant.company_name}</span>
                  {!user && (
                    <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      Sign in to see location
                    </span>
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
                    <button className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors shadow-md">
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

        {/* Bottom CTA Section */}
        <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Unlock full access by signing up or downloading the app
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-lg">
            Join thousands of food lovers who are saving money while helping reduce food waste. 
            Get instant notifications for new deals near you!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a
              href="/auth?mode=signup"
              className="bg-green-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-600 transition-colors inline-flex items-center text-lg shadow-lg"
            >
              Sign Up Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </a>
            <a
              href="/download"
              className="bg-gray-900 text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors inline-flex items-center text-lg shadow-lg"
            >
              <Smartphone className="w-5 h-5 mr-2" />
              Download App
            </a>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="#"
              className="transition-transform hover:scale-105"
            >
              <img 
                src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" 
                alt="Download on the App Store" 
                className="h-12"
              />
            </a>
            <a
              href="#"
              className="transition-transform hover:scale-105"
            >
              <img 
                src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" 
                alt="Get it on Google Play" 
                className="h-12"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;