import React from 'react';
import { Smartphone, Download } from 'lucide-react';

const AppDownloadCTA = () => {
  return (
    <div className="bg-gradient-to-r from-green-500 to-green-600 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Smartphone className="w-8 h-8 text-white mr-3" />
            <h3 className="text-2xl font-bold text-white">Get notified instantly. Download our app today.</h3>
          </div>
          <p className="text-green-100 mb-6 text-lg">
            Never miss a deal from your favorite restaurants. Get push notifications for new offers near you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/download"
              className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center"
            >
              <Download className="w-5 h-5 mr-2" />
              Download App
            </a>
            <a
              href="#"
              className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors inline-flex items-center"
            >
              <img 
                src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" 
                alt="Download on the App Store" 
                className="h-8"
              />
            </a>
            <a
              href="#"
              className="bg-transparent p-2 rounded-lg hover:bg-gray-100 transition-colors inline-flex items-center"
            >
              <img 
                src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" 
                alt="Get it on Google Play" 
                className="h-12"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppDownloadCTA;