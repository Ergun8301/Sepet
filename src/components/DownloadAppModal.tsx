import React, { useState } from 'react';
import { X, Smartphone, QrCode } from 'lucide-react';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DownloadAppModal: React.FC<DownloadAppModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('https://formspree.io/f/xeovowdl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          subject: 'KapKurtar - Notification lancement app',
          message: `Nouvel utilisateur souhaite être notifié : ${email}`
        })
      });

      if (response.ok) {
        setIsSubmitted(true);
        setEmail('');
        setTimeout(() => {
          setIsSubmitted(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Erreur Formspree:', error);
      alert('Erreur lors de l\'envoi. Réessayez.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-[#39e3cf] mb-2">
              KapKurtar'ı İndirin
            </h2>
            <p className="text-gray-600 text-lg">
              Yakınınızdaki gıdayı kurtarın
            </p>
          </div>

          {/* QR Code Placeholder */}
          <div className="mb-6 flex justify-center">
            <div className="w-48 h-48 bg-gray-200 rounded-xl flex flex-col items-center justify-center border-2 border-gray-300">
              <QrCode className="w-16 h-16 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500 font-medium">QR Kod</span>
              <span className="text-xs text-gray-400">Yakında</span>
            </div>
          </div>

          {/* App Store Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              disabled
              className="bg-gray-300 text-gray-500 px-4 py-3 rounded-lg font-medium cursor-not-allowed opacity-60 flex items-center justify-center space-x-2 transition-all"
            >
              <span className="text-2xl">📱</span>
              <span className="text-sm">iPhone İçin</span>
            </button>
            <button
              disabled
              className="bg-gray-300 text-gray-500 px-4 py-3 rounded-lg font-medium cursor-not-allowed opacity-60 flex items-center justify-center space-x-2 transition-all"
            >
              <span className="text-2xl">🤖</span>
              <span className="text-sm">Android İçin</span>
            </button>
          </div>

          {/* Coming Soon Text */}
          <p className="text-center text-sm italic text-gray-500 mb-6">
            iOS ve Android'de yakında kullanılabilir
          </p>

          {/* Email Notification Form */}
          <div className="border-t border-gray-200 pt-6">
            <p className="text-center text-sm text-gray-600 mb-4">
              Uygulama yayınlandığında bilgilendirilme
            </p>
            <form onSubmit={handleEmailSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@ornek.com"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39e3cf] focus:border-transparent transition-all"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#39e3cf] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#e2fd66] transition-colors duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Gönderiliyor...' : isSubmitted ? '✓ Teşekkürler!' : 'Beni Bilgilendir'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadAppModal;
