import { useState } from 'react';
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

import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';

export default function LoginScreen() {

  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [cargando, setCargando] = useState(false);

  async function iniciarSesion() {

    if (!correo || !contrasena) {
      Alert.alert(
        'Campos incompletos',
        'Ingrese su correo y contraseña.'
      );
      return;
    }

    try {

      setCargando(true);

      await signInWithEmailAndPassword(
        auth,
        correo.trim(),
        contrasena
      );

      router.replace('/(tabs)');

    } catch (error: any) {

      let mensaje = 'Ocurrió un error.';

      switch (error.code) {

        case 'auth/invalid-credential':
          mensaje = 'Correo o contraseña incorrectos.';
          break;

        case 'auth/user-not-found':
          mensaje = 'Este usuario no existe.';
          break;

        case 'auth/wrong-password':
          mensaje = 'Contraseña incorrecta.';
          break;

        case 'auth/invalid-email':
          mensaje = 'Correo electrónico inválido.';
          break;

        default:
          mensaje = error.message;
      }

      Alert.alert('Error', mensaje);

    } finally {
      setCargando(false);
    }

  }

  return (
    <View style={styles.container}>

      <Image
        source={require('../../assets/images/franciscorp-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.titulo}>
        Bienvenido a FrancisCorp
      </Text>

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
        placeholder="Contraseña"
        secureTextEntry
        value={contrasena}
        onChangeText={setContrasena}
      />

      <TouchableOpacity
        style={styles.boton}
        onPress={iniciarSesion}
        disabled={cargando}
      >
        <Text style={styles.textoBoton}>
          {cargando ? 'Ingresando...' : 'Ingresar'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/registro')}
      >
        <Text style={styles.registroTexto}>
          ¿No tienes cuenta? Crear cuenta
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 25,
    justifyContent: 'center',
  },

  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 20,
  },

  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#208AEF',
    marginBottom: 40,
  },

  input: {
    height: 55,
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },

  boton: {
    height: 55,
    backgroundColor: '#208AEF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },

  textoBoton: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  registroTexto: {
    textAlign: 'center',
    marginTop: 25,
    color: '#208AEF',
    fontSize: 16,
  },

});