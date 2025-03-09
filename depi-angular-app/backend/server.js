const express = require('express');
const cors = require('cors');
const db = require('./db'); // Import the connection pool
const app = express();

const client = require('prom-client'); //using prom client library to write an exporter to the app
const collectDefaultMetrics = client.collectDefaultMetrics; //prom client expose default metrics out of the box
collectDefaultMetrics({ timeout: 5000 }); // defaut metrics will be updated every 5 sec


const httpRequestsTotal = new client.Counter({
  name: 'http_requests_operations_total',
  help: 'Total number of Http requests'
})


const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of http request in seconds',
  buckets: [0.1, 0.5, 2, 5, 10]
});



// Enable CORS
app.use(cors());

// API route
app.get('/', (req, res) => {
  // simulate sleep for a random number of milliseconds to calculate http request duration
  var start = new Date()
  var simulateTime = Math.floor(Math.random() * (10000 - 500 + 1) + 500)
  // simulate the duration time
  setTimeout(function(argument){
    var end = new Date() - start
    httpRequestDurationSeconds.observe(end / 1000); // convert to seconds
}, simulateTime)
  httpRequestsTotal.inc();

  // Use the pool to ping the database
  db.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting a connection from the pool:', err.message);
      res.status(500).json({ 
        message: 'Node.js backend is running', 
        dbStatus: 'Database connection failed', 
        error: err.message 
      });
      return;
    }

    connection.ping((pingErr) => {
      connection.release(); // Release the connection back to the pool
      if (pingErr) {
        console.error('Error pinging the database:', pingErr.message);
        res.status(500).json({ 
          message: 'Node.js backend is running', 
          dbStatus: 'Database connection failed', 
          error: pingErr.message 
        });
      } else {
        console.log('Database connection successful');
        res.status(200).json({ 
          message: 'Node.js backend is running', 
          dbStatus: 'Database connection successful' 
        });
      }
    });
  });
});







app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType) //set format of data
  res.end(await client.register.metrics()) // sending the metrics to the browser
});












// Start server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});