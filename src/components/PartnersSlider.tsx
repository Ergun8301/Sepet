import React, { useState, useEffect } from 'react';

interface Partner {
  id: string;
  name: string;
  logo_url: string;
  website_url: string;
}

const PartnersSlider = () => {
  const [partners, setPartners] = useState<Partner[]>([]);

  // Default partners if database is not available
  const defaultPartners: Partner[] = [
    {
      id: '1',
      name: 'FoodTech Solutions',
      logo_url: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=200',
      website_url: 'https://example.com',
    },
    {
      id: '2',
      name: 'Green Delivery',
      logo_url: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=200',
      website_url: 'https://example.com',
    },
    {
      id: '3',
      name: 'Organic Farms',
      logo_url: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=200',
      website_url: 'https://example.com',
    },
    {
      id: '4',
      name: 'Fresh Market',
      logo_url: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=200',
      website_url: 'https://example.com',
    },
    {
      id: '5',
      name: 'Eco Foods',
      logo_url: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=200',
      website_url: 'https://example.com',
    },
  ];

  useEffect(() => {
    // For now, use default partners. In production, fetch from Supabase
    setPartners(defaultPartners);
  }, []);

  if (partners.length === 0) return null;

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Our Partners</h2>
          <p className="text-gray-600">Trusted by leading food businesses</p>
        </div>
        
        <div className="relative overflow-hidden">
          <div className="animate-slide flex items-center space-x-8">
            {[...partners, ...partners].map((partner, index) => (
              <div
                key={`${partner.id}-${index}`}
                className="flex-shrink-0 bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <img
                  src={partner.logo_url}
                  alt={partner.name}
                  className="h-12 w-24 object-contain mx-auto grayscale hover:grayscale-0 transition-all"
                />
                <p className="text-center text-sm text-gray-600 mt-2 font-medium">
                  {partner.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnersSlider;