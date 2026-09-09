import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

export async function activarAdministradorInicial() {
  const activar = httpsCallable<
    Record<string, never>,
    {
      ok: boolean;
      mensaje: string;
    }
  >(functions, "activarAdministradorInicial");

  const resultado = await activar({});

  return resultado.data;
}
