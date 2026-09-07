const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

async function main() {
  const snapshot = await db.collection("negocios").get();

  console.log("\n=== NEGOCIOS EN FIRESTORE ===\n");

  if (snapshot.empty) {
    console.log("NO HAY NEGOCIOS.");
    return;
  }

  snapshot.forEach((doc) => {
    const data = doc.data() || {};

    console.log("ID:", doc.id);
    console.log("NOMBRE:", data.nombre || "(sin nombre)");
    console.log("PROPIETARIO ID:", data.propietarioId || "(sin propietarioId)");
    console.log("OWNER ID:", data.ownerId || "(sin ownerId)");
    console.log("----------------------------------------");
  });
}

main().catch((error) => {
  console.error("\nERROR:", error);
  process.exit(1);
});
