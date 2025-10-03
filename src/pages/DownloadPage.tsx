import React from 'react';
import { Smartphone, Download, Bell, MapPin, Star, QrCode } from 'lucide-react';

const DownloadPage = () => {
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Download the ResQ Food App</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get the best food rescue experience on your mobile device. Never miss a deal again!
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left side - QR Code and Download */}
          <div className="text-center">
            <div className="bg-white p-8 rounded-2xl shadow-lg mb-8">
              <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <QrCode className="w-24 h-24 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 mb-4">Scan to download</p>
              
              {/* Download Buttons */}
              <div className="space-y-4">
                <a
                  href="#"
                  className="bg-black text-white px-6 py-3 rounded-lg flex items-center space-x-3 hover:bg-gray-800 transition-colors w-full"
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
                  className="bg-black text-white px-6 py-3 rounded-lg flex items-center space-x-3 hover:bg-gray-800 transition-colors w-full"
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
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">4.8★</div>
                <div className="text-sm text-gray-600">App Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">50K+</div>
                <div className="text-sm text-gray-600">Downloads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">1M+</div>
                <div className="text-sm text-gray-600">Meals Saved</div>
              </div>
            </div>
          </div>

          {/* Right side - Features */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Why Download the App?
            </h2>
            
            <div className="space-y-6 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <feature.icon className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">📱 Activate Notifications</h3>
              <p className="text-green-700 text-sm">
                Enable push notifications to never miss a deal. Get alerted when your favorite restaurants post new offers!
              </p>
            </div>
          </div>
        </div>

        {/* Phone Mockup Section */}
        <div className="bg-white rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Experience ResQ Food on Mobile</h2>
          
          <div className="flex justify-center">
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

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Ready to start saving money and reducing waste?</p>
          <a
            href="/"
            className="bg-green-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors inline-block"
          >
            Explore Offers Now
          </a>
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;