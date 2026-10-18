import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";

import dns from "node:dns";

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`GemLink API running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Database startup failed:", error.message);
    console.error("Check MONGO_URI, database credentials and Atlas network access.");
    process.exit(1);
  }
}

dns.setServers(["8.8.8.8"]);

startServer();