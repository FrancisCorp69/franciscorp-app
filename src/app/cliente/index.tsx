import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";

import { auth, db } from "../../services/firebase";

import DeliveryAddress from "../../components/cliente/DeliveryAddress";
import Header from "../../components/cliente/Header";

export default function ClienteScreen() {
  const [nombre, setNombre] = useState("Usuario");
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);

  useEffect(() => {
    cargarUsuario();
  }, []);

  async function cargarUsuario() {
    const usuario = auth.currentUser;

    if (!usuario) return;

    const documento = await getDoc(doc(db, "usuarios", usuario.uid));

    if (documento.exists()) {
      const datos = documento.data();

      setNombre(datos.nombre || "Usuario");

      if (datos.fotoPerfil) {
        setFotoPerfil(datos.fotoPerfil);
      }
    }
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Header nombre={nombre} fotoPerfil={fotoPerfil} />

      <DeliveryAddress />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
