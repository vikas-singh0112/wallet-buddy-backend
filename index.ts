import "dotenv/config";
import { app } from "./src/app";
import { prisma } from "./src/db/prismaInstance";

const PORT: String = process.env.PORT || "9100";

prisma
  .$connect()
  .then(() => {
    return prisma.$executeRaw`SELECT 1`;
  })
  .then(() => {
    console.log("Conneced to DB");
    app.listen(PORT, () => {
      console.log(`server started on port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
  });
