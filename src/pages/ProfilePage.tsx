import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Globe, CreditCard as Edit, Save, X, Lock, Heart, Award, Clock, Tag, Camera } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';
import { uploadImageToSupabase } from '../lib/uploadImage';

interface ClientProfile {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  street: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  profile_photo_url: string | null;
}

const ProfilePage = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [editedProfile, setEditedProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [geoLocation, setGeoLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('clients')
          .select('first_name, last_name, email, phone, street, city, postal_code, country, profile_photo_url')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;
        setProfile(data);
        setEditedProfile(data);
        if (data?.profile_photo_url) {
          setAvatarUrl(data.profile_photo_url);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      loadProfile();
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedProfile(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleEditClick = () => {
    setIsEditMode(true);
    setEditedProfile(profile);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditedProfile(profile);
  };

  const handleSaveChanges = async () => {
    if (!user || !editedProfile) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          first_name: editedProfile.first_name,
          last_name: editedProfile.last_name,
          phone: editedProfile.phone,
          street: editedProfile.street,
          city: editedProfile.city,
          postal_code: editedProfile.postal_code,
          country: editedProfile.country,
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(editedProfile);
      setIsEditMode(false);
      setToast({ message: 'Profile updated successfully', type: 'success' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setToast({ message: 'Something went wrong', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setToast({ message: 'Passwords do not match', type: 'error' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setToast({ message: 'Password must be at least 6 characters', type: 'error' });
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      setToast({ message: 'Password updated successfully', type: 'success' });
      setShowPasswordModal(false);
      setPasswordData({ newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      console.error('Error updating password:', error);
      setToast({ message: error.message || 'Failed to update password', type: 'error' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setIsUploadingPhoto(true);
    try {
      const path = `client-photos/${user.id}.jpg`;
      const photoUrl = await uploadImageToSupabase(file, path);

      const { error: updateError } = await supabase
        .from('clients')
        .update({ profile_photo_url: photoUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(photoUrl);
      setToast({ message: 'Photo de profil mise à jour', type: 'success' });
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      setToast({ message: error.message || 'Échec du téléchargement', type: 'error' });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleActivateGeolocation = async () => {
    if (!user) return;

    setIsGeolocating(true);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setGeoLocation(newLocation);

          try {
            const { error } = await supabase.rpc('update_client_location', {
              p_client_id: user.id,
              p_lat: newLocation.lat,
              p_lng: newLocation.lng
            });

            if (error) throw error;

            setToast({ message: 'Géolocalisation enregistrée avec succès', type: 'success' });
          } catch (error: any) {
            console.error('Error saving geolocation:', error);
            setToast({ message: 'Erreur lors de l\'enregistrement de la position', type: 'error' });
          } finally {
            setIsGeolocating(false);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          setToast({ message: 'Impossible d\'obtenir votre position', type: 'error' });
          setIsGeolocating(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setToast({ message: 'Géolocalisation non disponible sur ce navigateur', type: 'error' });
      setIsGeolocating(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const displayValue = (value: string | null) => value || 'Not provided';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Toast Notification */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}>
            {toast.message}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-gray-400" />
                )}
              </div>
              <label className={`absolute bottom-0 right-0 bg-green-500 rounded-full p-2 cursor-pointer hover:bg-green-600 transition-colors shadow-lg ${
                isUploadingPhoto ? 'opacity-50 cursor-not-allowed' : ''
              }`}>
                {isUploadingPhoto ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-5 h-5 text-white" />
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif,image/avif"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={isUploadingPhoto}
                />
              </label>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
            </div>
            {!isEditMode ? (
              <button
                onClick={handleEditClick}
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </button>
            ) : (
              <button
                onClick={handleCancelEdit}
                className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
            )}
          </div>

          <div className="border-t pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                {isEditMode ? (
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
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
                    <User className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">{displayValue(profile?.first_name)}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                {isEditMode ? (
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
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
                    <User className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">{displayValue(profile?.last_name)}</span>
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
                <span className="text-gray-500">{displayValue(profile?.email)}</span>
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
                  <span className="text-gray-900">{displayValue(profile?.phone)}</span>
                </div>
              )}
            </div>

            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 text-green-600 mr-2" />
                Address Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street
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
                      <span className="text-gray-900">{displayValue(profile?.street)}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <span className="text-gray-900">{displayValue(profile?.city)}</span>
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
                        <span className="text-gray-900">{displayValue(profile?.postal_code)}</span>
                      </div>
                    )}
                  </div>
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
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="FR">France</option>
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="GB">United Kingdom</option>
                        <option value="DE">Germany</option>
                        <option value="ES">Spain</option>
                        <option value="IT">Italy</option>
                      </select>
                    </div>
                  ) : (
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <Globe className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-gray-900">{displayValue(profile?.country)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleActivateGeolocation}
                  disabled={isGeolocating}
                  className="w-full flex items-center justify-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MapPin className="w-5 h-5 mr-2" />
                  {isGeolocating ? 'Localisation en cours...' : 'Activer ma géolocalisation'}
                </button>
                {geoLocation && (
                  <p className="text-sm text-gray-600 mt-2 text-center">
                    Position enregistrée: {geoLocation.lat.toFixed(6)}, {geoLocation.lng.toFixed(6)}
                  </p>
                )}
              </div>
            </div>

            {isEditMode && (
              <div className="border-t pt-6">
                <button
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className="w-full flex items-center justify-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5 mr-2" />
                  {isSaving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            )}

            <div className="border-t pt-6">
              <button
                onClick={() => setShowPasswordModal(true)}
                className="flex items-center justify-center w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Lock className="w-5 h-5 mr-2" />
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Favorite Stores Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mt-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Heart className="w-6 h-6 text-red-500 mr-3" />
            Favorite Stores
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Bakery du Marché</h3>
                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              </div>
              <p className="text-sm text-gray-600 mb-3">Fresh pastries and artisan bread daily</p>
              <div className="flex items-center">
                <Tag className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-green-600 font-medium text-sm">Up to -30%</span>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Green Table</h3>
                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              </div>
              <p className="text-sm text-gray-600 mb-3">Organic meals and healthy options</p>
              <div className="flex items-center">
                <Tag className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-green-600 font-medium text-sm">Up to -40%</span>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Café du Parc</h3>
                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              </div>
              <p className="text-sm text-gray-600 mb-3">Coffee, sandwiches, and light meals</p>
              <div className="flex items-center">
                <Tag className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-green-600 font-medium text-sm">Up to -25%</span>
              </div>
            </div>
          </div>
        </div>

        {/* My Points Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mt-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Award className="w-6 h-6 text-yellow-500 mr-3" />
            My Points
          </h2>

          <div className="flex flex-col md:flex-row items-center md:items-start justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mr-4">
                <span className="text-white font-bold text-2xl">124</span>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">124 Points</p>
                <p className="text-gray-600 mt-1">Earn points by saving food and shopping with your favorite stores.</p>
              </div>
            </div>
            <button className="px-6 py-3 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors">
              See rewards
            </button>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mt-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Clock className="w-6 h-6 text-blue-500 mr-3" />
            Recent Activity
          </h2>

          <div className="space-y-4">
            <div className="flex items-start border-l-4 border-green-500 pl-4 py-2">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <Tag className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-gray-900 font-medium">Picked up 2 bakery boxes from Le Fournil</p>
                <p className="text-sm text-green-600">-40% discount</p>
                <p className="text-xs text-gray-500 mt-1">2 days ago</p>
              </div>
            </div>

            <div className="flex items-start border-l-4 border-green-500 pl-4 py-2">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <Tag className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-gray-900 font-medium">Saved 1 ready meal from Green Table</p>
                <p className="text-sm text-green-600">-25% discount</p>
                <p className="text-xs text-gray-500 mt-1">5 days ago</p>
              </div>
            </div>

            <div className="flex items-start border-l-4 border-red-500 pl-4 py-2">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <Heart className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-gray-900 font-medium">Added Café du Parc to favorites</p>
                <p className="text-xs text-gray-500 mt-1">1 week ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({ newPassword: '', confirmPassword: '' });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    minLength={6}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isChangingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
