import { StyleSheet, Text, View } from "react-native";

export default function MainBanner() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>FrancisCorp</Text>

      <Text style={styles.subtitle}>
        Todo lo que necesitas en una sola aplicación.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: "#0066CC",
    borderRadius: 22,
    padding: 24,
  },

  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },

  subtitle: {
    marginTop: 8,
    color: "#fff",
    fontSize: 16,
    lineHeight: 22,
  },
});