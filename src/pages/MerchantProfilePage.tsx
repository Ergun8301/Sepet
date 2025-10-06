import React, { useState, useEffect } from 'react';
import { Store, Mail, Phone, MapPin, FileText, Camera, Save, User as UserIcon, Globe, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';
import { uploadImageToSupabase } from '../lib/uploadImage';

interface MerchantProfile {
  company_name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  street: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  description: string | null;
  logo_url: string | null;
}

const MerchantProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<MerchantProfile | null>(null);
  const [editedProfile, setEditedProfile] = useState<MerchantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadProfile();
  }, [user]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('merchants')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const profileData: MerchantProfile = {
          company_name: data.company_name,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          street: data.street,
          city: data.city,
          postal_code: data.postal_code,
          country: data.country,
          description: data.description,
          logo_url: data.logo_url
        };
        setProfile(profileData);
        setEditedProfile(profileData);
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
      setToast({ message: error.message || 'Failed to load profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedProfile(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const MAX_SIZE = 5 * 1024 * 1024;
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/avif'];

    if (file.size > MAX_SIZE) {
      setToast({ message: 'Image trop volumineuse (max. 5 Mo). Réduis la taille ou compresse-la avant d\'envoyer.', type: 'error' });
      return;
    }

    if (!validTypes.includes(file.type.toLowerCase())) {
      setToast({ message: 'Format non pris en charge. Formats acceptés : JPG, PNG, WEBP, HEIC, HEIF, AVIF.', type: 'error' });
      return;
    }

    setIsUploadingLogo(true);
    try {
      const path = `merchant-logos/${user.id}.jpg`;
      const publicUrl = await uploadImageToSupabase(file, path);

      const { error: updateError } = await supabase
        .from('merchants')
        .update({ logo_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await loadProfile();
      setToast({ message: 'Logo uploaded successfully', type: 'success' });
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      setToast({ message: error.message || 'Failed to upload logo', type: 'error' });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    if (!user || !editedProfile) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('merchants')
        .update({
          company_name: editedProfile.company_name,
          first_name: editedProfile.first_name,
          last_name: editedProfile.last_name,
          phone: editedProfile.phone,
          street: editedProfile.street,
          city: editedProfile.city,
          postal_code: editedProfile.postal_code,
          country: editedProfile.country,
          description: editedProfile.description,
          logo_url: editedProfile.logo_url
        })
        .eq('id', user.id);

      if (error) throw error;

      await loadProfile();
      setIsEditMode(false);
      setToast({ message: 'Profile updated successfully', type: 'success' });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setToast({ message: error.message || 'Failed to update profile', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}>
            {toast.message}
          </div>
        )}

        <button
          onClick={() => navigate('/merchant/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                {editedProfile?.logo_url ? (
                  <img src={editedProfile.logo_url} alt="Business Logo" className="w-full h-full object-cover" />
                ) : (
                  <Store className="w-16 h-16 text-gray-400" />
                )}
              </div>
              {isEditMode && (
                <label className="absolute bottom-0 right-0 bg-green-500 rounded-full p-2 cursor-pointer hover:bg-green-600 transition-colors shadow-lg">
                  {isUploadingLogo ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <Camera className="w-5 h-5 text-white" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    disabled={isUploadingLogo}
                  />
                </label>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Business Profile</h1>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Business Information</h2>
            {!isEditMode ? (
              <button
                onClick={() => setIsEditMode(true)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Edit
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setIsEditMode(false);
                    setEditedProfile(profile);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              {isEditMode ? (
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="company_name"
                    value={editedProfile?.company_name || ''}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              ) : (
                <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <Store className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">{profile?.company_name || 'Not provided'}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                {isEditMode ? (
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="first_name"
                      value={editedProfile?.first_name || ''}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                ) : (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <UserIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">{profile?.first_name || 'Not provided'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                {isEditMode ? (
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="last_name"
                      value={editedProfile?.last_name || ''}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                ) : (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <UserIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">{profile?.last_name || 'Not provided'}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="flex items-center p-3 bg-gray-100 rounded-lg border border-gray-200">
                <Mail className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-gray-500">{profile?.email || 'Not provided'}</span>
                <span className="ml-auto text-xs text-gray-400">Cannot be changed</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              {isEditMode ? (
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    name="phone"
                    value={editedProfile?.phone || ''}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              ) : (
                <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <Phone className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">{profile?.phone || 'Not provided'}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address
              </label>
              {isEditMode ? (
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="street"
                    value={editedProfile?.street || ''}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              ) : (
                <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">{profile?.street || 'Not provided'}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="city"
                    value={editedProfile?.city || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                ) : (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-gray-900">{profile?.city || 'Not provided'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postal Code
                </label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="postal_code"
                    value={editedProfile?.postal_code || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                ) : (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-gray-900">{profile?.postal_code || 'Not provided'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                {isEditMode ? (
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      name="country"
                      value={editedProfile?.country || 'FR'}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
                    >
                      <option value="FR">France</option>
                      <option value="BE">Belgium</option>
                      <option value="DE">Germany</option>
                      <option value="ES">Spain</option>
                      <option value="IT">Italy</option>
                    </select>
                  </div>
                ) : (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <Globe className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">{profile?.country || 'Not provided'}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Description
              </label>
              {isEditMode ? (
                <div className="relative">
                  <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <textarea
                    name="description"
                    value={editedProfile?.description || ''}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Tell customers about your business..."
                  />
                </div>
              ) : (
                <div className="flex items-start p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <FileText className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <span className="text-gray-900">{profile?.description || 'Not provided'}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantProfilePage;
