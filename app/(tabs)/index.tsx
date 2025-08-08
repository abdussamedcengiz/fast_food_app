import CartButton from "@/components/CartButton";
import Filter from "@/components/Filter";
import MenuCard from "@/components/MenuCard";
import { images, offers } from "@/constants";
import { getCategories, getMenuItems } from "@/lib/api";
import { Category, MenuItem } from "@/type";
import cn from "clsx";
import { Fragment, useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../globals.css";

export default function Index() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    getCategories().then(setCategories);
    getMenuItems().then(setMenuItems);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* HEADER */}
        <View className="flex-between flex-row w-full my-5 px-5">
          <View className="flex-start">
            <Text className="small-bold text-primary">Deliver to</Text>
            <TouchableOpacity className="flex-center flex-row gap-x-1 mt-0.5">
              <Text className="paragraph-bold">Creatia</Text>
              <Image
                source={images.arrowDown}
                className="size-3"
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          <CartButton />
        </View>

        {/* OFFERS */}
        <View className="space-y-4 px-5">
          {offers.map((item, index) => {
            const isEven = index % 2 === 0;
            return (
              <Pressable
                key={item.title}
                className={cn(
                  "offer-card",
                  isEven ? "flex-row-reverse" : "flex-row"
                )}
                style={{ backgroundColor: item.color }}
                android_ripple={{ color: "#fffff22" }}
              >
                {({ pressed }) => (
                  <Fragment>
                    <View className="h-full w-1/2">
                      <Image
                        source={item.image}
                        className="size-full"
                        resizeMode="contain"
                      />
                    </View>
                    <View
                      className={cn(
                        "offer-card__info",
                        isEven ? "pl-10" : "pr-10"
                      )}
                    >
                      <Text className="h1-bold text-white leading-tight">
                        {item.title}
                      </Text>
                      <Image
                        source={images.arrowRight}
                        className="size-10"
                        resizeMode="contain"
                        tintColor="#fffff"
                      />
                    </View>
                  </Fragment>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* FILTER */}
        <View className="mt-6 px-5">
          <Filter categories={categories} />
        </View>

        {/* MENU LIST */}
        <View className="mt-4 px-5 space-y-4">
          {menuItems.map((item) => (
            <MenuCard key={item.$id} item={item} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
