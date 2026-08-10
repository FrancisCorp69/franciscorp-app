import { StyleSheet, TextInput, View } from "react-native";

export default function SearchBar() {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="¿Qué estás buscando?"
        placeholderTextColor="#888"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 18,
  },

  input: {
    height: 50,
    backgroundColor: "#F3F4F6",
    borderRadius: 15,
    paddingHorizontal: 18,
    fontSize: 16,
    color: "#222",
  },
});
