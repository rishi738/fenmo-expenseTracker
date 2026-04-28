import { createApp } from "./app.js";
import { sequelize } from "./config/database.js";

const app = createApp();
const port = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.authenticate();
    app.listen(port, () => {
      console.log(`Expense Tracker API running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error);
    process.exit(1);
  }
}

start();
