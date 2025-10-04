import React from 'react';
import { Search, ShoppingCart, MapPin } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: Search,
      title: 'Discover Offers',
      description: 'Browse amazing deals from local restaurants near you. Find discounted meals from your favorite places.',
      step: '01'
    },
    {
      icon: ShoppingCart,
      title: 'Reserve Your Meal',
      description: 'Select the offers you want and reserve them instantly. Pay securely through our platform.',
      step: '02'
    },
    {
      icon: MapPin,
      title: 'Pick Up & Enjoy',
      description: 'Head to the restaurant at your chosen time, pick up your meal, and enjoy delicious food at great prices.',
      step: '03'
    }
  ];

  return (
    <div className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Save money and reduce food waste in three simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center relative">
              {/* Step Number */}
              <div className="absolute -top-4 -left-4 bg-green-500 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg z-10">
                {step.step}
              </div>
              
              {/* Card */}
              <div className="bg-gray-50 rounded-xl p-8 hover:bg-gray-100 transition-colors h-full">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <step.icon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-green-200 transform -translate-y-1/2"></div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="/customer/teaser"
            className="bg-green-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors inline-block"
          >
            Start Saving Now
          </a>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;