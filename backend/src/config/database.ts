import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: 'localhost',
  port: parseInt(process.env.DB_PORT || '5433', 10),
  user: 'chatbots',
  password: 'mysecretpassword',
  database: 'bi_insight_hub',
});

export default pool;
