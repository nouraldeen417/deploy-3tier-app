const mysql = require('mysql2');
// host: 'db',       // Replace with your database host
// user: 'root',     // Replace with your database username
// password: 'rootpassword',     // Replace with your database password
// database: 'angular', // Replace with your database name
// Create a connection pool to the database
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'db1',       // Replace with your database host
  user: process.env.DB_USER || 'root',     // Replace with your database username
  password: process.env.DB_PASS ||'ootpassword',     // Replace with your database password
  database: process.env.DB_NAME || 'angular', // Replace with your database name
  waitForConnections: true,
  connectionLimit: 10, // Limit the number of connections
  queueLimit: 0       // No limit for the queue
});

module.exports = pool;
