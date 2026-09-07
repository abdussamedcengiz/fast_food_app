import { create } from "zustand";
import * as api from "@/lib/api";

// BU DOSYA TAMAMEN YORUM SATIRIYDI.
//
// İçindeki taslak bir Appwrite eğitiminden kalmıştı ve olmayan bir
// modüle ("@/lib/appwrite") atıfta bulunuyordu; hiçbir satırı
// çalışmıyordu. Git geçmişinde "Implement full auth" diye bir commit
// var ama oturum durumunu tutan yer burasıydı ve boştu: uygulama
// giriş yapıldığını hiçbir zaman hatırlamıyordu.
//
// Aşağısı aynı fikrin Laravel/Sanctum karşılığı.

export type AuthUser = {
  id: number;
  name: string;
  email: string;
};

type AuthState = {
  isAuthenticated: boolean;
  user: AuthUser | null;

  // Açılışta token'ın geçerliliği sunucuya sorulurken true.
  // Bu olmadan uygulama, kontrol bitmeden kullanıcıyı giriş
  // ekranına atardı.
  isLoading: boolean;

  fetchAuthenticatedUser: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  isLoading: true,

  /**
   * Açılışta çağrılır: cihazda kayıtlı bir token var mı ve hâlâ
   * geçerli mi?
   *
   * Token'ın geçerliliğini yalnızca sunucu bilir. Sanctum token'ları
   * çıkış yapıldığında silinir; elimizdeki token iptal edilmiş
   * olabilir.
   */
  fetchAuthenticatedUser: async () => {
    set({ isLoading: true });

    try {
      const token = await api.getToken();

      if (!token) {
        set({ isAuthenticated: false, user: null });
        return;
      }

      const user = await api.getCurrentUser();
      set({ isAuthenticated: true, user });
    } catch {
      // Token geçersiz ya da sunucuya ulaşılamıyor. İki durumu
      // ayırt etmiyoruz: her hâlükârda giriş ekranı gösterilecek,
      // ama yerel token'ı da temizliyoruz ki bir dahaki açılışta
      // boşuna denenmesin.
      await api.clearToken();
      set({ isAuthenticated: false, user: null });
    } finally {
      set({ isLoading: false });
    }
  },

  signIn: async (email, password) => {
    // Hata FIRLATILIYOR, yutulmuyor: ekran onu yakalayıp
    // kullanıcıya sunucunun mesajını gösterebilsin.
    const { user } = await api.signIn(email, password);
    set({ isAuthenticated: true, user });
  },

  signUp: async (name, email, password) => {
    const { user } = await api.signUp(name, email, password);
    set({ isAuthenticated: true, user });
  },

  signOut: async () => {
    await api.signOut();
    set({ isAuthenticated: false, user: null });
  },
}));

export default useAuthStore;
