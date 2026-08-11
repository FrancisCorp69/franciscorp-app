import { collection, getDocs } from "firebase/firestore";

import { db } from "./firebase";

export interface Business {
  id: string;
  nombre: string;
  categoria: string;
  descripcion?: string;
  direccion?: string;
  ciudad?: string;
  foto?: string;
  calificacion?: number;
  costoEntrega?: number;
  tiempoEntrega?: number;
  activo?: boolean;
}

export async function getBusinesses(): Promise<Business[]> {
  try {
    const snapshot = await getDocs(collection(db, "negocios"));

    const negocios: Business[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Business[];

    return negocios;
  } catch (error) {
    console.error("Error obteniendo negocios:", error);

    return [];
  }
}
