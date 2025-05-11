import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'aimtest',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// 연결 테스트
pool
  .getConnection()
  .then((connection) => {
    console.log('Database connected successfully!');
    connection.release();
  })
  .catch((error) => {
    console.error('Database connection failed:', error);
  });

export default pool;
