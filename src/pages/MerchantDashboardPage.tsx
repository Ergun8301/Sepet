import React, { useState, useEffect } from 'react';
import { Plus, X, Upload, Package, Clock, Star, Pause, Play, CreditCard as Edit2, Trash2, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';
import { useAddProduct } from '../contexts/AddProductContext';

interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  oldPrice: number;
  newPrice: number;
  startDate: string;
  endDate: string;
  quantity: number;
  status: 'active' | 'paused' | 'expired';
  rating: number;
  reviews: number;
}

const MerchantDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showAddProductModal, openAddProductModal, closeAddProductModal } = useAddProduct();
  const [merchantProfile, setMerchantProfile] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    oldPrice: '',
    newPrice: '',
    startDate: '',
    endDate: '',
    quantity: ''
  });

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
      const { data: profile } = await supabase
        .from('merchants')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      setMerchantProfile(profile);

      setProducts([
        {
          id: '1',
          name: 'Fresh Croissants Box',
          description: '6 buttery croissants from this morning',
          image: 'https://images.pexels.com/photos/2135677/pexels-photo-2135677.jpeg?auto=compress&cs=tinysrgb&w=400',
          oldPrice: 12.00,
          newPrice: 7.20,
          startDate: '2025-10-05T08:00',
          endDate: '2025-10-05T18:00',
          quantity: 8,
          status: 'active',
          rating: 4.8,
          reviews: 24
        },
        {
          id: '2',
          name: 'Organic Salad Bowl',
          description: 'Fresh mixed greens with seasonal vegetables',
          image: 'https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg?auto=compress&cs=tinysrgb&w=400',
          oldPrice: 9.50,
          newPrice: 5.70,
          startDate: '2025-10-05T11:00',
          endDate: '2025-10-05T15:00',
          quantity: 5,
          status: 'active',
          rating: 4.6,
          reviews: 18
        },
        {
          id: '3',
          name: 'Artisan Bread Loaf',
          description: 'Whole grain sourdough bread',
          image: 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=400',
          oldPrice: 5.00,
          newPrice: 3.00,
          startDate: '2025-10-04T08:00',
          endDate: '2025-10-04T20:00',
          quantity: 0,
          status: 'expired',
          rating: 4.9,
          reviews: 42
        }
      ]);
    } catch (error) {
      console.error('Error loading merchant data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscount = () => {
    const old = parseFloat(formData.oldPrice);
    const newP = parseFloat(formData.newPrice);
    if (old && newP && old > newP) {
      return Math.round(((old - newP) / old) * 100);
    }
    return 0;
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
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = () => {
    const newProduct: Product = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      image: formData.image || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
      oldPrice: parseFloat(formData.oldPrice),
      newPrice: parseFloat(formData.newPrice),
      startDate: formData.startDate,
      endDate: formData.endDate,
      quantity: parseInt(formData.quantity),
      status: 'active',
      rating: 0,
      reviews: 0
    };

    setProducts([newProduct, ...products]);
    closeAddProductModal();
    setFormData({
      name: '',
      description: '',
      image: '',
      oldPrice: '',
      newPrice: '',
      startDate: '',
      endDate: '',
      quantity: ''
    });
    setToast({ message: 'Product published successfully!', type: 'success' });
  };

  const toggleProductStatus = (productId: string) => {
    setProducts(products.map(p =>
      p.id === productId
        ? { ...p, status: p.status === 'active' ? 'paused' : 'active' }
        : p
    ));
    setToast({ message: 'Product status updated', type: 'success' });
  };

  const deleteProduct = (productId: string) => {
    setProducts(products.filter(p => p.id !== productId));
    setToast({ message: 'Product deleted', type: 'success' });
  };

  const shareProduct = (platform: string, product: Product) => {
    const url = `https://resqfood.com/product/${product.id}`;
    const text = `Check out ${product.name} at ${Math.round(((product.oldPrice - product.newPrice) / product.oldPrice) * 100)}% off!`;

    let shareUrl = '';
    switch(platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'instagram':
        setToast({ message: 'Copy link to share on Instagram', type: 'success' });
        navigator.clipboard.writeText(url);
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
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
            <p className="text-gray-600 mt-1">{products.length} total products</p>
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
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative h-48">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                  {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>

                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-xs text-gray-500 line-through">${product.oldPrice.toFixed(2)}</span>
                      <span className="text-lg font-bold text-green-600">${product.newPrice.toFixed(2)}</span>
                    </div>
                    <span className="text-xs font-medium text-green-600">
                      -{Math.round(((product.oldPrice - product.newPrice) / product.oldPrice) * 100)}% off
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-yellow-500 mb-1">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium ml-1">{product.rating || 'New'}</span>
                    </div>
                    {product.reviews > 0 && (
                      <span className="text-xs text-gray-500">{product.reviews} reviews</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm mb-4">
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{calculateTimeLeft(product.endDate)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Package className="w-4 h-4 mr-1" />
                    <span>{product.quantity} left</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleProductStatus(product.id)}
                    className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      product.status === 'active'
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                    disabled={product.status === 'expired'}
                  >
                    {product.status === 'active' ? (
                      <><Pause className="w-4 h-4 mr-1" /> Pause</>
                    ) : (
                      <><Play className="w-4 h-4 mr-1" /> Activate</>
                    )}
                  </button>
                  <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 font-medium">Share:</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => shareProduct('whatsapp', product)}
                        className="p-2 bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors"
                        title="WhatsApp"
                      >
                        <Share2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => shareProduct('facebook', product)}
                        className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                        title="Facebook"
                      >
                        <Share2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => shareProduct('instagram', product)}
                        className="p-2 bg-pink-100 text-pink-600 rounded hover:bg-pink-200 transition-colors"
                        title="Instagram"
                      >
                        <Share2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
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
                  name="name"
                  value={formData.name}
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
                  {formData.image ? (
                    <div className="relative">
                      <img src={formData.image} alt="Preview" className="max-h-48 mx-auto rounded" />
                      <button
                        onClick={() => setFormData({ ...formData, image: '' })}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Original Price ($)</label>
                  <input
                    type="number"
                    name="oldPrice"
                    value={formData.oldPrice}
                    onChange={handleInputChange}
                    placeholder="12.00"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sale Price ($)</label>
                  <input
                    type="number"
                    name="newPrice"
                    value={formData.newPrice}
                    onChange={handleInputChange}
                    placeholder="7.20"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {calculateDiscount() > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-800 font-medium">
                    Discount: {calculateDiscount()}% off
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date & Time</label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity Available</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="10"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Location:</strong> {merchantProfile?.address || 'Will be set from your profile'}
                </p>
              </div>

              <button
                onClick={handlePublish}
                disabled={!formData.name || !formData.oldPrice || !formData.newPrice || !formData.quantity}
                className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Publish Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchantDashboardPage;
