import { StyleSheet, View } from "react-native";

import DeliveryAddress from "../../components/cliente/DeliveryAddress";
import Header from "../../components/cliente/Header";

export default function ClienteScreen() {
  return (
    <View style={styles.container}>
      <Header nombre="Juan" fotoPerfil="" />

      <DeliveryAddress />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
