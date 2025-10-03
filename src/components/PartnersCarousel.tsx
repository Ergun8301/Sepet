import React from 'react';

const PartnersCarousel = () => {
  const partners = [
    'FoodTech Solutions',
    'Green Delivery',
    'Organic Farms',
    'Fresh Market',
    'Eco Foods',
    'City Restaurants',
    'Sustainable Eats',
    'Local Harvest',
    'Farm to Table',
    'Green Kitchen Co'
  ];

  return (
    <div className="bg-gray-100 py-3 overflow-hidden border-b">
      <div className="animate-scroll flex items-center space-x-12 whitespace-nowrap">
        {[...partners, ...partners, ...partners].map((partner, index) => (
          <span key={index} className="text-gray-600 font-medium flex-shrink-0">
            {partner}
          </span>
        ))}
      </div>
    </div>
  );
};

export default PartnersCarousel;