import React from 'react';
import Header from './components/Header';
import Banner from './components/Banner';
import PromoBanner from './components/PromoBanner';
import PartnersSlider from './components/PartnersSlider';
import FeaturedOffers from './components/FeaturedOffers';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Promotional Banner */}
      <PromoBanner />
      
      {/* Header */}
      <Header />
      
      {/* Main Hero Banner */}
      <Banner />
      
      {/* Partners Slider */}
      <PartnersSlider />
      
      {/* Featured Offers */}
      <FeaturedOffers />
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;