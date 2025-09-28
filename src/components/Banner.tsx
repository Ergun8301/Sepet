import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BannerSlide {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  cta_text: string;
  cta_link: string;
}

const Banner = () => {
  const [slides, setSlides] = useState<BannerSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  // Default slides if database is not available
  const defaultSlides: BannerSlide[] = [
    {
      id: '1',
      title: 'Save money, save food together',
      subtitle: 'Discover amazing deals on delicious meals and help reduce food waste',
      image_url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1200',
      cta_text: 'Explore Offers',
      cta_link: '/offers',
    },
    {
      id: '2',
      title: 'Fresh ingredients daily',
      subtitle: 'Partner with us to reach more customers and grow your business',
      image_url: 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=1200',
      cta_text: 'Join as Merchant',
      cta_link: '/auth',
    },
  ];

  useEffect(() => {
    // For now, use default slides. In production, fetch from Supabase
    setSlides(defaultSlides);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (loading) {
    return (
      <div className="relative h-96 bg-gray-200 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-300 to-gray-400"></div>
      </div>
    );
  }

  if (slides.length === 0) return null;

  const currentSlideData = slides[currentSlide];

  return (
    <div className="relative h-96 md:h-[500px] lg:h-[600px] overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: `url(${currentSlideData.image_url})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center justify-center">
        <div className="text-center text-white px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            {currentSlideData.title.split(' ').map((word, index) => (
              <span
                key={index}
                className={word.toLowerCase() === 'save' || word.toLowerCase() === 'together' ? 'text-green-400' : ''}
              >
                {word}{' '}
              </span>
            ))}
          </h1>
          <p className="text-lg md:text-xl mb-8 text-gray-200 max-w-2xl mx-auto">
            {currentSlideData.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={currentSlideData.cta_link}
              className="bg-green-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
            >
              {currentSlideData.cta_text}
            </a>
            <a
              href="/merchants"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-gray-900 transition-colors"
            >
              For Merchants
            </a>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Banner;