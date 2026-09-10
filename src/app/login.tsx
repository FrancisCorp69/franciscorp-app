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

import {
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
} from 'firebase/auth';

import { auth } from '../services/firebase';

import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId:
    '476590468336-ofji66qo7io6t7dp9d7msk1mbkfm8l3c.apps.googleusercontent.com',
});

export default function LoginScreen() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [recuperando, setRecuperando] = useState(false);

  async function iniciarSesion() {
    const email = correo.trim();

    if (!email || !contrasena) {
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
        email,
        contrasena
      );

      router.replace('/(tabs)');
    } catch (error: any) {
      console.log('ERROR LOGIN:', error);

      let mensaje = 'No se pudo iniciar sesión.';

      switch (error?.code) {
        case 'auth/invalid-credential':
          mensaje = 'Correo o contraseña incorrectos.';
          break;

        case 'auth/user-not-found':
          mensaje = 'Este usuario no existe.';
          break;

        case 'auth/wrong-password':
          mensaje = 'La contraseña es incorrecta.';
          break;

        case 'auth/invalid-email':
          mensaje = 'El correo electrónico no es válido.';
          break;

        case 'auth/user-disabled':
          mensaje = 'Esta cuenta ha sido deshabilitada.';
          break;

        case 'auth/too-many-requests':
          mensaje =
            'Demasiados intentos. Espere unos minutos e inténtelo nuevamente.';
          break;

        case 'auth/network-request-failed':
          mensaje =
            'No hay conexión a Internet. Revise su conexión e inténtelo nuevamente.';
          break;

        default:
          mensaje =
            error?.message || 'Ocurrió un error al iniciar sesión.';
          break;
      }

      Alert.alert('No se pudo iniciar sesión', mensaje);
    } finally {
      setCargando(false);
    }
  }

  async function recuperarContrasena() {
    const email = correo.trim();

    if (!email) {
      Alert.alert(
        'Ingrese su correo',
        'Escriba primero el correo electrónico de su cuenta.'
      );
      return;
    }

    try {
      setRecuperando(true);

      await sendPasswordResetEmail(auth, email);

      Alert.alert(
        'Correo enviado',
        'Hemos enviado un enlace para recuperar su contraseña. Revise su correo electrónico y también la carpeta de spam.'
      );
    } catch (error: any) {
      console.log('ERROR RECUPERAR CONTRASEÑA:', error);

      let mensaje = 'No se pudo enviar el correo de recuperación.';

      switch (error?.code) {
        case 'auth/invalid-email':
          mensaje = 'El correo electrónico no es válido.';
          break;

        case 'auth/user-not-found':
          mensaje =
            'No encontramos una cuenta asociada a ese correo.';
          break;

        case 'auth/network-request-failed':
          mensaje =
            'No hay conexión a Internet. Revise su conexión e inténtelo nuevamente.';
          break;

        case 'auth/too-many-requests':
          mensaje =
            'Se han realizado demasiadas solicitudes. Espere unos minutos e inténtelo nuevamente.';
          break;

        default:
          mensaje =
            error?.message ||
            'No se pudo enviar el correo de recuperación.';
          break;
      }

      Alert.alert('Recuperación de contraseña', mensaje);
    } finally {
      setRecuperando(false);
    }
  }

  async function iniciarConGoogle() {
    try {
      setCargando(true);

      await GoogleSignin.hasPlayServices();

      const response = await GoogleSignin.signIn();

      if (!isSuccessResponse(response)) {
        return;
      }

      const { idToken } = await GoogleSignin.getTokens();

      if (!idToken) {
        Alert.alert(
          'Google',
          'No se pudo obtener el token de Google.'
        );
        return;
      }

      const googleCredential =
        GoogleAuthProvider.credential(idToken);

      await signInWithCredential(
        auth,
        googleCredential
      );

      router.replace('/(tabs)');
    } catch (error: any) {
      console.log('ERROR LOGIN GOOGLE:', error);

      if (
        isErrorWithCode(error) &&
        error.code === statusCodes.SIGN_IN_CANCELLED
      ) {
        return;
      }

      if (
        isErrorWithCode(error) &&
        error.code === statusCodes.IN_PROGRESS
      ) {
        Alert.alert(
          'Google',
          'Ya hay un inicio de sesión con Google en proceso.'
        );
        return;
      }

      if (
        isErrorWithCode(error) &&
        error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE
      ) {
        Alert.alert(
          'Google',
          'Google Play Services no está disponible o necesita actualizarse.'
        );
        return;
      }

      Alert.alert(
        'No se pudo iniciar sesión con Google',
        error?.message ||
          'Ocurrió un error al iniciar sesión con Google.'
      );
    } finally {
      setCargando(false);
    }
  }

  function iniciarConFacebook() {
    Alert.alert(
      'Facebook',
      'La conexión con Facebook será configurada en el siguiente paso.'
    );
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
        placeholderTextColor="#888"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={correo}
        onChangeText={setCorreo}
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Contraseña"
          placeholderTextColor="#888"
          secureTextEntry={!mostrarContrasena}
          value={contrasena}
          onChangeText={setContrasena}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          style={styles.verBoton}
          onPress={() =>
            setMostrarContrasena(!mostrarContrasena)
          }
        >
          <Text style={styles.verTexto}>
            {mostrarContrasena ? 'Ocultar' : 'Ver'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={recuperarContrasena}
        disabled={recuperando || cargando}
      >
        <Text style={styles.recuperarTexto}>
          {recuperando
            ? 'Enviando correo...'
            : '¿Olvidaste tu contraseña?'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.boton,
          (cargando || recuperando) && styles.botonDeshabilitado,
        ]}
        onPress={iniciarSesion}
        disabled={cargando || recuperando}
      >
        <Text style={styles.textoBoton}>
          {cargando ? 'Ingresando...' : 'Ingresar'}
        </Text>
      </TouchableOpacity>

      <View style={styles.separadorContainer}>
        <View style={styles.linea} />

        <Text style={styles.oTexto}>
          o continúa con
        </Text>

        <View style={styles.linea} />
      </View>

      <TouchableOpacity
        style={styles.botonSocial}
        onPress={iniciarConGoogle}
        disabled={cargando || recuperando}
      >
        <Text style={styles.googleIcon}>
          G
        </Text>

        <Text style={styles.socialTexto}>
          Continuar con Google
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.botonSocial}
        onPress={iniciarConFacebook}
        disabled={cargando || recuperando}
      >
        <Text style={styles.facebookIcon}>
          f
        </Text>

        <Text style={styles.socialTexto}>
          Continuar con Facebook
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/registro')}
        disabled={cargando || recuperando}
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
    marginBottom: 35,
  },

  input: {
    height: 55,
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#222222',
  },

  passwordContainer: {
    height: 55,
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#222222',
  },

  verBoton: {
    paddingHorizontal: 15,
  },

  verTexto: {
    color: '#208AEF',
    fontWeight: 'bold',
  },

  recuperarTexto: {
    color: '#208AEF',
    fontSize: 15,
    textAlign: 'right',
    marginBottom: 10,
    marginTop: 3,
  },

  boton: {
    height: 55,
    backgroundColor: '#208AEF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },

  botonDeshabilitado: {
    opacity: 0.6,
  },

  textoBoton: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  separadorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
  },

  linea: {
    flex: 1,
    height: 1,
    backgroundColor: '#dddddd',
  },

  oTexto: {
    marginHorizontal: 12,
    color: '#777777',
    fontSize: 14,
  },

  botonSocial: {
    height: 52,
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },

  googleIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4285F4',
    marginRight: 12,
  },

  facebookIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1877F2',
    marginRight: 12,
  },

  socialTexto: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },

  registroTexto: {
    textAlign: 'center',
    marginTop: 20,
    color: '#208AEF',
    fontSize: 16,
  },
});
