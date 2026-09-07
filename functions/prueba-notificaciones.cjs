const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

initializeApp({
  projectId: "franciscorp-app"
});

const db = getFirestore();

const pedidoId = "PRUEBA-NOTIFICACION-" + Date.now();

async function main() {
  console.log("\n=== PRUEBA DE NOTIFICACIONES ===\n");
  console.log("Pedido:", pedidoId);
  console.log("Negocio: Prueba6");
  console.log("Negocio ID: IpuLuOC5klwviMhOE9ee");

  await db.collection("pedidos").doc(pedidoId).set({
    usuarioId: "IjYVdGiiy1SFzUr3DQvYpdzDUFD3",
    negocioId: "IpuLuOC5klwviMhOE9ee",
    negocioNombre: "Prueba6",
    estado: "pendiente",
    fechaCreacion: FieldValue.serverTimestamp(),
    esPrueba: true
  });

  console.log("\n✅ PEDIDO DE PRUEBA CREADO");
  console.log("Esperando 8 segundos para que se procese...");
  
  await new Promise(resolve => setTimeout(resolve, 8000));

  await db.collection("pedidos").doc(pedidoId).update({
    estado: "aceptado"
  });

  console.log("✅ ESTADO CAMBIADO A: aceptado");
  console.log("Esperando 8 segundos...");
  
  await new Promise(resolve => setTimeout(resolve, 8000));

  await db.collection("pedidos").doc(pedidoId).delete();

  console.log("✅ PEDIDO DE PRUEBA ELIMINADO");
  console.log("\n=== PRUEBA TERMINADA ===\n");
}

main().catch(error => {
  console.error("\n❌ ERROR:", error);
  process.exit(1);
});
