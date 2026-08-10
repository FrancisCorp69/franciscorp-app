import { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";

import Categories from "../../components/cliente/Categories";
import DeliveryAddress from "../../components/cliente/DeliveryAddress";
import FeaturedBusinesses from "../../components/cliente/FeaturedBusinesses";
import Header from "../../components/cliente/Header";
import MainBanner from "../../components/cliente/MainBanner";
import SearchBar from "../../components/cliente/SearchBar";
import ServicesGrid from "../../components/cliente/ServicesGrid";

import { Business, getBusinesses } from "../../services/businessService";

export default function ClienteScreen() {
  const [businesses, setBusinesses] = useState<Business[]>([]);

  useEffect(() => {
    async function cargarNegocios() {
      try {
        const datos = await getBusinesses();

        console.log("Negocios encontrados:", datos.length);

        setBusinesses(datos);
      } catch (error) {
        console.error("Error cargando negocios:", error);
      }
    }

    cargarNegocios();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={true}
    >
      <Header nombre="Juan" fotoPerfil="" />

      <DeliveryAddress />

      <SearchBar />

      <MainBanner />

      <ServicesGrid />

      <FeaturedBusinesses businesses={businesses} />

      <Categories />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  contentContainer: {
    paddingBottom: 30,
  },
});
