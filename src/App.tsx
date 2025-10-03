import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import MerchantsPage from './pages/MerchantsPage';
import DownloadPage from './pages/DownloadPage';
import AuthPage from './pages/AuthPage';
import CustomerOnboardingPage from './pages/CustomerOnboardingPage';
import MerchantOnboardingPage from './pages/MerchantOnboardingPage';
import CustomerAppPage from './pages/CustomerAppPage';
import MerchantDashboardPage from './pages/MerchantDashboardPage';
import DevTestPage from './pages/DevTestPage';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/offers" element={<ExplorePage />} />
            <Route path="/merchants" element={<MerchantsPage />} />
            <Route path="/download" element={<DownloadPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/onboarding/customer" element={<CustomerOnboardingPage />} />
            <Route path="/onboarding/merchant" element={<MerchantOnboardingPage />} />
            <Route path="/app" element={<CustomerAppPage />} />
            <Route path="/merchant/dashboard" element={<MerchantDashboardPage />} />
            <Route path="/dev" element={<DevTestPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;