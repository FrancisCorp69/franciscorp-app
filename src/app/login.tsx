import {
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { router } from 'expo-router';

export default function LoginScreen() {
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
        placeholder="Correo o teléfono"
      />


      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
      />


      <TouchableOpacity style={styles.boton}>
        <Text style={styles.textoBoton}>
          Ingresar
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