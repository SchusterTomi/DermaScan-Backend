// CONEXION A NEON

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_iLMY6lX3vZGN@ep-shy-leaf-a8uoatzq-pooler.eastus2.azure.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = pool;
