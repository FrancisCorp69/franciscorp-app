import { useEffect, useState } from 'react';

import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { router } from 'expo-router';

import { auth, db } from '../services/firebase';

import SelectorUbicacion, {
  UbicacionSeleccionada,
} from '../components/SelectorUbicacion';

import {
    doc,
    getDoc,
    updateDoc,
} from 'firebase/firestore';


export default function EditarPerfilScreen() {

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [provincia, setProvincia] = useState('');
  const [ubicacionMapa, setUbicacionMapa] =
    useState<UbicacionSeleccionada | null>(null);


  useEffect(() => {

    cargarDatos();

  }, []);



  async function cargarDatos() {

    try {

      const usuario = auth.currentUser;

      if (!usuario) {

        router.replace('/login');
        return;

      }


      const referencia = doc(
        db,
        'usuarios',
        usuario.uid
      );


      const documento = await getDoc(referencia);


      if (documento.exists()) {

        const datos = documento.data();


        setNombre(datos.nombre || '');
        setTelefono(datos.telefono || '');
        setDireccion(datos.direccion || '');
        setProvincia(datos.ubicacion?.provincia || '');
        
        if (
          typeof datos.ubicacion?.latitud === 'number' &&
          typeof datos.ubicacion?.longitud === 'number'
        ) {
          setUbicacionMapa({
            direccion: datos.ubicacion?.direccion || datos.direccion || '',
            ciudad: datos.ubicacion?.ciudad || datos.ciudad || '',
            provincia: datos.ubicacion?.provincia || '',
            latitud: datos.ubicacion.latitud,
            longitud: datos.ubicacion.longitud,
          });
        }
        setCiudad(datos.ciudad || '');

      }


    } catch (error) {

      Alert.alert(
        'Error',
        'No se pudieron cargar los datos.'
      );


    } finally {

      setCargando(false);

    }

  }



  async function guardarCambios() {


    if (!nombre || !telefono) {

      Alert.alert(
        'Datos incompletos',
        'El nombre y teléfono son obligatorios.'
      );

      return;

    }



    try {


      setGuardando(true);


      const usuario = auth.currentUser;


      if (!usuario) {

        router.replace('/login');
        return;

      }



      await updateDoc(
        doc(
          db,
          'usuarios',
          usuario.uid
        ),
        {
          nombre,
          telefono,
          direccion,
          ciudad,
        }
      );



      Alert.alert(
        'Perfil actualizado',
        'Tus datos fueron guardados correctamente.'
      );


      router.replace('/(tabs)/perfil');



    } catch (error) {


      Alert.alert(
        'Error',
        'No se pudieron guardar los cambios.'
      );


    } finally {

      setGuardando(false);

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

    <View style={styles.container}>


      <Text style={styles.titulo}>
        Editar perfil
      </Text>



      <TextInput
        style={styles.input}
        placeholder="Nombre completo"
        value={nombre}
        onChangeText={setNombre}
      />



      <TextInput
        style={styles.input}
        placeholder="Teléfono"
        keyboardType="phone-pad"
        value={telefono}
        onChangeText={setTelefono}
      />
      <SelectorUbicacion
        titulo="Dirección de entrega"
        valorInicial={{
          direccion,
          ciudad,
          provincia,
          latitud: ubicacionMapa?.latitud,
          longitud: ubicacionMapa?.longitud,
        }}
        onUbicacionSeleccionada={(ubicacion) => {
          setUbicacionMapa(ubicacion);
          setDireccion(ubicacion.direccion);
          setCiudad(ubicacion.ciudad);
          setProvincia(ubicacion.provincia);
        }}
      />



      <TouchableOpacity
        style={styles.boton}
        onPress={guardarCambios}
        disabled={guardando}
      >

        <Text style={styles.textoBoton}>

          {guardando
            ? 'Guardando...'
            : 'Guardar cambios'
          }

        </Text>

      </TouchableOpacity>



      <TouchableOpacity
        onPress={() => router.back()}
      >

        <Text style={styles.cancelar}>
          Cancelar
        </Text>

      </TouchableOpacity>



    </View>

  );

}



const styles = StyleSheet.create({

  container: {

    flex:1,
    backgroundColor:'#ffffff',
    padding:25,
    justifyContent:'center',

  },


  cargando: {

    flex:1,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'#ffffff',

  },


  titulo: {

    fontSize:30,
    fontWeight:'bold',
    color:'#208AEF',
    textAlign:'center',
    marginBottom:35,

  },


  input: {

    height:55,
    borderWidth:1,
    borderColor:'#cccccc',
    borderRadius:12,
    paddingHorizontal:15,
    marginBottom:15,
    fontSize:16,

  },


  boton: {

    height:55,
    backgroundColor:'#208AEF',
    borderRadius:12,
    justifyContent:'center',
    alignItems:'center',
    marginTop:20,

  },


  textoBoton: {

    color:'#ffffff',
    fontSize:18,
    fontWeight:'bold',

  },


  cancelar: {

    textAlign:'center',
    color:'#208AEF',
    fontSize:16,
    marginTop:25,

  },


});



