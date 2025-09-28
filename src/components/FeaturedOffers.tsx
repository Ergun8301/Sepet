import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Star, Heart } from 'lucide-react';

interface Offer {
  id: string;
  title: string;
  description: string;
  original_price: number;
  discounted_price: number;
  discount_percentage: number;
  image_url: string;
  merchant: {
    business_name: string;
    address: string;
    rating: number;
  };
  available_until: string;
}

const FeaturedOffers = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  // Default offers for demo
  const defaultOffers: Offer[] = [
    {
      id: '1',
      title: 'Fresh Mediterranean Bowl',
      description: 'Quinoa, grilled vegetables, feta cheese, and tahini dressing',
      original_price: 15.99,
      discounted_price: 9.99,
      discount_percentage: 38,
      image_url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
      merchant: {
        business_name: 'Green Kitchen',
        address: '123 Health St',
        rating: 4.8,
      },
      available_until: '2025-01-20T18:00:00Z',
    },
    {
      id: '2',
      title: 'Artisan Pizza Margherita',
      description: 'Hand-tossed dough, san marzano tomatoes, fresh mozzarella',
      original_price: 18.50,
      discounted_price: 12.99,
      discount_percentage: 30,
      image_url: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=400',
      merchant: {
        business_name: 'Nonna\'s Kitchen',
        address: '456 Italian Ave',
        rating: 4.9,
      },
      available_until: '2025-01-20T20:00:00Z',
    },
    {
      id: '3',
      title: 'Gourmet Burger & Fries',
      description: 'Grass-fed beef, artisan bun, crispy sweet potato fries',
      original_price: 22.00,
      discounted_price: 14.99,
      discount_percentage: 32,
      image_url: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=400',
      merchant: {
        business_name: 'Burger Craft',
        address: '789 Food Court',
        rating: 4.7,
      },
      available_until: '2025-01-20T21:00:00Z',
    },
  ];

  useEffect(() => {
    // For now, use default offers. In production, fetch from Supabase
    setOffers(defaultOffers);
    setLoading(false);
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
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-80 animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Offers</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover amazing deals from local restaurants and help reduce food waste
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                    <span className="text-sm text-gray-600">{offer.merchant.rating}</span>
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
                  <span>{offer.merchant.business_name} • {offer.merchant.address}</span>
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
                  <button className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors">
                    Order Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="/offers"
            className="bg-green-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors inline-block"
          >
            View All Offers
          </a>
        </div>
      </div>
    </div>
  );
};

export default FeaturedOffers;