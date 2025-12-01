import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Camera, ImageIcon } from 'lucide-react';

interface Offer {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  price_before: number;
  price_after: number;
  quantity: number;
  available_from: string;
  available_until: string;
}

interface FormData {
  title: string;
  description: string;
  image: File | null;
  imagePreview: string;
  price_before: string;
  price_after: string;
  quantity: string;
  available_from: string;
  available_until: string;
  startNow: boolean;
  duration: string;
  customDuration: string;
}

interface OfferFormProps {
  mode: 'create' | 'edit';
  initialData?: Offer;
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const OfferForm: React.FC<OfferFormProps> = ({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    image: null,
    imagePreview: '',
    price_before: '',
    price_after: '',
    quantity: '',
    available_from: '',
    available_until: '',
    startNow: true,
    duration: '2h',
    customDuration: '',
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Détection mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      const formatDateForInput = (dateString: string) => {
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
      };

      // ✅ Détecter si l'offre est expirée
      const now = new Date();
      const availableUntil = new Date(initialData.available_until);
      const isExpired = now > availableUntil;

      // ✅ Si expirée, réinitialiser les dates à maintenant + 2h
      let availableFrom: string;
      let availableUntilFormatted: string;

      if (isExpired) {
        console.log('🔄 Offre expirée détectée → Réinitialisation des dates');
        availableFrom = now.toISOString().slice(0, 16);
        const twoHoursLater = new Date(now.getTime() + 120 * 60000);
        availableUntilFormatted = twoHoursLater.toISOString().slice(0, 16);
        
        // ✅ Informer l'utilisateur
        setToast({
          message: '⏰ Süresi dolmuş teklif → Tarihler sıfırlandı (şimdi + 2s)',
          type: 'success',
        });
      } else {
        availableFrom = formatDateForInput(initialData.available_from);
        availableUntilFormatted = formatDateForInput(initialData.available_until);
      }

      setFormData({
        title: initialData.title,
        description: initialData.description,
        image: null,
        imagePreview: initialData.image_url || '',
        price_before: initialData.price_before.toString(),
        price_after: initialData.price_after.toString(),
        quantity: initialData.quantity.toString(),
        available_from: availableFrom,
        available_until: availableUntilFormatted,
        startNow: false,
        duration: '2h',
        customDuration: '',
      });
    } else if (mode === 'create') {
      const now = new Date();
      const twoHoursLater = new Date(now.getTime() + 120 * 60000);
      setFormData({
        title: '',
        description: '',
        image: null,
        imagePreview: '',
        price_before: '',
        price_after: '',
        quantity: '',
        available_from: now.toISOString().slice(0, 16),
        available_until: twoHoursLater.toISOString().slice(0, 16),
        startNow: true,
        duration: '2h',
        customDuration: '',
      });
    }
  }, [mode, initialData]);

  const calculateDiscount = (priceBefore: string, priceAfter: string): number => {
    const before = parseFloat(priceBefore);
    const after = parseFloat(priceAfter);
    if (!before || !after || before <= 0) return 0;
    return Math.round(((before - after) / before) * 100);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'duration' || name === 'customDuration') {
      updateEndDate(value, name === 'duration' ? 'duration' : 'custom');
    }
  };

  const updateEndDate = (durationValue: string, type: 'duration' | 'custom') => {
    const startDate = formData.startNow
      ? new Date()
      : new Date(formData.available_from);
    if (isNaN(startDate.getTime())) return;

    let minutes = 0;
    if (type === 'duration') {
      switch (durationValue) {
        case '30min':
          minutes = 30;
          break;
        case '1h':
          minutes = 60;
          break;
        case '2h':
          minutes = 120;
          break;
        case '4h':
          minutes = 240;
          break;
        case 'allday':
          const endOfDay = new Date(startDate);
          endOfDay.setHours(23, 59, 0, 0);
          setFormData((prev) => ({
            ...prev,
            available_until: endOfDay.toISOString().slice(0, 16),
          }));
          return;
        case 'custom':
          minutes = parseInt(formData.customDuration) || 0;
          break;
        default:
          return;
      }
    } else {
      minutes = parseInt(durationValue) || 0;
    }

    const endDate = new Date(startDate.getTime() + minutes * 60000);
    setFormData((prev) => ({
      ...prev,
      available_until: endDate.toISOString().slice(0, 16),
    }));
  };

  const handleStartNowChange = (checked: boolean) => {
    setFormData((prev) => {
      const newData = { ...prev, startNow: checked };
      if (checked) {
        const now = new Date();
        newData.available_from = now.toISOString().slice(0, 16);
      }
      return newData;
    });
    if (checked && formData.duration) {
      setTimeout(() => updateEndDate(formData.duration, 'duration'), 0);
    }
  };

  const convertHeicToJpeg = async (file: File): Promise<File> => {
    try {
      // Convertir HEIC en JPEG en utilisant l'API native du navigateur
      const convertedBlob = await new Promise<Blob>((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Conversion failed'));
          }, 'image/jpeg', 0.92);
        };
        
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      });

      return new File([convertedBlob], file.name.replace(/\.heic$/i, '.jpg'), {
        type: 'image/jpeg',
      });
    } catch (error) {
      console.error('Erreur conversion HEIC:', error);
      throw error;
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 5 * 1024 * 1024;
    const validTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/heic',
      'image/heif',
      'image/avif',
    ];

    if (file.size > MAX_SIZE) {
      setToast({
        message:
          'Görsel çok büyük (maks. 5 MB). Göndermeden önce boyutunu küçült veya sıkıştır.',
        type: 'error',
      });
      return;
    }

    if (!validTypes.includes(file.type.toLowerCase())) {
      setToast({
        message:
          'Desteklenmeyen format. Kabul edilen formatlar: JPG, PNG, WEBP, HEIC, HEIF, AVIF.',
        type: 'error',
      });
      return;
    }

    let processedFile = file;

    // ✅ Conversion automatique HEIC/HEIF → JPEG
    if (file.type === 'image/heic' || file.type === 'image/heif') {
      try {
        processedFile = await convertHeicToJpeg(file);
        console.log('✅ HEIC converti en JPEG');
      } catch (error) {
        setToast({
          message:
            'HEIC dönüştürme hatası. Görselinizi manuel olarak JPG formatına dönüştürmeyi deneyin.',
          type: 'error',
        });
        return;
      }
    }

    setFormData({ ...formData, image: processedFile });
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        imagePreview: reader.result as string,
      }));
    };
    reader.readAsDataURL(processedFile);
  };

  const handleSubmit = async () => {
    await onSubmit(formData);
  };

  const isFormValid =
    formData.title.trim() &&
    formData.description.trim() &&
    formData.price_before &&
    formData.price_after &&
    formData.quantity &&
    formData.available_from &&
    formData.available_until;

  return (
    <div 
  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
  onClick={onCancel}
>
      {toast && (
        <div
          className={
            'fixed top-4 right-4 z-[9999] px-6 py-3 rounded-lg shadow-lg ' +
            (toast.type === 'success' ? 'bg-[#00A690]' : 'bg-red-500') +
            ' text-white'
          }
        >
          {toast.message}
        </div>
      )}

      <div 
  className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto"
  onClick={(e) => e.stopPropagation()}
>
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'create' ? 'Yeni Ürün Ekle' : 'Ürünü Düzenle'}
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ürün Adı</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Örn: Taze Kruvasan Kutusu"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A690] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Ürününüzü tanımlayın..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A690] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📸 Ürün Fotoğrafı
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              {formData.imagePreview ? (
                <div className="relative">
                  <img
                    src={formData.imagePreview}
                    alt="Önizleme"
                    className="max-h-48 mx-auto rounded"
                  />
                  <button
                    onClick={() => setFormData({ ...formData, image: null, imagePreview: '' })}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : isMobile ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 mb-3">
                    {mode === 'create'
                      ? 'Fotoğraf eklemek için seçin:'
                      : 'Fotoğrafı değiştir (isteğe bağlı)'}
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex flex-col items-center gap-2 px-4 py-3 bg-[#00A690] text-white rounded-lg hover:bg-[#F75C00] transition-colors"
                    >
                      <Camera className="w-8 h-8" />
                      <span className="text-xs font-medium">Fotoğraf Çek</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      className="flex flex-col items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <ImageIcon className="w-8 h-8" />
                      <span className="text-xs font-medium">Galeriden Seç</span>
                    </button>
                  </div>
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              ) : (
                <label className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {mode === 'create'
                      ? 'Fotoğraf çek veya görsel seç'
                      : 'Fotoğrafı değiştir (isteğe bağlı)'}
                  </p>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Orijinal Fiyat (₺)
              </label>
              <input
                type="number"
                name="price_before"
                value={formData.price_before}
                onChange={handleInputChange}
                placeholder="600.00"
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A690] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">İndirimli Fiyat (₺)</label>
              <input
                type="number"
                name="price_after"
                value={formData.price_after}
                onChange={handleInputChange}
                placeholder="250.00"
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A690] focus:border-transparent"
              />
            </div>
          </div>

          {formData.price_before && formData.price_after && parseFloat(formData.price_before) > 0 && (
            <div className="bg-green-100 border border-green-300 rounded-lg p-3 text-center">
              <span className="text-lg font-bold text-[#00A690]">
                -%{calculateDiscount(formData.price_before, formData.price_after)} indirim
              </span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mevcut Miktar
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              placeholder="10"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A690] focus:border-transparent"
            />
          </div>

          {mode === 'create' && (
            <div className="border-t pt-4">
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  id="startNow"
                  checked={formData.startNow}
                  onChange={(e) => handleStartNowChange(e.target.checked)}
                  className="w-4 h-4 text-[#00A690] rounded focus:ring-[#00A690]"
                />
                <label htmlFor="startNow" className="ml-2 text-sm font-medium text-gray-700">
                  Başlangıç: Şimdi
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Başlangıç Tarihi ve Saati
                  </label>
                  <input
                    type="datetime-local"
                    name="available_from"
                    value={formData.available_from}
                    onChange={handleInputChange}
                    disabled={formData.startNow}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A690] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bitiş Tarihi ve Saati
                  </label>
                  <input
                    type="datetime-local"
                    name="available_until"
                    value={formData.available_until}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A690] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Süre</label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A690] focus:border-transparent"
                >
                  <option value="30min">30 dakika</option>
                  <option value="1h">1 saat</option>
                  <option value="2h">2 saat</option>
                  <option value="4h">4 saat</option>
                  <option value="allday">Tüm gün (bugün)</option>
                  <option value="custom">Özel</option>
                </select>
              </div>

              {formData.duration === 'custom' && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Özel Süre (dakika)
                  </label>
                  <input
                    type="number"
                    name="customDuration"
                    value={formData.customDuration}
                    onChange={handleInputChange}
                    placeholder="120"
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A690] focus:border-transparent"
                  />
                </div>
              )}
            </div>
          )}

          {mode === 'edit' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Başlangıç
                </label>
                <input
                  type="datetime-local"
                  name="available_from"
                  value={formData.available_from}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A690] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bitiş
                </label>
                <input
                  type="datetime-local"
                  name="available_until"
                  value={formData.available_until}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A690] focus:border-transparent"
                />
              </div>
            </>
          )}

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !isFormValid}
            className={
              'w-full py-3 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed ' +
              (mode === 'create'
                ? 'bg-[#00A690] hover:bg-[#F75C00]'
                : 'bg-[#00A690] hover:bg-[#F75C00]')
            }
          >
            {isSubmitting
              ? mode === 'create'
                ? 'Yayınlanıyor...'
                : 'Güncelleniyor...'
              : mode === 'create'
              ? 'Ürünü Yayınla'
              : 'Ürünü Güncelle'}
          </button>
        </div>
      </div>
    </div>
  );
};