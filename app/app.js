const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config();

const app = express();
const port = 3000;

// Permet de lire les fichiers CSS/Images dans un dossier "public"
app.use(express.static(path.join(__dirname, 'public')));

const dbConfig = {
  host: process.env.DB_SERVER,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 3306,
  ssl: { rejectUnauthorized: false },
  connectTimeout: 10000 
};

app.get('/', async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    await connection.execute('INSERT INTO logs (message) VALUES (?)', [`Visite via Jenkins le ${new Date().toISOString()}`]);
    
    // Au lieu de res.send(), on envoie le fichier HTML
    res.sendFile(path.join(__dirname, 'index.html'));

  } catch (err) {
    console.error('Erreur :', err);
    res.status(500).send(`<h1>Erreur Base de données</h1><p>${err.message}</p>`);
  } finally {
    if (connection) await connection.end();
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Application lancée sur http://0.0.0.0:${port}`);
});