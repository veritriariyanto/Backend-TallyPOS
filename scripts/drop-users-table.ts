import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

const dropUsersTable = async () => {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  try {
    await dataSource.initialize();
    console.log('Connected to database');
    
    await dataSource.query('DROP TABLE IF EXISTS users CASCADE');
    console.log('Users table dropped successfully');
    
    await dataSource.destroy();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

dropUsersTable();
