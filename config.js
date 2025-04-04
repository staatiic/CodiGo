import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('CodiGo/.env') });

export const config = {
  DB_USER: process.env.DB_USER,
  DB_HOST: process.env.DB_HOST,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_DATABASE: process.env.DB_DATABASE,
  DB_PORT: process.env.DB_PORT || 5432,
  PORT: process.env.PORT || 3000
};
