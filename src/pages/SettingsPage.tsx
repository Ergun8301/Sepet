import React from 'react';
import { Settings } from 'lucide-react';

const SettingsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
              <Settings className="w-6 h-6 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          </div>

          <div className="border-t pt-6">
            <p className="text-gray-600 text-center py-12">
              Settings will be available soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
