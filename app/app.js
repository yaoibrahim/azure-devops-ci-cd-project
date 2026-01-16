const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const port = 3000;

// Configuration de la connexion utilisant les variables d'environnement
const dbConfig = {
  host: process.env.DB_SERVER,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 3306,
  ssl: {
    rejectUnauthorized: false // Indispensable pour Azure Database for MySQL
  },
  connectTimeout: 10000 // 10 secondes de timeout pour éviter les blocages infinis
};

app.get('/', async (req, res) => {
  let connection;
  try {
    // Debug : affiche les infos de connexion dans les logs (utile pour Docker logs)
    console.log(`Tentative de connexion à : ${process.env.DB_SERVER} avec l'utilisateur : ${process.env.DB_USER}`);

    connection = await mysql.createConnection(dbConfig);
    
    // 1. Insertion d'un log (Assure-toi que la table 'logs' existe via ton script migrations.sql)
    await connection.execute('INSERT INTO logs (message) VALUES (?)', [`Visite enregistrée le ${new Date().toISOString()}`]);
    
    // 2. Récupération de la date du serveur MySQL
    const [rows] = await connection.execute('SELECT NOW() AS date');
    
    res.send(`
      <h1>🚀 Application Azure DevOps en ligne</h1>
      <p><strong>Statut :</strong> Connecté à Azure MySQL</p>
      <p><strong>Date du serveur SQL :</strong> ${rows[0].date}</p>
    `);

  } catch (err) {
    console.error('Détail de l\'erreur :', err);
    res.status(500).send(`
      <h1>❌ Erreur de connexion</h1>
      <p>L'application n'a pas pu joindre la base de données.</p>
      <pre>${err.message}</pre>
    `);
  } finally {
    if (connection) await connection.end(); // Fermeture propre de la connexion
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Application lancée sur http://localhost:${port}`);
  console.log(`Serveur cible : ${process.env.DB_SERVER}`);
});