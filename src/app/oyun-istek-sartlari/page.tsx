// src/app/oyun-istek-sartlari/page.tsx

import { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircleIcon, HeartIcon, UsersIcon } from '@heroicons/react/24/solid';

export const metadata: Metadata = {
  title: 'Oyun İstek Şartları | PrestiJ',
  description: 'PrestiJ ekibinden yeni bir Türkçe dublaj projesi istemenin yolları ve şartları. Topluluk ve destekli öneri sistemimiz hakkında her şey.',
};

export default function OyunIstekSartlariPage() {
  return (
    <div style={{ backgroundColor: '#08060D' }} className="text-gray-300 min-h-screen">
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
              Oyun İstek Şartları
            </h1>
            <p className="mt-4 text-lg text-gray-400">
              Sıradaki projemizi şekillendirmemize yardımcı olduğunuz için teşekkür ederiz! Lütfen öneride bulunmadan önce aşağıdaki yönergeleri dikkatlice okuyun.
            </p>
          </div>

          <div className="space-y-10">

            {/* Toplulukla Öner Bölümü */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 bg-indigo-500/10 p-2 rounded-full">
                  <UsersIcon className="h-6 w-6 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-3">Topluluk Gücüyle Öneri Sistemi</h2>
                  <p className="text-gray-400 mb-4">
                    Bu sistem, topluluğun en çok hangi oyunları istediğini demokratik bir şekilde belirlememizi sağlar.
                    Öneriniz, diğer kullanıcılar tarafından oylanır ve popülerliğine göre listemizde yükselir.
                  </p>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex gap-3">
                      <CheckCircleIcon className="h-5 w-5 mt-1 text-green-500 flex-shrink-0" />
                      <span><strong>Zorunluluk:</strong> Önerdiğiniz oyunun geçerli bir Steam sayfası linkini eklemeniz gerekmektedir. Bu, kopya önerileri engeller ve herkesin aynı oyun için oy vermesini sağlar.</span>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircleIcon className="h-5 w-5 mt-1 text-green-500 flex-shrink-0" />
                      <span><strong>Süreç:</strong> Bir öneri yeterli sayıda isteğe ulaştığında, ekibimiz tarafından değerlendirmeye alınır. Bu, projenin kesin olarak yapılacağı anlamına gelmez, ancak öncelik listemizde üst sıralara çıktığını gösterir.</span>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircleIcon className="h-5 w-5 mt-1 text-green-500 flex-shrink-0" />
                      <span><strong>Adalet:</strong> Lütfen sadece gerçekten istediğiniz projelere oy verin. Sistemi manipüle etmeye yönelik girişimler, ilgili hesapların öneri sisteminden men edilmesiyle sonuçlanabilir.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Destekle Öner Bölümü */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 bg-green-500/10 p-2 rounded-full">
                  <HeartIcon className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-3">Destek Vererek Öneri Sistemi</h2>
                  <p className="text-gray-400 mb-4">
                    Bir projenin hayata geçmesini gerçekten istiyorsanız ve bu süreci hızlandırmak isterseniz, destekli öneri sistemini kullanabilirsiniz. Bu, projenin değerlendirme listemizde **en yüksek önceliğe** sahip olmasını sağlar.
                  </p>
                  <ul className="space-y-2 text-gray-300">
                     <li className="flex gap-3">
                      <CheckCircleIcon className="h-5 w-5 mt-1 text-green-500 flex-shrink-0" />
                      <span><strong>Garanti Değildir, Önceliktir:</strong> Yapılan destek, projenin %100 yapılacağını garanti etmez. Projenin teknik zorlukları, lisans sorunları veya ekibimizin o anki yoğunluğu gibi faktörler başlangıç sürecini etkileyebilir. Ancak desteklenen projeler, her zaman ilk incelediğimiz ve hayata geçirmeye çalıştığımız projeler olacaktır.</span>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircleIcon className="h-5 w-5 mt-1 text-green-500 flex-shrink-0" />
                      <span><strong>Süreç:</strong> Formu doldurup Bynogame üzerinden desteğinizi ilettiğinizde, öneriniz yöneticilerimizin paneline düşer. Ekibimiz en kısa sürede öneriyi teknik ve lojistik açıdan değerlendirir.</span>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircleIcon className="h-5 w-5 mt-1 text-green-500 flex-shrink-0" />
                      <span><strong>İade Politikası:</strong> Eğer desteklediğiniz bir proje, bizden kaynaklanan teknik veya idari sebeplerle **başlatılamazsa**, yapılan destek miktarı Bynogame üzerinden size iade edilebilir. Bu konuda sizinle iletişime geçilecektir.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center pt-8">
                <Link href="/oneriler" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition-transform transform hover:scale-105">
                    Öneri Sayfasına Geri Dön
                </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}