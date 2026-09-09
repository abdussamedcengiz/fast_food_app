import axios, { AxiosError } from "axios";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

// --- ADRES ---
//
// ÖNCEDEN "http://127.0.0.1:8000/api" KODA GÖMÜLÜYDÜ ve bu iki ayrı
// şekilde yanlıştı:
//
// 1) 127.0.0.1 MOBİLDE ÇALIŞMAZ. Emülatör/cihaz için "localhost"
//    kendisidir, geliştirme makinen değil. Android emülatöründen ana
//    makineye 10.0.2.2 üzerinden ulaşılır; gerçek bir telefonda ise
//    makinenin yerel ağ IP'si gerekir.
//
// 2) Değiştirilebilir değildi: farklı bir ortama bağlanmak kod
//    değişikliği gerektiriyordu.
const DEFAULT_HOST =
  Platform.OS === "android"
    ? "http://10.0.2.2:8000" // Android emülatöründen ana makine
    : "http://127.0.0.1:8000"; // iOS simülatörü ve web

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_HOST;

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  // Laravel doğrulama hatalarını (422) JSON döndürsün diye şart:
  // bu başlık olmadan Laravel HTML bir hata sayfası döner.
  headers: { Accept: "application/json" },
  timeout: 10000,
});

// --- TOKEN ---
//
// Token SecureStore'da tutuluyor, AsyncStorage'da değil: SecureStore
// iOS Keychain ve Android Keystore kullanır, yani veri şifreli
// saklanır. Bir oturum anahtarı için doğru yer burasıdır.
const TOKEN_KEY = "auth_token";

export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    // Web'de SecureStore yok; uygulama yine de çalışsın.
    return null;
  }
}

export async function setToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch {
    // Saklayamadık: kullanıcı uygulamayı kapatınca tekrar giriş yapar.
  }
}

export async function clearToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    // Yukarıdakiyle aynı gerekçe.
  }
}

// Her isteğe Authorization başlığını otomatik ekler.
//
// ÖNCEDEN HİÇ EKLENMİYORDU: giriş yapılıyor, token dönüyor ve
// hiçbir yerde kullanılmıyordu. Korumalı bir uca istek atmak
// mümkün değildi.
api.interceptors.request.use(async (config) => {
  const token = await getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/**
 * Sunucunun hata mesajını okunur bir metne çevirir.
 *
 * Laravel doğrulama hatalarını şu biçimde döner:
 *   { "message": "...", "errors": { "email": ["..."], ... } }
 *
 * Önceden hiçbir yerde hata yakalanmıyordu; ekranlar yalnızca
 * axios'un teknik mesajını ("Request failed with status code 422")
 * görebiliyordu.
 */
export function apiHataMesaji(error: unknown): string {
  const axiosError = error as AxiosError<{
    message?: string;
    errors?: Record<string, string[]>;
  }>;

  if (axiosError?.response) {
    const data = axiosError.response.data;

    // Alan bazlı ilk doğrulama mesajı en açıklayıcı olanıdır.
    const ilkAlanHatasi = data?.errors
      ? Object.values(data.errors)[0]?.[0]
      : undefined;

    if (ilkAlanHatasi) return ilkAlanHatasi;
    if (data?.message) return data.message;

    if (axiosError.response.status === 429) {
      return "Çok fazla deneme yaptın. Lütfen biraz bekle.";
    }

    return `Sunucu ${axiosError.response.status} döndü.`;
  }

  // response yok = isteğe hiç cevap gelmedi (ağ hatası, yanlış adres).
  return `Sunucuya ulaşılamadı. API çalışıyor mu? Adres: ${BASE_URL}`;
}

// --- MENÜ ---

export const getCategories = async () => {
  const response = await api.get("/categories");
  return response.data;
};

export const getCustomizations = async () => {
  const response = await api.get("/customizations");
  return response.data;
};

// NOT: önceden "getMenuItems" ve "getAllMenuItems" diye BİREBİR AYNI
// iki fonksiyon vardı. Tek isim yeterli.
export const getMenuItems = async (params?: {
  search?: string;
  category?: number;
}) => {
  const response = await api.get("/menu-items", { params });
  return response.data;
};

export const searchMenuItems = async (query: string) => {
  // Sunucu artık "search" parametresini gerçekten uyguluyor.
  // Önceden bu parametre gönderiliyor ama backend tarafından
  // yok sayılıyordu: arama kutusu hiçbir şeyi filtrelemiyordu.
  return getMenuItems({ search: query });
};

// --- KİMLİK ---
//
// ADRESLER DÜZELTİLDİ. Önceden:
//     POST http://127.0.0.1:8000/register
//     POST http://127.0.0.1:8000/login
//
// Laravel bu adresleri HİÇ TANIMLAMIYOR (routes/api.php) -- ikisi de
// 404 dönüyordu. Yani uygulamada kayıt ve giriş HİÇ ÇALIŞMIYORDU.
// Doğru adresler /api/sign-up ve /api/sign-in.
//
// Ayrıca "password_confirmation" gönderiliyordu; sunucu böyle bir
// alan beklemiyor.

type AuthResponse = {
  token: string;
  user: { id: number; name: string; email: string };
};

export const signUp = async (
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/sign-up", {
    name,
    email,
    password,
  });

  await setToken(response.data.token);
  return response.data;
};

export const signIn = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/sign-in", {
    email,
    password,
  });

  await setToken(response.data.token);
  return response.data;
};

export const signOut = async (): Promise<void> => {
  try {
    await api.post("/sign-out");
  } finally {
    // Sunucuya ulaşılamasa bile yerel token'ı temizliyoruz:
    // kullanıcı "çıkış yaptım" dediyse cihazda oturum kalmamalı.
    await clearToken();
  }
};

export const getCurrentUser = async () => {
  const response = await api.get("/user");
  return response.data;
};

export default api;
