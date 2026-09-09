const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();

const db = getFirestore();

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const CHANNEL_ID = "pedidos";

const ESTADOS = {
  pendiente: {
    titulo: "🛒 Nuevo pedido",
    mensaje: "Tienes un nuevo pedido pendiente.",
  },

  aceptado: {
    titulo: "✅ Pedido aceptado",
    mensaje: "El negocio aceptó tu pedido.",
  },

  preparando: {
    titulo: "👨‍🍳 Pedido en preparación",
    mensaje: "Tu pedido ya está siendo preparado.",
  },

  listo: {
    titulo: "📦 Pedido listo",
    mensaje: "Tu pedido está listo para ser entregado.",
  },

  en_camino: {
    titulo: "🚗 Pedido en camino",
    mensaje: "Tu pedido ya está en camino.",
  },

  entregado: {
    titulo: "🎉 Pedido entregado",
    mensaje: "Tu pedido ha sido entregado correctamente.",
  },

  cancelado: {
    titulo: "❌ Pedido cancelado",
    mensaje: "Tu pedido ha sido cancelado.",
  },
};

function esExpoToken(token) {
  return (
    typeof token === "string" &&
    token.startsWith("ExponentPushToken[")
  );
}

function limpiarTokens(tokens) {
  if (!Array.isArray(tokens)) {
    return [];
  }

  return [...new Set(tokens.filter(esExpoToken))];
}

async function obtenerTokensUsuario(uid) {
  if (!uid) {
    return [];
  }

  const usuarioSnap = await db
    .collection("usuarios")
    .doc(uid)
    .get();

  if (!usuarioSnap.exists) {
    console.log("Usuario no encontrado:", uid);
    return [];
  }

  const datos = usuarioSnap.data() || {};

  return limpiarTokens(datos.expoPushTokens);
}

async function obtenerPropietarioNegocio(negocioId) {
  if (!negocioId) {
    return null;
  }

  const negocioSnap = await db
    .collection("negocios")
    .doc(negocioId)
    .get();

  if (!negocioSnap.exists) {
    console.log("Negocio no encontrado:", negocioId);
    return null;
  }

  const datos = negocioSnap.data() || {};

  return datos.propietarioId || datos.ownerId || null;
}

async function enviarExpo(tokens, titulo, mensaje, data = {}) {
  const tokensValidos = limpiarTokens(tokens);

  if (tokensValidos.length === 0) {
    console.log("No hay tokens para enviar:", titulo);
    return;
  }

  const mensajes = tokensValidos.map((token) => ({
    to: token,
    sound: "default",
    title: titulo,
    body: mensaje,
    channelId: CHANNEL_ID,
    priority: "high",
    data,
  }));

  try {
    const respuesta = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mensajes),
    });

    const resultado = await respuesta.json();

    console.log(
      "EXPO PUSH:",
      JSON.stringify(resultado)
    );
  } catch (error) {
    console.error(
      "ERROR ENVIANDO NOTIFICACION:",
      error
    );
  }
}

async function notificarUsuario(
  uid,
  titulo,
  mensaje,
  data
) {
  const tokens = await obtenerTokensUsuario(uid);

  await enviarExpo(
    tokens,
    titulo,
    mensaje,
    data
  );
}

async function notificarNegocio(
  negocioId,
  titulo,
  mensaje,
  data
) {
  const propietarioId =
    await obtenerPropietarioNegocio(
      negocioId
    );

  if (!propietarioId) {
    console.log(
      "No se encontró propietario para negocio:",
      negocioId
    );
    return;
  }

  await notificarUsuario(
    propietarioId,
    titulo,
    mensaje,
    data
  );
}

/**
 * NUEVO PEDIDO
 *
 * Cuando se crea un pedido:
 * CLIENTE -> NEGOCIO
 */
exports.notificarNuevoPedido =
  onDocumentCreated(
    "pedidos/{pedidoId}",
    async (event) => {
      const snapshot = event.data;

      if (!snapshot) {
        return;
      }

      const pedido = snapshot.data() || {};
      const pedidoId = event.params.pedidoId;

      console.log(
        "NUEVO PEDIDO:",
        pedidoId
      );

      const negocioNombre =
        pedido.negocioNombre ||
        "tu negocio";

      await notificarNegocio(
        pedido.negocioId,
        "🛒 Nuevo pedido",
        `Has recibido un nuevo pedido en ${negocioNombre}.`,
        {
          tipo: "nuevo_pedido",
          pedidoId,
          negocioId: pedido.negocioId || "",
          estado: pedido.estado || "pendiente",
        }
      );
    }
  );

/**
 * CAMBIO DE ESTADO
 *
 * Se ejecuta solamente cuando cambia realmente
 * el campo estado.
 */
exports.notificarCambioEstado =
  onDocumentUpdated(
    "pedidos/{pedidoId}",
    async (event) => {
      const before =
        event.data.before.data() || {};

      const after =
        event.data.after.data() || {};

      const pedidoId =
        event.params.pedidoId;

      const estadoAnterior =
        before.estado;

      const estadoNuevo =
        after.estado;

      if (
        estadoAnterior === estadoNuevo
      ) {
        return;
      }

      console.log(
        "CAMBIO DE ESTADO:",
        pedidoId,
        estadoAnterior,
        "->",
        estadoNuevo
      );

      const configuracion =
        ESTADOS[estadoNuevo];

      if (!configuracion) {
        console.log(
          "Estado sin notificación:",
          estadoNuevo
        );
        return;
      }

      const datos = {
        tipo: "cambio_estado_pedido",
        pedidoId,
        negocioId: after.negocioId || "",
        estadoAnterior:
          estadoAnterior || "",
        estadoNuevo,
      };

      /**
       * ACEPTADO
       * PREPARANDO
       * LISTO
       * EN_CAMINO
       * ENTREGADO
       *
       * NEGOCIO -> CLIENTE
       */
      if (
        [
          "aceptado",
          "preparando",
          "listo",
          "en_camino",
          "entregado",
        ].includes(estadoNuevo)
      ) {
        await notificarUsuario(
          after.usuarioId,
          configuracion.titulo,
          configuracion.mensaje,
          datos
        );

        return;
      }

      /**
       * CANCELADO
       *
       * El negocio cancela:
       * NEGOCIO -> CLIENTE
       */
      if (estadoNuevo === "cancelado") {
        await notificarUsuario(
          after.usuarioId,
          "❌ Pedido cancelado",
          "Tu pedido ha sido cancelado.",
          datos
        );

        return;
      }
    }
  );
