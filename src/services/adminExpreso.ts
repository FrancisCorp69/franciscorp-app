import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

type RespuestaAdmin = {
  ok: boolean;
  mensaje: string;
};

export async function aprobarSolicitudExpreso(
  expresoId: string
): Promise<RespuestaAdmin> {
  const funcion = httpsCallable<
    { expresoId: string },
    RespuestaAdmin
  >(functions, "aprobarSolicitudExpreso");

  const resultado = await funcion({ expresoId });

  return resultado.data;
}

export async function rechazarSolicitudExpreso(
  expresoId: string
): Promise<RespuestaAdmin> {
  const funcion = httpsCallable<
    { expresoId: string },
    RespuestaAdmin
  >(functions, "rechazarSolicitudExpreso");

  const resultado = await funcion({ expresoId });

  return resultado.data;
}
