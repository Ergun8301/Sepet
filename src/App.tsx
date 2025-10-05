import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import CustomerTeaserPage from './pages/CustomerTeaserPage';
import CustomerOffersPage from './pages/CustomerOffersPage';
import CustomerAuthPage from './pages/CustomerAuthPage';
import MerchantAuthPage from './pages/MerchantAuthPage';
import MerchantInfoPage from './pages/MerchantInfoPage';
import MerchantsPage from './pages/MerchantsPage';
import DownloadPage from './pages/DownloadPage';
import CustomerOnboardingPage from './pages/CustomerOnboardingPage';
import MerchantOnboardingPage from './pages/MerchantOnboardingPage';
import CustomerAppPage from './pages/CustomerAppPage';
import MerchantDashboardPage from './pages/MerchantDashboardPage';
import MerchantProfilePage from './pages/MerchantProfilePage';
import MerchantSettingsPage from './pages/MerchantSettingsPage';
import DevTestPage from './pages/DevTestPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/customer/teaser" element={<CustomerTeaserPage />} />
            <Route path="/offers" element={<CustomerOffersPage />} />
            <Route path="/customer/auth" element={<CustomerAuthPage />} />
            <Route path="/merchant/auth" element={<MerchantAuthPage />} />
            <Route path="/merchant/info" element={<MerchantInfoPage />} />
            <Route path="/merchants" element={<MerchantsPage />} />
            <Route path="/download" element={<DownloadPage />} />
            <Route path="/onboarding/customer" element={<CustomerOnboardingPage />} />
            <Route path="/onboarding/merchant" element={<MerchantOnboardingPage />} />
            <Route path="/app" element={<CustomerAppPage />} />
            <Route path="/merchant/dashboard" element={<MerchantDashboardPage />} />
            <Route path="/merchant/profile" element={<MerchantProfilePage />} />
            <Route path="/merchant/settings" element={<MerchantSettingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/dev" element={<DevTestPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;