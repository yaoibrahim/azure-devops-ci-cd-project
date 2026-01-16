const express = require('express');
const mysql = require('mysql2/promise'); // Utilisation des promesses pour async/await
require('dotenv').config(); // Pour lire le fichier .env

const app = express();
const port = 3000;

// Configuration de la connexion
const dbConfig = {
  host: process.env.DB_SERVER,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 3306,
  ssl: {
    rejectUnauthorized: false // Requis pour les connexions Azure MySQL
  }
};

app.get('/', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Insertion d'un log à chaque visite
    await connection.execute('INSERT INTO logs (message) VALUES (?)', ['Visite via l\'application']);
    
    // Récupération de la date du serveur
    const [rows] = await connection.execute('SELECT NOW() AS date');
    
    await connection.end();
    res.send(`🚀 Application Azure DevOps en ligne - Date MySQL : ${rows[0].date}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Erreur de connexion à la base MySQL : ' + err.message);
  }
});

app.listen(port, () => {
  console.log(`Application lancée sur http://localhost:${port}`);
});