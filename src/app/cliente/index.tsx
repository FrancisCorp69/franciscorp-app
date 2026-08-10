import { ScrollView, StyleSheet } from "react-native";

import DeliveryAddress from "../../components/cliente/DeliveryAddress";
import Header from "../../components/cliente/Header";
import MainBanner from "../../components/cliente/MainBanner";
import SearchBar from "../../components/cliente/SearchBar";
import ServicesGrid from "../../components/cliente/ServicesGrid";

export default function ClienteScreen() {
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
