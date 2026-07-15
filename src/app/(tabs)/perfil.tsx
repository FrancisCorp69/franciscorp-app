import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { router } from 'expo-router';

export default function PerfilScreen() {
  return (
    <View style={styles.container}>

      <Image
        source={require('../../../assets/images/franciscorp-logo.png')}
        style={styles.foto}
      />


      <Text style={styles.titulo}>
        Perfil
      </Text>


      <View style={styles.info}>

        <Text style={styles.label}>
          Nombre:
        </Text>

        <Text style={styles.valor}>
          Usuario FrancisCorp
        </Text>


        <Text style={styles.label}>
          Correo:
        </Text>

        <Text style={styles.valor}>
          No registrado
        </Text>


        <Text style={styles.label}>
          Teléfono:
        </Text>

        <Text style={styles.valor}>
          No registrado
        </Text>


        <Text style={styles.label}>
          Dirección:
        </Text>

        <Text style={styles.valor}>
          No registrada
        </Text>

      </View>


      <TouchableOpacity
  style={styles.boton}
  onPress={() => router.push('/login')}
>
  <Text style={styles.textoBoton}>
    Iniciar sesión
  </Text>
</TouchableOpacity>


    </View>
  );
}



const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    padding: 25,
  },


  foto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginTop: 50,
    marginBottom: 20,
  },


  titulo: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#208AEF',
    marginBottom: 30,
  },


  info: {
    width: '100%',
  },


  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    color: '#333333',
  },


  valor: {
    fontSize: 16,
    marginTop: 5,
    color: '#666666',
  },


  boton: {
    marginTop: 40,
    width: '100%',
    height: 55,
    backgroundColor: '#208AEF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },


  textoBoton: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },

});