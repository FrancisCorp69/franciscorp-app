import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";

import { auth, db } from "../../services/firebase";

import Header from "../../components/cliente/Header";

import {
  Business,
  getBusinesses,
} from "../../services/businessService";


export default function ClienteScreen() {

  const [nombre, setNombre] = useState("Usuario");
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);

  const [businesses, setBusinesses] = useState<Business[]>([]);


  useEffect(() => {
    cargarUsuario();
    cargarNegocios();
  }, []);



  async function cargarUsuario() {

    const usuario = auth.currentUser;

    if (!usuario) return;


    const documento = await getDoc(
      doc(db, "usuarios", usuario.uid)
    );


    if (documento.exists()) {

      const datos = documento.data();

      console.log(
        "DATOS USUARIO:",
        datos
      );


      setNombre(
        datos.nombre || "Usuario"
      );


      if (datos.fotoPerfil) {
        setFotoPerfil(
          datos.fotoPerfil
        );
      }

    }

  }



  async function cargarNegocios() {

    const datos = await getBusinesses();


    console.log(
      "Negocios encontrados:",
      datos.length
    );


    setBusinesses(datos);

  }



  return (
  <ScrollView
    style={styles.container}
    showsVerticalScrollIndicator={false}
  >

    <Header
      nombre={nombre}
      fotoPerfil={fotoPerfil}
    />

    {/* <DeliveryAddress /> */}

    {/* <SearchBar /> */}

    {/* <MainBanner /> */}

    {/* <ServicesGrid /> */}

    {/* <FeaturedBusinesses
      businesses={businesses}
    /> */}

    {/* <Categories /> */}

  </ScrollView>
);

}

const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#fff",
  },

});