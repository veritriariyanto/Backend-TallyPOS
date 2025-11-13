import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as bcrypt from 'bcrypt';

config();

const updateAdminPassword = async () => {
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
    
    // Hash password
    const newPassword = 'admin123'; // Ganti dengan password yang Anda inginkan
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update admin password
    await dataSource.query(
      `UPDATE users SET password = $1 WHERE username = 'admin'`,
      [hashedPassword]
    );
    
    console.log('Admin password updated successfully!');
    console.log(`Username: admin`);
    console.log(`Password: ${newPassword}`);
    
    await dataSource.destroy();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

updateAdminPassword();
