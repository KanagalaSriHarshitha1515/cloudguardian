import app from "./app.js";
import prisma from "./config/prisma.js";

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await prisma.$connect();

    console.log("✅ Connected to PostgreSQL");

    app.listen(PORT, () => {
      console.log(`
=========================================
🚀 CloudGuardian Backend Started
=========================================
Server : http://localhost:${PORT}
Health : http://localhost:${PORT}/health
=========================================
`);
    });
  } catch (error) {
    console.error("❌ Database Connection Failed");
    console.error(error);

    process.exit(1);
  }
}

startServer();