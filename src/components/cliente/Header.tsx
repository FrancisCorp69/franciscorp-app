import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type HeaderProps = {
  nombre: string;
  fotoPerfil: string | null;
};

export default function Header({ nombre, fotoPerfil }: HeaderProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.menu} activeOpacity={0.7}>
        <MaterialCommunityIcons name="menu" size={30} color="#0066CC" />
      </TouchableOpacity>

      <View style={styles.textos}>
        <Text style={styles.saludo}>Hola, {nombre} 👋</Text>

        <Text style={styles.subtitulo}>Bienvenido a FrancisCorp</Text>
      </View>

      <Image
        source={
          fotoPerfil
            ? { uri: fotoPerfil }
            : require("../../../assets/images/franciscorp-logo.png")
        }
        style={styles.foto}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 55,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  menu: {
    marginRight: 15,
  },

  textos: {
    flex: 1,
  },

  saludo: {
    fontSize: 18,
    color: "#555",
  },

  subtitulo: {
    marginTop: 4,
    fontSize: 26,
    fontWeight: "bold",
    color: "#0066CC",
  },

  foto: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    borderWidth: 2,
    borderColor: "#0066CC",
  },
});
