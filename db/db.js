const mysql = require('mysql2');
require('dotenv').config();
const pool = mysql.createPool({
  port:'3306',
  host:'btdm9da8pq53mylxej9z-mysql.services.clever-cloud.com',
  user: 'udvymqcdn0405qcm',
  password:'EFjUmuagCi8J7kMcBZAg',
  database:'btdm9da8pq53mylxej9z',
  waitForConnections: true,
  connectTimeout: 10000 ,
  queueLimit: 0
});

async function checkConnection() {
  try {
    await pool.query('SELECT 1'); // Exécute une requête simple pour tester la connexion
    console.log('Connexion à la base de données réussie !');
    return true; // La connexion est OK
  } catch (error) {
    console.error('Erreur de connexion à la base de données :', error);
    return false; // La connexion a échoué
  }
}

// Exportez la fonction de vérification avec le pool
module.exports = {
  pool: pool.promise(),
  checkConnection
};
module.exports = pool.promise();