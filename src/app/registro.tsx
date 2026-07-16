import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { router } from 'expo-router';
import { useState } from 'react';

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

import { auth, db } from '../services/firebase';


export default function RegistroScreen() {

  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');



  const registrarUsuario = async () => {

    if (!nombre || !correo || !telefono || !password) {
      Alert.alert(
        'Campos incompletos',
        'Por favor completa todos los datos'
      );
      return;
    }


    try {

      const usuario = await createUserWithEmailAndPassword(
        auth,
        correo,
        password
      );


      await setDoc(
        doc(db, 'usuarios', usuario.user.uid),
        {
          nombre,
          correo,
          telefono,
          direccion: '',
          ciudad: '',
          fechaRegistro: new Date(),
        }
      );


      Alert.alert(
        'Cuenta creada',
        'Bienvenido a FrancisCorp'
      );


      router.replace('/login');


    } catch (error:any) {

      Alert.alert(
        'Error',
        error.message
      );

    }

  };


  return (
    <View style={styles.container}>


      <Image
        source={require('../../assets/images/franciscorp-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />


      <Text style={styles.titulo}>
        Crear cuenta
      </Text>



      <TextInput
        style={styles.input}
        placeholder="Nombre completo"
        value={nombre}
        onChangeText={setNombre}
      />


      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        keyboardType="email-address"
        autoCapitalize="none"
        value={correo}
        onChangeText={setCorreo}
      />


      <TextInput
        style={styles.input}
        placeholder="Teléfono"
        keyboardType="phone-pad"
        value={telefono}
        onChangeText={setTelefono}
      />


      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        autoCapitalize="none"
        value={password}
        onChangeText={setPassword}
      />



      <TouchableOpacity
        style={styles.boton}
        onPress={registrarUsuario}
      >

        <Text style={styles.textoBoton}>
          Registrarse
        </Text>

      </TouchableOpacity>



      <TouchableOpacity
        onPress={() => router.push('/login')}
      >

        <Text style={styles.loginTexto}>
          ¿Ya tienes cuenta? Iniciar sesión
        </Text>

      </TouchableOpacity>


    </View>
  );
}



const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:'#ffffff',
    padding:25,
    justifyContent:'center',
  },


  logo:{
    width:150,
    height:150,
    alignSelf:'center',
    marginBottom:15,
  },


  titulo:{
    fontSize:32,
    fontWeight:'bold',
    textAlign:'center',
    marginBottom:35,
    color:'#208AEF',
  },


  input:{
    height:55,
    borderWidth:1,
    borderColor:'#cccccc',
    borderRadius:12,
    paddingHorizontal:15,
    marginBottom:15,
    fontSize:16,
  },


  boton:{
    backgroundColor:'#208AEF',
    height:55,
    borderRadius:12,
    alignItems:'center',
    justifyContent:'center',
    marginTop:15,
  },


  textoBoton:{
    color:'#ffffff',
    fontSize:18,
    fontWeight:'bold',
  },


  loginTexto:{
    textAlign:'center',
    marginTop:25,
    color:'#208AEF',
    fontSize:16,
  },

});