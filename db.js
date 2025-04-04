import { config } from "./config.js";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  user: config.DB_USER,
  host: config.DB_HOST,
  password: config.DB_PASSWORD,
  database: config.DB_DATABASE,
  port: config.DB_PORT,
});
console.log("Variables cargadas de .env");
console.log("DB_USER:", config.DB_USER);
console.log("DB_PASSWORD:", config.DB_PASSWORD);

pool.connect()
  .then(() => console.log("Conectado a PostgreSQL"))
  .catch(err => console.error("Error al conectar a PostgreSQL:", err));

export default pool;  