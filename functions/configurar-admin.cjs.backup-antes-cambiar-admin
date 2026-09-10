const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

initializeApp({
  projectId: "franciscorp-app",
});

const UID_ADMIN = "cjkFpObYrEZwhDU0kBo6Oz6YdzJ2";

async function main() {
  const usuario = await getAuth().getUser(UID_ADMIN);

  console.log("============================================");
  console.log(" CONFIGURANDO ADMINISTRADOR FRANCISCORP");
  console.log("============================================");
  console.log("Email:", usuario.email);
  console.log("UID:", usuario.uid);

  await getAuth().setCustomUserClaims(UID_ADMIN, {
    ...(usuario.customClaims || {}),
    admin: true,
  });

  const actualizado = await getAuth().getUser(UID_ADMIN);

  console.log("");
  console.log("✅ ADMINISTRADOR CONFIGURADO");
  console.log("Email:", actualizado.email);
  console.log("UID:", actualizado.uid);
  console.log("Claim admin:", actualizado.customClaims?.admin);
  console.log("");
  console.log("============================================");
  console.log(" PROCESO TERMINADO");
  console.log("============================================");
}

main().catch((error) => {
  console.error("");
  console.error("❌ ERROR:", error);
  process.exit(1);
});
