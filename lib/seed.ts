import dummyData from "./data";

// Sadece konsola örnek seed verisi basan sade bir fonksiyon
async function seed(): Promise<void> {
  console.log("Kategoriler:", dummyData.categories);
  console.log("Customizations:", dummyData.customizations);
  console.log("Menu:", dummyData.menu);
  // Burada Laravel'e uygun şekilde API'ye post atılabilir.
}

export default seed;
