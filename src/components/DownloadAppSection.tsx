import React from 'react';
import { Smartphone, Download, Star, Bell, MapPin } from 'lucide-react';

const DownloadAppSection = () => {
  const features = [
    {
      icon: Bell,
      title: 'Real-time Notifications',
      description: 'Get instant alerts when new offers are available near you'
    },
    {
      icon: MapPin,
      title: 'Location-based Offers',
      description: 'Find the best deals from restaurants in your area'
    },
    {
      icon: Star,
      title: 'Exclusive App Deals',
      description: 'Access special offers only available on mobile'
    }
  ];

  return (
    <div className="bg-gradient-to-br from-green-500 to-green-600 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <div className="text-white">
            <h2 className="text-4xl font-bold mb-6">
              Download Our App
            </h2>
            <p className="text-xl text-green-100 mb-8">
              Get the best food rescue experience on your mobile device. Save more, waste less, and discover amazing local restaurants wherever you go.
            </p>

            {/* Features */}
            <div className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{feature.title}</h3>
                    <p className="text-green-100 text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Download Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#"
                className="bg-black text-white px-6 py-3 rounded-lg flex items-center space-x-3 hover:bg-gray-800 transition-colors"
              >
                <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
                  <span className="text-black font-bold text-sm">📱</span>
                </div>
                <div className="text-left">
                  <div className="text-xs text-gray-300">Download on the</div>
                  <div className="font-semibold">App Store</div>
                </div>
              </a>
              
              <a
                href="#"
                className="bg-black text-white px-6 py-3 rounded-lg flex items-center space-x-3 hover:bg-gray-800 transition-colors"
              >
                <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
                  <span className="text-black font-bold text-sm">▶️</span>
                </div>
                <div className="text-left">
                  <div className="text-xs text-gray-300">Get it on</div>
                  <div className="font-semibold">Google Play</div>
                </div>
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-green-400">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">4.8★</div>
                <div className="text-sm text-green-100">App Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">50K+</div>
                <div className="text-sm text-green-100">Downloads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">1M+</div>
                <div className="text-sm text-green-100">Meals Saved</div>
              </div>
            </div>
          </div>

          {/* Right side - Phone mockup */}
          <div className="relative">
            <div className="relative mx-auto w-64 h-96 bg-gray-900 rounded-3xl p-2 shadow-2xl">
              <div className="w-full h-full bg-white rounded-2xl overflow-hidden relative">
                {/* Phone screen content */}
                <div className="bg-gradient-to-br from-green-400 to-green-500 h-24 flex items-center justify-center">
                  <div className="flex items-center space-x-2 text-white">
                    <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">R</span>
                    </div>
                    <span className="font-bold text-lg">ResQ Food</span>
                  </div>
                </div>
                
                <div className="p-4 space-y-3">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 bg-green-500 rounded-full"></div>
                      <div>
                        <div className="h-2 bg-gray-300 rounded w-20"></div>
                        <div className="h-2 bg-gray-200 rounded w-16 mt-1"></div>
                      </div>
                    </div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                  
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                      <div>
                        <div className="h-2 bg-gray-300 rounded w-24"></div>
                        <div className="h-2 bg-gray-200 rounded w-12 mt-1"></div>
                      </div>
                    </div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                </div>

                {/* Floating notification */}
                <div className="absolute top-32 left-2 right-2 bg-white rounded-lg shadow-lg p-3 border-l-4 border-green-500">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-green-500" />
                    <div>
                      <div className="text-xs font-semibold text-gray-900">New offer nearby!</div>
                      <div className="text-xs text-gray-600">50% off at Green Kitchen</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 bg-white rounded-full p-3 shadow-lg">
              <Download className="w-6 h-6 text-green-500" />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white rounded-full p-3 shadow-lg">
              <Smartphone className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadAppSection;