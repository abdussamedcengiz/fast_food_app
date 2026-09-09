import CustomButton from "@/components/CustomButton";
import CustomInput from "@/components/CustomInput";
import { apiHataMesaji } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, View } from "react-native";

const SignIn = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  // Giris artik dogrudan api'yi degil, oturum durumunu tutan
  // store'u cagiriyor. Onceden token doniyor ama hicbir yerde
  // saklanmiyordu: uygulama giris yapildigini hatirlamiyordu.
  const signIn = useAuthStore((state) => state.signIn);

  const submit = async () => {
    if (!form.email || !form.password) {
      return Alert.alert("Eksik bilgi", "E-posta ve şifre gerekli.");
    }
    setIsSubmitting(true);

    try {
      await signIn(form.email, form.password);
      router.replace("/");
    } catch (error) {
      // apiHataMesaji sunucunun alan bazli dogrulama mesajini
      // ("Sifre en az 8 karakter olmali") cikarir. Onceden yalnizca
      // genel "message" alanina bakiliyordu.
      Alert.alert("Giriş yapılamadı", apiHataMesaji(error));
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <View className="gap-10 bg-white rounded-lg p-5 mt-5">
      <CustomInput
        placeholder="Enter your email"
        value={form.email}
        onChangeText={(text) => setForm((prev) => ({ ...prev, email: text }))}
        label="Email"
        keyboardType="email-address"
      />
      <CustomInput
        placeholder="Enter your password"
        value={form.password}
        onChangeText={(text) =>
          setForm((prev) => ({ ...prev, password: text }))
        }
        label="Password"
        secureTextEntry={true}
      />
      <CustomButton title="Sign-in" isLoading={isSubmitting} onPress={submit} />
      <View className="flex justify-center mt-5 flex-row gap-2">
        <Text className="base-regular text-gray-100">
          {" "}
          Don&apos;t have an account?
        </Text>
        <Link href="/Sign-up" className="base-bold text-primary">
          {" "}
          Sign-up
        </Link>
      </View>
    </View>
  );
};

export default SignIn;
