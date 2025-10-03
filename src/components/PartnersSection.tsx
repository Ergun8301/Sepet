import React from 'react';

interface Partner {
  id: string;
  name: string;
  logo_url: string;
  website_url: string;
  description: string;
}

const PartnersSection = () => {
  const partners: Partner[] = [
    {
      id: '1',
      name: 'FoodTech Solutions',
      logo_url: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=200',
      website_url: 'https://example.com',
      description: 'Leading food technology platform'
    },
    {
      id: '2',
      name: 'Green Delivery',
      logo_url: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=200',
      website_url: 'https://example.com',
      description: 'Sustainable delivery solutions'
    },
    {
      id: '3',
      name: 'Organic Farms',
      logo_url: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=200',
      website_url: 'https://example.com',
      description: 'Fresh organic produce supplier'
    },
    {
      id: '4',
      name: 'Fresh Market',
      logo_url: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=200',
      website_url: 'https://example.com',
      description: 'Local fresh food marketplace'
    },
    {
      id: '5',
      name: 'Eco Foods',
      logo_url: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=200',
      website_url: 'https://example.com',
      description: 'Sustainable food solutions'
    },
    {
      id: '6',
      name: 'City Restaurants',
      logo_url: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=200',
      website_url: 'https://example.com',
      description: 'Restaurant association partner'
    }
  ];

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Partners</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We work with leading organizations to create a sustainable food ecosystem
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          {partners.map((partner) => (
            <div
              key={partner.id}
              className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group text-center"
            >
              <img
                src={partner.logo_url}
                alt={partner.name}
                className="h-12 w-full object-contain mx-auto mb-3 grayscale group-hover:grayscale-0 transition-all"
              />
              <h3 className="font-medium text-gray-900 text-sm mb-1">{partner.name}</h3>
              <p className="text-xs text-gray-500">{partner.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Become a Partner</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join our network of partners working together to reduce food waste and create sustainable food solutions. 
            Let's make a bigger impact together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/partners/apply"
              className="bg-green-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
            >
              Apply for Partnership
            </a>
            <a
              href="/partners"
              className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnersSection;