import { View, Text } from "react-native";

export default function SolicitudesExpreso() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <Text style={{ fontSize: 22, fontWeight: "700" }}>
        Solicitudes Expreso
      </Text>

      <Text
        style={{
          marginTop: 10,
          fontSize: 16,
          textAlign: "center",
        }}
      >
        Aquí aparecerán las solicitudes de viajes para el conductor Expreso.
      </Text>
    </View>
  );
}
