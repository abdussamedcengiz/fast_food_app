import { images } from "@/constants";
import React from "react";
import { Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const profileData = {
  name: "Samet Kullanıcı",
  email: "samet@example.com",
  avatar: images.avatar,
};

const Profile = () => {
  return (
    <SafeAreaView className="bg-white h-full flex-1 justify-center items-center">
      <Image
        source={profileData.avatar}
        style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 20 }}
      />
      <Text className="h2-bold text-dark-100 mb-2">{profileData.name}</Text>
      <Text className="paragraph-medium text-gray-200 mb-6">{profileData.email}</Text>
      <View className="w-full px-10 mt-10">
        <Text className="h3-bold text-primary mb-2">Profil Bilgileri</Text>
        <Text className="paragraph-regular text-dark-100 mb-1">Ad: {profileData.name}</Text>
        <Text className="paragraph-regular text-dark-100 mb-1">E-posta: {profileData.email}</Text>
      </View>
    </SafeAreaView>
  );
};

export default Profile;
