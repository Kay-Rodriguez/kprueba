import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connection from "./config/database.js";

import authRoutes from "./routers/auth_routes.js";
import clientesRoutes from "./routers/clientes_routes.js";
import tecnicosRoutes from "./routers/tecnicos_routes.js";
import ticketsRoutes from "./routers/tickets_routes.js";

dotenv.config();
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// DB
connection();

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/clientes", clientesRoutes);
app.use("/api/tecnicos", tecnicosRoutes);
app.use("/api/tickets", ticketsRoutes);

app.get("/", (req, res) => res.send("API funcionando 🚀"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server ok en http://localhost:${PORT}`));
