import { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { router } from 'expo-router';

import { signOut } from 'firebase/auth';
import { auth, db } from '../../services/firebase';

import { doc, getDoc } from 'firebase/firestore';


export default function PerfilScreen() {

  const [cargando, setCargando] = useState(true);

  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [ciudad, setCiudad] = useState('');



  useEffect(() => {

    cargarPerfil();

  }, []);



  async function cargarPerfil() {

    try {

      const usuario = auth.currentUser;


      if (!usuario) {

        router.replace('/login');
        return;

      }


      const documento = await getDoc(
        doc(db, 'usuarios', usuario.uid)
      );


      if (documento.exists()) {

        const datos = documento.data();


        setNombre(datos.nombre || '');
        setCorreo(datos.correo || usuario.email || '');
        setTelefono(datos.telefono || '');
        setDireccion(datos.direccion || '');
        setCiudad(datos.ciudad || '');

      }


    } catch (error) {

      Alert.alert(
        'Error',
        'No se pudo cargar el perfil.'
      );


    } finally {

      setCargando(false);

    }

  }



  async function cerrarSesion() {

    try {

      await signOut(auth);

      router.replace('/login');


    } catch {

      Alert.alert(
        'Error',
        'No se pudo cerrar la sesión.'
      );

    }

  }



  if (cargando) {

    return (

      <View style={styles.cargando}>

        <ActivityIndicator
          size="large"
          color="#208AEF"
        />

      </View>

    );

  }



  return (

    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contenido}
      showsVerticalScrollIndicator={false}
    >


      <Image
        source={require('../../../assets/images/franciscorp-logo.png')}
        style={styles.foto}
      />


      <Text style={styles.titulo}>
        Mi Perfil
      </Text>



      <View style={styles.info}>


        <Text style={styles.label}>
          Nombre
        </Text>

        <Text style={styles.valor}>
          {nombre || 'No registrado'}
        </Text>



        <Text style={styles.label}>
          Correo
        </Text>

        <Text style={styles.valor}>
          {correo || 'No registrado'}
        </Text>



        <Text style={styles.label}>
          Teléfono
        </Text>

        <Text style={styles.valor}>
          {telefono || 'No registrado'}
        </Text>



        <Text style={styles.label}>
          Dirección
        </Text>

        <Text style={styles.valor}>
          {direccion || 'No registrada'}
        </Text>



        <Text style={styles.label}>
          Ciudad
        </Text>

        <Text style={styles.valor}>
          {ciudad || 'No registrada'}
        </Text>


      </View>



      <TouchableOpacity
        style={styles.botonEditar}
        onPress={() => router.push('/editar-perfil')}
      >

        <Text style={styles.textoBotonEditar}>
          Editar perfil
        </Text>

      </TouchableOpacity>




      <TouchableOpacity
        style={styles.botonCerrar}
        onPress={cerrarSesion}
      >

        <Text style={styles.textoBotonCerrar}>
          Cerrar sesión
        </Text>

      </TouchableOpacity>



    </ScrollView>

  );

}



const styles = StyleSheet.create({

  container: {

    flex:1,
    backgroundColor:'#ffffff',

  },


  contenido: {

    alignItems:'center',
    padding:25,
    paddingBottom:120,

  },


  cargando: {

    flex:1,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'#ffffff',

  },


  foto: {

    width:120,
    height:120,
    marginTop:40,

  },


  titulo: {

    fontSize:30,
    fontWeight:'bold',
    color:'#208AEF',
    marginVertical:25,

  },


  info: {

    width:'100%',
    backgroundColor:'#F5F8FC',
    borderRadius:15,
    padding:20,

  },


  label: {

    fontWeight:'bold',
    color:'#208AEF',
    marginTop:12,

  },


  valor: {

    fontSize:16,
    color:'#333333',
    marginTop:5,

  },


  botonEditar: {

    width:'100%',
    height:55,
    backgroundColor:'#208AEF',
    borderRadius:12,
    justifyContent:'center',
    alignItems:'center',
    marginTop:25,

  },


  textoBotonEditar: {

    color:'#ffffff',
    fontSize:18,
    fontWeight:'bold',

  },


  botonCerrar: {

    width:'100%',
    height:55,
    backgroundColor:'#555555',
    borderRadius:12,
    justifyContent:'center',
    alignItems:'center',
    marginTop:15,

  },


  textoBotonCerrar: {

    color:'#ffffff',
    fontSize:18,
    fontWeight:'bold',

  },


});