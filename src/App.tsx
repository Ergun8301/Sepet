import React from 'react';
import Header from './components/Header';
import PartnersCarousel from './components/PartnersCarousel';
import Banner from './components/Banner';
import PromoBanner from './components/PromoBanner';
import FeaturedOffers from './components/FeaturedOffers';
import AboutSection from './components/AboutSection';
import FAQSection from './components/FAQSection';
import BlogSection from './components/BlogSection';
import MerchantReviewsSection from './components/MerchantReviewsSection';
import PartnersSection from './components/PartnersSection';
import DownloadAppSection from './components/DownloadAppSection';
import MerchantsSection from './components/MerchantsSection';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Promotional Banner */}
      <PromoBanner />
      
      {/* Header */}
      <Header />
      
      {/* Partners Carousel */}
      <PartnersCarousel />
      
      {/* Hero Section */}
      <section id="hero">
        <Banner />
      </section>
      
      {/* Offers Section */}
      <section id="offers">
        <FeaturedOffers />
      </section>
      
      {/* Merchants Section */}
      <section id="merchants">
        <MerchantsSection />
      </section>
      
      {/* About Us Section */}
      <section id="about">
        <AboutSection />
      </section>
      
      {/* FAQ Section */}
      <section id="faq">
        <FAQSection />
      </section>
      
      {/* Blog Section */}
      <section id="blog">
        <BlogSection />
      </section>
      
      {/* Merchant Reviews Section */}
      <section id="reviews">
        <MerchantReviewsSection />
      </section>
      
      {/* Partners Section */}
      <section id="partners">
        <PartnersSection />
      </section>
      
      {/* Download App Section */}
      <section id="download-app">
        <DownloadAppSection />
      </section>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;