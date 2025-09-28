import React from 'react';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-2">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="font-bold text-xl">ResQ Food</span>
            </div>
            <p className="text-gray-300 mb-4">
              Connecting people with delicious food while reducing waste and supporting local businesses.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-green-400 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-green-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-green-400 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-300 hover:text-green-400 transition-colors">Home</a></li>
              <li><a href="/offers" className="text-gray-300 hover:text-green-400 transition-colors">Offers</a></li>
              <li><a href="/merchants" className="text-gray-300 hover:text-green-400 transition-colors">Merchants</a></li>
              <li><a href="/blog" className="text-gray-300 hover:text-green-400 transition-colors">Blog</a></li>
              <li><a href="/about" className="text-gray-300 hover:text-green-400 transition-colors">About Us</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="/faq" className="text-gray-300 hover:text-green-400 transition-colors">FAQ</a></li>
              <li><a href="/contact" className="text-gray-300 hover:text-green-400 transition-colors">Contact Us</a></li>
              <li><a href="/help" className="text-gray-300 hover:text-green-400 transition-colors">Help Center</a></li>
              <li><a href="/privacy" className="text-gray-300 hover:text-green-400 transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="text-gray-300 hover:text-green-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-green-400 mr-3" />
                <span className="text-gray-300">info@resqfood.com</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-green-400 mr-3" />
                <span className="text-gray-300">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-green-400 mr-3 mt-1" />
                <span className="text-gray-300">
                  123 Green Street<br />
                  Food District<br />
                  City, State 12345
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300 text-sm">
              © {currentYear} ResQ Food. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="/privacy" className="text-gray-300 hover:text-green-400 text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="text-gray-300 hover:text-green-400 text-sm transition-colors">
                Terms of Service
              </a>
              <a href="/cookies" className="text-gray-300 hover:text-green-400 text-sm transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;