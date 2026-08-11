import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
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
import { auth, db } from "../../services/firebase";

export default function ClienteScreen() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [nombre, setNombre] = useState("Usuario");
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (usuario) => {
      if (!usuario) {
        setNombre("Usuario");
        setFotoPerfil(null);
        return;
      }

      try {
        console.log("USUARIO AUTENTICADO:", usuario.uid);

        const referenciaUsuario = doc(db, "usuarios", usuario.uid);
        const documentoUsuario = await getDoc(referenciaUsuario);

        if (documentoUsuario.exists()) {
          const datos = documentoUsuario.data();

          console.log("DATOS DEL USUARIO:", datos);

          if (datos.nombre) {
            setNombre(String(datos.nombre));
          } else if (usuario.displayName) {
            setNombre(usuario.displayName);
          } else {
            setNombre("Usuario");
          }

          if (datos.fotoPerfil) {
            setFotoPerfil(String(datos.fotoPerfil));
          } else if (usuario.photoURL) {
            setFotoPerfil(usuario.photoURL);
          } else {
            setFotoPerfil(null);
          }
        } else {
          setNombre(usuario.displayName || "Usuario");
          setFotoPerfil(usuario.photoURL || null);
        }
      } catch (error) {
        console.error("ERROR CARGANDO DATOS DEL USUARIO:", error);

        setNombre(usuario.displayName || "Usuario");
        setFotoPerfil(usuario.photoURL || null);
      }
    });

    return unsubscribe;
  }, []);

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
      <Header nombre={nombre} fotoPerfil={fotoPerfil} />

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
