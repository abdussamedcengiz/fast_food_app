import Filter from "@/components/Filter";
import MenuCard from "@/components/MenuCard";
import { getCategories, getMenuItems } from "@/lib/api";
import { Category, MenuItem } from "@/type";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDebounce } from "use-debounce";

const FAVORITES: MenuItem[] = [
  {
    $id: "fav1",
    name: "Favori Burger",
    price: 29.99,
    image_url:
      "https://static.vecteezy.com/system/resources/previews/044/844/600/large_2x/homemade-fresh-tasty-burger-with-meat-and-cheese-classic-cheese-burger-and-vegetable-ai-generated-free-png.png",
    description: "Favori burger açıklaması",
    calories: 500,
    protein: 25,
    rating: 4.8,
  },
  {
    $id: "fav2",
    name: "Favori Pizza",
    price: 34.99,
    image_url:
      "https://static.vecteezy.com/system/resources/previews/023/742/417/large_2x/pepperoni-pizza-isolated-illustration-ai-generative-free-png.png",
    description: "Favori pizza açıklaması",
    calories: 700,
    protein: 30,
    rating: 4.7,
  },
];

const Search = () => {
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 500);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [results, setResults] = useState<MenuItem[]>([]);
  const [allItems, setAllItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCategories().then(setCategories);
    getMenuItems().then(setAllItems);
  }, []);

  useEffect(() => {
    if (!debouncedQuery && !category) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    // KATEGORI ARTIK SUNUCUYA GONDERILIYOR.
    //
    // Onceden "category" state'i tutuluyor ve effect'in bagimlilik
    // listesinde yer aliyordu -- yani kategori degisince istek
    // yeniden atiliyordu -- ama DEGERI ISTEGE HIC KONULMUYORDU.
    // Sonuc: kategori secmek listeyi degistirmiyordu.
    //
    // (Backend tarafi da "search"i yok sayiyordu; o da duzeltildi.)
    getMenuItems({
      search: debouncedQuery || undefined,
      category: category ? Number(category) : undefined,
    })
      .then((data) => {
        setResults(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Arama sırasında hata oluştu");
        setLoading(false);
      });
  }, [debouncedQuery, category]);

  // Kategori değişimini Filter'dan almak için bir prop fonksiyonu
  const handleCategoryChange = (catId: string) => {
    setCategory(catId === "all" ? undefined : catId);
  };

  // Gösterilecek veri: arama varsa sonuçlar, yoksa tüm ürünler
  const displayData = debouncedQuery || category ? results : allItems.length > 0 ? allItems : FAVORITES;

  return (
    <SafeAreaView className="bg-white h-full">
      <FlatList
        data={displayData}
        renderItem={({ item, index }) => {
          const isFirstRightColItem = index % 2 === 0;
          return (
            <View
              className={`flex-1 max-w-[48%] ${!isFirstRightColItem ? "mt-10" : "mt-0"}`}
            >
              <MenuCard item={item} />
            </View>
          );
        }}
        keyExtractor={(item) => item.$id}
        numColumns={2}
        columnWrapperClassName="gap-7"
        contentContainerClassName="gap-7 px-5 pb-32"
        ListHeaderComponent={() => (
          <View className="my-5 gap-5">
            <View className="flex-between flex-row w-full">
              <View className="flex-start">
                <Text className="small-bold uppercase text-primary">Search</Text>
                <View className="flex-start flex-row gap-x-1 mt-0.5">
                  <Text className="paragraph-semibold text-dark-100">
                    Find your favorite food
                  </Text>
                </View>
              </View>
            </View>
            <TextInput
              placeholder="Ürün ara..."
              value={query}
              onChangeText={setQuery}
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                padding: 12,
                marginBottom: 8,
              }}
              returnKeyType="search"
            />
            <Filter categories={categories} onCategoryChange={handleCategoryChange} />
          </View>
        )}
        ListEmptyComponent={() =>
          !loading && !error && <Text>No results</Text>
        }
        ListFooterComponent={() =>
          loading ? <ActivityIndicator size="large" color="#FE8C00" /> : null
        }
      />
      {error && (
        <View style={{ alignItems: "center", marginTop: 20 }}>
          <Text style={{ color: "red" }}>{error}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Search;
