import React from 'react';

const PartnersCarousel = () => {
  const partners = [
    {
      name: 'FoodTech Solutions',
      logo: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      name: 'Green Delivery',
      logo: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      name: 'Organic Farms',
      logo: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      name: 'Fresh Market',
      logo: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      name: 'Eco Foods',
      logo: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      name: 'City Restaurants',
      logo: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      name: 'Sustainable Eats',
      logo: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      name: 'Local Harvest',
      logo: 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=150'
    }
  ];

  return (
    <div className="bg-white py-8 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <p className="text-sm text-gray-500 font-medium">Trusted by leading food partners</p>
        </div>
        <div className="overflow-hidden">
          <div className="animate-slide flex items-center space-x-12 whitespace-nowrap">
            {[...partners, ...partners, ...partners].map((partner, index) => (
              <div key={index} className="flex items-center space-x-3 flex-shrink-0">
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="text-gray-700 font-medium text-sm">{partner.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnersCarousel;