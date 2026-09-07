# Fast Food App — Mobil

Sipariş uygulamasının React Native (Expo) istemcisi.
Menü listeleme, arama, kategori filtresi, sepet ve kullanıcı girişi içerir.

**Backend:** [fast_food_app_laravel](https://github.com/abdussamedcengiz/fast_food_app_laravel)
(Laravel + Sanctum). Bu uygulama tek başına çalışmaz; API'nin ayakta olması gerekir.

## Teknolojiler

- React Native + Expo (Expo Router)
- TypeScript
- NativeWind (Tailwind CSS)
- Zustand (durum yönetimi)
- Axios
- expo-secure-store (token saklama)

## Özellikler

- Kayıt olma / giriş / çıkış — Sanctum token ile
- Token cihazda **şifreli** saklanır (Keychain / Keystore)
- Açılışta oturum doğrulaması: token hâlâ geçerli mi?
- Menü listeleme, **sunucu tarafında** arama ve kategori filtresi
- Sepet: ürün ekleme, adet, özelleştirme seçimi
- Korumalı sekmeler — giriş yapmayan kullanıcı menüye erişemez

## Kurulum

Önce **backend'i çalıştır** (bkz. backend reposu), sonra:

```bash
npm install
cp .env.example .env        # Windows: copy .env.example .env
npx expo start
```

### API adresi

Mobilde `localhost` **telefonun/emülatörün kendisidir**, geliştirme
makinen değil. Bu yüzden adres çalıştırdığın yere göre değişir:

| Nerede çalıştırıyorsun | `EXPO_PUBLIC_API_URL` |
|---|---|
| iOS simülatörü / web | `http://127.0.0.1:8000` |
| Android emülatörü | `http://10.0.2.2:8000` |
| Gerçek telefon | `http://<makinenin-yerel-IP'si>:8000` |

Boş bırakırsan platforma göre ilk iki satırdaki varsayılan kullanılır.
Gerçek telefonda mutlaka kendi IP'ni yazman gerekir.

## Proje yapısı

```
app/
├── _layout.tsx           # Kök yerleşim
├── (auth)/               # Giriş / kayıt ekranları
└── (tabs)/               # Ana sekmeler (korumalı)
    ├── index.tsx         # Menü
    ├── search.tsx        # Arama + kategori filtresi
    ├── cart.tsx          # Sepet
    └── profile.tsx
components/               # Yeniden kullanılabilir bileşenler
lib/api.ts                # API katmanı, token yönetimi, hata çevirisi
store/
├── auth.store.ts         # Oturum durumu
└── cart.store.ts         # Sepet durumu
```

## Mimari notlar

- **`lib/api.ts` tek giriş noktasıdır.** Axios interceptor'ı her isteğe
  `Authorization` başlığını otomatik ekler; ekranlar token'ı hiç görmez.
- **Token `expo-secure-store`'da tutulur**, `AsyncStorage`'da değil:
  SecureStore iOS Keychain ve Android Keystore kullanır, yani veri
  şifreli saklanır. Bir oturum anahtarı için doğru yer burasıdır.
- **`apiHataMesaji()`** Laravel'in `{ message, errors }` biçimindeki
  cevabını okunur tek bir cümleye çevirir. Böylece kullanıcı
  "Request failed with status code 422" yerine
  "Şifre en az 8 karakter olmalı" görür.
- **Arama ve filtre sunucuda yapılır.** İstemci tarafında filtrelemek
  tüm menüyü indirmeyi gerektirirdi.

## Bilinen eksikler

- Sipariş oluşturma ucu henüz yok; sepet yalnızca cihazda tutuluyor.
- Ödeme entegrasyonu yok.
- Test yok.
