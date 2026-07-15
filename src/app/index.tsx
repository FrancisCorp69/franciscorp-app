import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function HomeScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >

      <Image
        source={require('../../assets/images/franciscorp-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.titulo}>
        ¡Hola! ¿Qué necesitas hoy?
      </Text>

      <TextInput
        placeholder="Buscar servicio..."
        style={styles.buscar}
      />

      <View style={styles.grid}>

        <View style={styles.card}>
          <MaterialCommunityIcons
            name="motorbike"
            size={34}
            color="#0066CC"
            style={styles.icon}
          />
          <Text style={styles.cardText}>Delivery</Text>
        </View>

        <View style={styles.card}>
          <MaterialCommunityIcons
            name="taxi"
            size={34}
            color="#0066CC"
            style={styles.icon}
          />
          <Text style={styles.cardText}>Carreras</Text>
        </View>

        <View style={styles.card}>
          <MaterialCommunityIcons
            name="cart"
            size={34}
            color="#0066CC"
            style={styles.icon}
          />
          <Text style={styles.cardText}>Compras</Text>
        </View>

        <View style={styles.card}>
          <MaterialCommunityIcons
            name="silverware-fork-knife"
            size={34}
            color="#0066CC"
            style={styles.icon}
          />
          <Text style={styles.cardText}>Restaurante</Text>
        </View>

        <View style={styles.card}>
          <MaterialCommunityIcons
            name="pill"
            size={34}
            color="#0066CC"
            style={styles.icon}
          />
          <Text style={styles.cardText}>Farmacia</Text>
        </View>

        <View style={styles.card}>
          <MaterialCommunityIcons
            name="store"
            size={34}
            color="#0066CC"
            style={styles.icon}
          />
          <Text style={styles.cardText}>Tienda</Text>
        </View>

      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  content: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  logo: {
    width: 170,
    height: 170,
    marginBottom: 20,
  },

  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066CC',
    marginBottom: 20,
  },

  buscar: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#F8F8F8',
  },

  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 30,
  },

  card: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 20,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },

  icon: {
    marginBottom: 10,
  },

  cardText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0066CC',
  },
});