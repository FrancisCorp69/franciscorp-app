import { Stack } from "expo-router";
import { CartProvider } from "../context/CartContext";
import AuthProvider from "../components/AuthProvider";

export default function Layout() {
  return (
    <AuthProvider>
      <CartProvider>
        <Stack />
      </CartProvider>
    </AuthProvider>
  );
}
