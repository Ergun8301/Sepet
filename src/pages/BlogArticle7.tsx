import React from 'react';
import { Calendar, User, ArrowLeft, TrendingUp, Store, Users2 } from 'lucide-react';

const BlogArticle7 = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <a href="/blog" className="inline-flex items-center text-[#39e3cf] hover:text-[#e2fd66] transition-colors duration-300">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Bloga dön
          </a>
        </div>
      </div>

      <div className="bg-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <span className="bg-[#39e3cf] text-white px-4 py-2 rounded-full text-sm font-medium">
              Haberler
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            İsraf karşıtı hareket Antalya'da ivme kazanıyor
          </h1>
          <div className="flex items-center text-gray-600 mb-8">
            <User className="w-5 h-5 mr-2" />
            <span className="mr-6">KapKurtar Editörlüğü</span>
            <Calendar className="w-5 h-5 mr-2" />
            <span>15 Ekim 2024</span>
            <span className="mx-3">•</span>
            <span>6 dk okuma</span>
          </div>
          <img
            src="https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Antalya havadan görünüm"
            className="w-full h-96 object-cover rounded-xl shadow-lg"
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            KapKurtar'ın lansmanından altı ay sonra, Antalya'da 150'den fazla işletme harekete katıldı.
            Gıda israfıyla aktif olarak mücadele eden bir şehrin portresi.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
            <TrendingUp className="inline w-6 h-6 mr-2 text-[#39e3cf]" />
            Cesaret verici rakamlar
          </h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Nisan 2024'te KapKurtar'ın lansmanından bu yana, Antalya bölgesinde israf karşıtı dinamik hızlanıyor.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
            <div className="bg-[#ffffff] rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-[#39e3cf] mb-2">150+</div>
              <div className="text-gray-700">Partner işletme</div>
            </div>
            <div className="bg-[#ffffff] rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-[#39e3cf] mb-2">8.000+</div>
              <div className="text-gray-700">Aktif kullanıcı</div>
            </div>
            <div className="bg-[#ffffff] rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-[#39e3cf] mb-2">25 ton</div>
              <div className="text-gray-700">Kurtarılan gıda</div>
            </div>
          </div>

          <blockquote className="border-l-4 border-[#39e3cf] pl-6 my-8 italic text-gray-700">
            "Bu rakamlar tüm beklentilerimizi aşıyor. Antalya sakinlerinin daha sorumlu
            tüketim alışkanlıkları benimsemeye hazır olduğunu kanıtlıyor."
            <br />
            <span className="text-sm not-italic">- KapKurtar Ekibi</span>
          </blockquote>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
            <Store className="inline w-6 h-6 mr-2 text-[#39e3cf]" />
            Tüm sektörlerden işletmeler
          </h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Partner işletmelerin çeşitliliği KapKurtar'ın zenginliğini oluşturuyor. Fırınlar, manavlar,
            restoranlar, bakkallar... gıda sektörünün tüm aktörleri harekete geçiyor.
          </p>

          <div className="bg-white border-2 border-[#39e3cf] rounded-lg p-6 my-8">
            <h3 className="font-bold text-gray-900 mb-4">Partner işletmelerin dağılımı:</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• <strong>%45 Fırın-pastaneler</strong> - Hareketin öncüleri</li>
              <li>• <strong>%25 Manav ve bakkallar</strong> - Kurtarılan meyve ve sebzeler</li>
              <li>• <strong>%20 Restoranlar</strong> - Servis sonunda hazır yemekler</li>
              <li>• <strong>%10 Diğerleri</strong> - Catering, marketler, peynirciler</li>
            </ul>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">Odak: Fırınlar ön saflarda</h3>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Fırınlar partner işletmelerin neredeyse yarısını oluşturuyor. Bunun nedeni:
            günlük taze ürünleriyle özellikle israfa açıklar.
          </p>

          <div className="bg-gray-100 rounded-lg p-6 my-6">
            <p className="text-gray-700 italic mb-3">
              "KapKurtar öncesinde günde kolayca 40-50 ekmek atıyordum. Bugün sadece 5-10 ekmek atıyorum.
              İşletmem için gerçek bir devrim!"
            </p>
            <p className="text-sm text-gray-600">- Ahmet, Ekmek Fırını, Konyaaltı</p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
            <Users2 className="inline w-6 h-6 mr-2 text-[#39e3cf]" />
            Çeşitli kullanıcı profili
          </h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Yaygın kanaatin aksine, KapKurtar sadece düşük bütçeli kişileri çekmiyor.
            Kullanıcı profili şaşırtıcı derecede çeşitli.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
            <div className="bg-[#ffffff] rounded-lg p-6">
              <h4 className="font-bold text-gray-900 mb-3">👨‍👩‍👧‍👦 Profil 1: Aileler</h4>
              <p className="text-sm text-gray-700">
                <strong>Kullanıcıların %35'i</strong><br />
                Motivasyon: tasarruf + çocukları israf karşıtı eğitme
              </p>
            </div>
            <div className="bg-[#ffffff] rounded-lg p-6">
              <h4 className="font-bold text-gray-900 mb-3">👩‍💼 Profil 2: Yoğun çalışanlar</h4>
              <p className="text-sm text-gray-700">
                <strong>Kullanıcıların %30'u</strong><br />
                Motivasyon: işten sonra hızlı ve ekonomik yemekler
              </p>
            </div>
            <div className="bg-[#ffffff] rounded-lg p-6">
              <h4 className="font-bold text-gray-900 mb-3">👵 Profil 3: Emekliler</h4>
              <p className="text-sm text-gray-700">
                <strong>Kullanıcıların %20'si</strong><br />
                Motivasyon: indirimli kaliteli ürünler
              </p>
            </div>
            <div className="bg-[#ffffff] rounded-lg p-6">
              <h4 className="font-bold text-gray-900 mb-3">🎓 Profil 4: Öğrenciler</h4>
              <p className="text-sm text-gray-700">
                <strong>Kullanıcıların %15'i</strong><br />
                Motivasyon: kısıtlı bütçe + ekolojik bilinç
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">En aktif semtler</h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Şaşırtıcı olmayan şekilde, merkezi ve yoğun nüfuslu semtler aktivitenin çoğunluğunu oluşturuyor.
            Ancak konut bölgeleri de donanmaya başlıyor.
          </p>

          <div className="space-y-3 my-8">
            <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
              <span className="font-medium text-gray-900">1. Muratpaşa</span>
              <span className="text-[#39e3cf] font-bold">42 işletme</span>
            </div>
            <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
              <span className="font-medium text-gray-900">2. Konyaaltı</span>
              <span className="text-[#39e3cf] font-bold">38 işletme</span>
            </div>
            <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
              <span className="font-medium text-gray-900">3. Kepez</span>
              <span className="text-[#39e3cf] font-bold">31 işletme</span>
            </div>
            <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
              <span className="font-medium text-gray-900">4. Lara</span>
              <span className="text-[#39e3cf] font-bold">24 işletme</span>
            </div>
            <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
              <span className="font-medium text-gray-900">5. Diğerleri</span>
              <span className="text-[#39e3cf] font-bold">15 işletme</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Çapraz referanslar</h2>

          <div className="bg-green-50 rounded-lg p-6 my-6">
            <p className="text-gray-700 mb-3">
              <strong className="text-[#39e3cf]">İşletme tarafından:</strong><br />
              "KapKurtar bize yeni bir müşteri kitlesine ulaşmamızı sağladı. Teklif için gelen bazı müşteriler
              daha sonra normal fiyattan almak için geri geliyor. Aynı zamanda bir pazarlama aracı!"
            </p>
            <p className="text-sm text-gray-600">- Fatma, şarküteri, Lara</p>
          </div>

          <div className="bg-blue-50 rounded-lg p-6 my-6">
            <p className="text-gray-700 mb-3">
              <strong className="text-blue-600">Müşteri tarafından:</strong><br />
              "Bilmediğim bir sürü mahalle işletmesi keşfettim.
              Tasarrufun ötesinde, olumlu bir şeyin parçası olduğumu hissediyorum."
            </p>
            <p className="text-sm text-gray-600">- Deniz, Mayıs 2024'ten beri kullanıcı</p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Peki ya yarın?</h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            KapKurtar ekibi burada durmayı planlamıyor. 2025 için birkaç proje geliştiriliyor:
          </p>

          <ul className="space-y-3 text-gray-700 ml-6 mb-8">
            <li>• <strong>Coğrafi genişleme</strong>: Manavgat, Side ve Alanya Ocak 2025'ten itibaren</li>
            <li>• <strong>Yeni partnerler</strong>: Oteller ve büyük restoranlar</li>
            <li>• <strong>Sadakat programı</strong>: Düzenli kullanıcıları ödüllendirme</li>
            <li>• <strong>Dernek ortaklıkları</strong>: Hayır kurumlarına bağışlar</li>
          </ul>

          <blockquote className="border-l-4 border-[#39e3cf] pl-6 my-8 italic text-gray-700">
            "2025 hedefimiz: 100 ton gıda kurtarmak ve Antalya bölgesinde 300 partner işletmeye ulaşmak.
            Birlikte işleri değiştirebiliriz!"
          </blockquote>

          <div className="bg-[#39e3cf] text-white rounded-lg p-8 my-12 text-center">
            <h3 className="text-2xl font-bold mb-4">Harekete katılın!</h3>
            <p className="mb-6 text-[#ffffff]">
              İster işletme sahibi ister tüketici olun, israf karşıtı devrime katılın
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/merchant/auth"
                className="bg-white text-[#39e3cf] px-6 py-3 rounded-lg font-medium hover:bg-[#ffffff] transition-colors inline-block"
              >
                İşletme sahibiyim
              </a>
              <a
                href="/download"
                className="bg-[#e2fd66] text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors inline-block"
              >
                Tüketiciyim
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogArticle7;
