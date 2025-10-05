import React, { useState, useEffect } from 'react';
import { Plus, X, Upload, Package, Clock, Star, Pause, Play, CreditCard as Edit2, Trash2, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';
import { useAddProduct } from '../contexts/AddProductContext';
import { uploadImage } from '../lib/uploadImage';

interface Offer {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  price_before: number;
  price_after: number;
  discount_percent: number | null;
  available_from: string;
  available_until: string;
  is_active: boolean;
  created_at: string;
}

const MerchantDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showAddProductModal, openAddProductModal, closeAddProductModal } = useAddProduct();
  const [merchantProfile, setMerchantProfile] = useState<any>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: null as File | null,
    imagePreview: '',
    price_before: '',
    price_after: '',
    available_from: '',
    available_until: ''
  });
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    loadMerchantData();
  }, [user]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const loadMerchantData = async () => {
    if (!user) return;

    try {
      const [profileResult, offersResult] = await Promise.all([
        supabase.from('merchants').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('offers').select('*').eq('merchant_id', user.id).order('created_at', { ascending: false })
      ]);

      if (profileResult.data) setMerchantProfile(profileResult.data);
      if (offersResult.data) setOffers(offersResult.data);
      if (offersResult.error) throw offersResult.error;
    } catch (error: any) {
      console.error('Error loading merchant data:', error);
      setToast({ message: error.message || 'Failed to load data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getOfferStatus = (offer: Offer): 'active' | 'paused' | 'expired' => {
    const now = new Date();
    const availableUntil = new Date(offer.available_until);
    
    if (now > availableUntil) return 'expired';
    if (!offer.is_active) return 'paused';
    return 'active';
  };

  const calculateTimeLeft = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();

    if (diff < 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''} left`;
    }
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imagePreview: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = async () => {
    if (!user) return;

    setIsPublishing(true);
    try {
      let imageUrl = null;
      if (formData.image) {
        imageUrl = await uploadImage(formData.image, `offer-images/${user.id}/${Date.now()}`);
      }

      const { data, error } = await supabase.from('offers').insert([{
        merchant_id: user.id,
        title: formData.title,
        description: formData.description,
        image_url: imageUrl,
        price_before: parseFloat(formData.price_before),
        price_after: parseFloat(formData.price_after),
        available_from: formData.available_from,
        available_until: formData.available_until,
        is_active: true
      }]).select().single();

      if (error) throw error;

      setOffers([data, ...offers]);
      closeAddProductModal();
      setFormData({
        title: '',
        description: '',
        image: null,
        imagePreview: '',
        price_before: '',
        price_after: '',
        available_from: '',
        available_until: ''
      });
      setToast({ message: 'Product published successfully!', type: 'success' });
    } catch (error: any) {
      console.error('Error publishing product:', error);
      setToast({ message: error.message || 'Failed to publish product', type: 'error' });
    } finally {
      setIsPublishing(false);
    }
  };

  const toggleOfferStatus = async (offerId: string, currentStatus: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('offers')
        .update({ is_active: !currentStatus })
        .eq('id', offerId)
        .eq('merchant_id', user.id);

      if (error) throw error;

      setOffers(offers.map(o => o.id === offerId ? { ...o, is_active: !currentStatus } : o));
      setToast({ message: 'Product status updated', type: 'success' });
    } catch (error: any) {
      console.error('Error updating offer status:', error);
      setToast({ message: error.message || 'Failed to update status', type: 'error' });
    }
  };

  const deleteOffer = async (offerId: string) => {
    if (!user || !confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('offers')
        .delete()
        .eq('id', offerId)
        .eq('merchant_id', user.id);

      if (error) throw error;

      setOffers(offers.filter(o => o.id !== offerId));
      setToast({ message: 'Product deleted', type: 'success' });
    } catch (error: any) {
      console.error('Error deleting offer:', error);
      setToast({ message: error.message || 'Failed to delete product', type: 'error' });
    }
  };

  const shareOffer = (offer: Offer) => {
    const text = `${offer.title} - ${offer.discount_percent}% off! Only ${offer.price_after}€`;
    navigator.clipboard.writeText(text);
    setToast({ message: 'Product details copied to clipboard', type: 'success' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {toast.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Products</h2>
            <p className="text-gray-600 mt-1">{offers.length} total products</p>
          </div>
          <button
            onClick={openAddProductModal}
            className="flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Product
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map(offer => {
            const status = getOfferStatus(offer);
            return (
              <div key={offer.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-48">
                  <img
                    src={offer.image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400'}
                    alt={offer.title}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{offer.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{offer.description}</p>

                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-xs text-gray-500 line-through">{offer.price_before.toFixed(2)}€</span>
                        <span className="text-lg font-bold text-green-600">{offer.price_after.toFixed(2)}€</span>
                      </div>
                      <span className="text-xs font-medium text-green-600">
                        -{offer.discount_percent}% off
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm mb-4">
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{calculateTimeLeft(offer.available_until)}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleOfferStatus(offer.id, offer.is_active)}
                      className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        status === 'active'
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : status === 'paused'
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={status === 'expired'}
                    >
                      {status === 'active' ? (
                        <><Pause className="w-4 h-4 mr-1" /> Pause</>
                      ) : (
                        <><Play className="w-4 h-4 mr-1" /> Activate</>
                      )}
                    </button>
                    <button
                      onClick={() => deleteOffer(offer.id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => shareOffer(offer)}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {offers.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
            <p className="text-gray-600 mb-6">Get started by adding your first product</p>
            <button
              onClick={openAddProductModal}
              className="inline-flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Product
            </button>
          </div>
        )}
      </div>

      {showAddProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
              <button
                onClick={closeAddProductModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Fresh Croissants Box"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your product..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {formData.imagePreview ? (
                    <div className="relative">
                      <img src={formData.imagePreview} alt="Preview" className="max-h-48 mx-auto rounded" />
                      <button
                        onClick={() => setFormData({ ...formData, image: null, imagePreview: '' })}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click to upload image</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Original Price (€)</label>
                  <input
                    type="number"
                    name="price_before"
                    value={formData.price_before}
                    onChange={handleInputChange}
                    placeholder="12.00"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sale Price (€)</label>
                  <input
                    type="number"
                    name="price_after"
                    value={formData.price_after}
                    onChange={handleInputChange}
                    placeholder="7.20"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    name="available_from"
                    value={formData.available_from}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date & Time</label>
                  <input
                    type="datetime-local"
                    name="available_until"
                    value={formData.available_until}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Location:</strong> {merchantProfile?.street}, {merchantProfile?.city}
                </p>
              </div>

              <button
                onClick={handlePublish}
                disabled={isPublishing || !formData.title || !formData.price_before || !formData.price_after}
                className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPublishing ? 'Publishing...' : 'Publish Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchantDashboardPage;
