const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
const port = 5500;

// MySQL database connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'username',
  password: 'password',
  database: 'database_name'
});

connection.connect();

// Middleware to parse JSON data
app.use(bodyParser.json());

// Endpoint to receive time log data and insert into database
app.post('/timelog', (req, res) => {
  const { currentTimeIn, currentTimeOut, efficiency } = req.body;

  const sql = 'INSERT INTO timelog (time_in, time_out, efficiency) VALUES (?, ?, ?)';
  connection.query(sql, [currentTimeIn, currentTimeOut, efficiency], (error, results, fields) => {
    if (error) {
      console.error('Error inserting time log:', error);
      res.status(500).send('Error inserting time log');
    } else {
      console.log('Time log inserted successfully.');
      res.sendStatus(200);
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
