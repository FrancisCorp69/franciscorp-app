import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";

export interface CartItem {
  productoId: string;
  nombre: string;
  precio: number;
  foto?: string;
  cantidad: number;
  subtotal: number;
}

export interface Cart {
  negocioId: string;
  negocioNombre: string;
  items: CartItem[];
}

interface CartContextType {
  cart: Cart | null;
  items: CartItem[];
  totalItems: number;
  subtotal: number;

  agregarProducto: (
    negocioId: string,
    negocioNombre: string,
    producto: {
      id: string;
      nombre?: string;
      precio?: number;
      foto?: string;
    }
  ) => boolean;

  aumentarCantidad: (productoId: string) => void;
  disminuirCantidad: (productoId: string) => void;
  eliminarProducto: (productoId: string) => void;
  vaciarCarrito: () => void;
}

const CartContext = createContext<CartContextType | undefined>(
  undefined
);

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({
  children,
}: CartProviderProps) {
  const [cart, setCart] = useState<Cart | null>(null);

  function agregarProducto(
    negocioId: string,
    negocioNombre: string,
    producto: {
      id: string;
      nombre?: string;
      precio?: number;
      foto?: string;
    }
  ): boolean {
    const precio = Number(producto.precio) || 0;
    const nombre = producto.nombre || "Producto";

    if (!cart) {
      const nuevoItem: CartItem = {
        productoId: producto.id,
        nombre,
        precio,
        foto: producto.foto,
        cantidad: 1,
        subtotal: precio,
      };

      setCart({
        negocioId,
        negocioNombre,
        items: [nuevoItem],
      });

      return true;
    }

    if (cart.negocioId !== negocioId) {
      return false;
    }

    const existe = cart.items.find(
      (item) => item.productoId === producto.id
    );

    if (existe) {
      const itemsActualizados = cart.items.map((item) => {
        if (item.productoId !== producto.id) {
          return item;
        }

        const nuevaCantidad = item.cantidad + 1;

        return {
          ...item,
          cantidad: nuevaCantidad,
          subtotal: item.precio * nuevaCantidad,
        };
      });

      setCart({
        ...cart,
        items: itemsActualizados,
      });

      return true;
    }

    const nuevoItem: CartItem = {
      productoId: producto.id,
      nombre,
      precio,
      foto: producto.foto,
      cantidad: 1,
      subtotal: precio,
    };

    setCart({
      ...cart,
      items: [...cart.items, nuevoItem],
    });

    return true;
  }

  function aumentarCantidad(productoId: string) {
    if (!cart) return;

    const itemsActualizados = cart.items.map((item) => {
      if (item.productoId !== productoId) {
        return item;
      }

      const nuevaCantidad = item.cantidad + 1;

      return {
        ...item,
        cantidad: nuevaCantidad,
        subtotal: item.precio * nuevaCantidad,
      };
    });

    setCart({
      ...cart,
      items: itemsActualizados,
    });
  }

  function disminuirCantidad(productoId: string) {
    if (!cart) return;

    const item = cart.items.find(
      (item) => item.productoId === productoId
    );

    if (!item) return;

    if (item.cantidad <= 1) {
      eliminarProducto(productoId);
      return;
    }

    const itemsActualizados = cart.items.map((item) => {
      if (item.productoId !== productoId) {
        return item;
      }

      const nuevaCantidad = item.cantidad - 1;

      return {
        ...item,
        cantidad: nuevaCantidad,
        subtotal: item.precio * nuevaCantidad,
      };
    });

    setCart({
      ...cart,
      items: itemsActualizados,
    });
  }

  function eliminarProducto(productoId: string) {
    if (!cart) return;

    const itemsActualizados = cart.items.filter(
      (item) => item.productoId !== productoId
    );

    if (itemsActualizados.length === 0) {
      setCart(null);
      return;
    }

    setCart({
      ...cart,
      items: itemsActualizados,
    });
  }

  function vaciarCarrito() {
    setCart(null);
  }

  const items = cart?.items ?? [];

  const totalItems = useMemo(() => {
    return items.reduce(
      (total, item) => total + item.cantidad,
      0
    );
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce(
      (total, item) => total + item.subtotal,
      0
    );
  }, [items]);

  const value = useMemo(
    () => ({
      cart,
      items,
      totalItems,
      subtotal,
      agregarProducto,
      aumentarCantidad,
      disminuirCantidad,
      eliminarProducto,
      vaciarCarrito,
    }),
    [
      cart,
      items,
      totalItems,
      subtotal,
    ]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart debe utilizarse dentro de un CartProvider"
    );
  }

  return context;
}
