import React from 'react';
import { Star, MapPin, Clock, Award } from 'lucide-react';

const MerchantsSection = () => {
  const merchants = [
    {
      id: '1',
      name: 'Green Kitchen',
      description: 'Healthy, organic meals made with locally sourced ingredients',
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.8,
      reviews: 124,
      address: '123 Health St',
      verified: true,
      specialties: ['Organic', 'Vegan', 'Gluten-Free']
    },
    {
      id: '2',
      name: 'Nonna\'s Kitchen',
      description: 'Authentic Italian cuisine with traditional family recipes',
      image: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.9,
      reviews: 89,
      address: '456 Italian Ave',
      verified: true,
      specialties: ['Italian', 'Pizza', 'Pasta']
    },
    {
      id: '3',
      name: 'Burger Craft',
      description: 'Gourmet burgers made with premium grass-fed beef',
      image: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.7,
      reviews: 156,
      address: '789 Food Court',
      verified: true,
      specialties: ['Burgers', 'American', 'Craft Beer']
    }
  ];

  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Merchants</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover amazing restaurants and food businesses in your area
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {merchants.map((merchant) => (
            <div key={merchant.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
              <div className="relative">
                <img
                  src={merchant.image}
                  alt={merchant.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {merchant.verified && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white p-2 rounded-full">
                    <Award className="w-4 h-4" />
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{merchant.name}</h3>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">{merchant.rating}</span>
                    <span className="text-sm text-gray-400">({merchant.reviews})</span>
                  </div>
                </div>

                <p className="text-gray-600 mb-3 text-sm">{merchant.description}</p>

                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{merchant.address}</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {merchant.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-green-600">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>Open now</span>
                  </div>
                  <button className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors">
                    View Menu
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="/merchants"
            className="bg-green-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors inline-block"
          >
            View All Merchants
          </a>
        </div>
      </div>
    </div>
  );
};

export default MerchantsSection;