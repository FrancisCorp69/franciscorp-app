import { collection, getDocs } from "firebase/firestore";

import { db } from "./firebase";

export interface Business {
  id: string;
  nombre: string;
  tipo?: string;
  tipoNombre?: string;
  categoria: string;
  descripcion?: string;

  contacto?: {
    telefono?: string;
    whatsapp?: string;
    correo?: string;
    redesSociales?: string;
    paginaWeb?: string;
  };

  ubicacion?: {
    direccion?: string;
    ciudad?: string;
    provincia?: string;
    referencia?: string;
    zonaCobertura?: string;
  };

  foto?: string;
  calificacion?: number;
  costoEntrega?: number;
  tiempoEntrega?: number;
  estado?: string;
  activo?: boolean;
}

export async function getBusinesses(): Promise<Business[]> {
  try {
    const snapshot = await getDocs(collection(db, "negocios"));

    const negocios = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Business[];

    console.log("NEGOCIOS ENCONTRADOS:", negocios.length);
    console.log("DATOS DE NEGOCIOS:", negocios);

    return negocios;
  } catch (error) {
    console.error("Error obteniendo negocios:", error);

    return [];
  }
}
