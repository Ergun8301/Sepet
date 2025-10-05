import React, { useState, useEffect } from 'react';
import { Settings, Bell, Mail, MapPin, Check } from 'lucide-react';

const SettingsPage = () => {
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [nearbyOffersNotifications, setNearbyOffersNotifications] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const savedEmailNotifications = localStorage.getItem('emailNotifications');
    const savedNearbyNotifications = localStorage.getItem('nearbyOffersNotifications');

    if (savedEmailNotifications !== null) {
      setEmailNotifications(savedEmailNotifications === 'true');
    }
    if (savedNearbyNotifications !== null) {
      setNearbyOffersNotifications(savedNearbyNotifications === 'true');
    }
  }, []);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleEmailToggle = () => {
    const newValue = !emailNotifications;
    setEmailNotifications(newValue);
    localStorage.setItem('emailNotifications', String(newValue));
    setShowToast(true);
  };

  const handleNearbyToggle = () => {
    const newValue = !nearbyOffersNotifications;
    setNearbyOffersNotifications(newValue);
    localStorage.setItem('nearbyOffersNotifications', String(newValue));
    setShowToast(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {showToast && (
          <div className="fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg bg-green-500 text-white flex items-center">
            <Check className="w-5 h-5 mr-2" />
            Settings updated
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
              <Settings className="w-6 h-6 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          </div>

          <div className="border-t pt-6">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Bell className="w-5 h-5 text-green-600 mr-2" />
                Notifications
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Notify me by email</p>
                      <p className="text-sm text-gray-600">Receive email updates about your orders and offers</p>
                    </div>
                  </div>
                  <button
                    onClick={handleEmailToggle}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                      emailNotifications ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        emailNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                      <MapPin className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Notify me about nearby offers</p>
                      <p className="text-sm text-gray-600">Get alerts when new offers are available near you</p>
                    </div>
                  </div>
                  <button
                    onClick={handleNearbyToggle}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                      nearbyOffersNotifications ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        nearbyOffersNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  <strong>Note:</strong> Your notification preferences are saved locally in your browser.
                  They will apply across all your sessions on this device.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
