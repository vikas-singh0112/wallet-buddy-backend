import "dotenv/config";
import { app } from "./src/app";
import { prisma } from "./src/db/prismaInstance";

const PORT: String = process.env.PORT || "9100";

async function startServer() {
  try {
    await prisma.$connect();
    console.log("Database Connected");
    app.listen(PORT, () => {
      console.log(`server started on port: ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
