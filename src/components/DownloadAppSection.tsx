import React from 'react';
import { Smartphone, Download, QrCode } from 'lucide-react';

const DownloadAppSection = () => {
  return (
    <div className="bg-gradient-to-br from-green-500 to-green-600 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <div className="text-white">
            <h2 className="text-4xl font-bold mb-6">
              Download Our App
            </h2>
            <p className="text-xl text-green-100 mb-8">
              Get the best food rescue experience on your mobile device. Activate notifications 
              to never miss a deal from your favorite restaurants.
            </p>

            {/* Download Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <a
                href="#"
                className="bg-black text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors"
              >
                <img 
                  src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" 
                  alt="Download on the App Store" 
                  className="h-10"
                />
              </a>
              
              <a
                href="#"
                className="bg-transparent p-1 rounded-lg flex items-center justify-center hover:bg-white hover:bg-opacity-10 transition-colors"
              >
                <img 
                  src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" 
                  alt="Get it on Google Play" 
                  className="h-14"
                />
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
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

          {/* Right side - QR Code and Phone */}
          <div className="text-center">
            <div className="bg-white rounded-2xl p-8 shadow-2xl inline-block">
              <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <QrCode className="w-24 h-24 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">Scan to download</p>
            </div>
            
            <div className="mt-6">
              <a
                href="/download"
                className="bg-white text-green-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors inline-flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Page
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadAppSection;