const bcrypt = require('bcrypt');
const pool = require('../db/db');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');



class User {
  constructor(user) {
    this.user_id = user.user_id;
    this.first_name = user.first_name;
    this.last_name = user.last_name;
    this.email = user.email;
    this.password = user.password;
    this.phone = user.phone;
    this.resume_path = user.resume_path;
    this.created_at = user.created_at;
    this.updated_at = user.updated_at;
    // Nouvelles propriétés
    this.situation_actuelle = user.situation_actuelle;
    this.disponibilite = user.disponibilite;
    this.experience = user.experience;
    this.qualification = user.qualification;
  }

  // Créer un nouvel utilisateur
  static async create(newUser) {
    const sql = `
        INSERT INTO users (first_name, last_name, email, password, phone, situation_actuelle, disponibilite, experience, qualification, resume_path)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      newUser.first_name,
      newUser.last_name,
      newUser.email,
      newUser.password, // Assurez-vous que le mot de passe est déjà haché dans la route
      newUser.phone,
      newUser.situation_actuelle,
      newUser.disponibilite,
      newUser.experience,
      newUser.qualification,
      newUser.resume_path // Ajoutez resume_path ici
    ];
    const [result] = await pool.query(sql, values);
    const createdUser = {
      user_id: result.insertId,
      ...newUser,
    };
    return new User(createdUser);
  }

  // Récupérer un utilisateur par son email
  static async findByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await pool.query(sql, [email]);
    return rows.length ? new User(rows[0]) : null;
  }


  // Récupérer un utilisateur par son ID
  static async findById(userId) {
    const sql = 'SELECT * FROM users WHERE user_id = ?';
    const [rows] = await pool.query(sql, [userId]);
    return rows.length ? new User(rows[0]) : null;
  }

  // Générer un token de réinitialisation de mot de passe
  static async generateResetToken(email) {
    const resetToken = jwt.sign({ email }, 'VOTRE_CLE_SECRETE', { expiresIn: '1h' }); // Inclure l'email dans le token
    const sql = 'UPDATE users SET reset_token = ?, reset_token_expires = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE email = ?';
    await pool.query(sql, [resetToken, email]);
    return resetToken;
  }

  // Récupérer un utilisateur par son token de réinitialisation
  static async findByResetToken(resetToken) {
    try {
      const decoded = jwt.verify(resetToken, 'VOTRE_CLE_SECRETE');
      const email = decoded.email; // Récupérer l'email du token
      const sql = 'SELECT * FROM users WHERE email = ? AND reset_token = ? AND reset_token_expires > NOW()';
      const [rows] = await pool.query(sql, [email, resetToken]);
      return rows.length ? new User(rows[0]) : null;
    } catch (err) {
      // Le token est invalide ou expiré
      return null;
    }
  }


 // Méthode pour réinitialiser le mot de passe
 static async resetPassword(resetToken, newPassword) {
  try {
    // Vérifier que l'utilisateur avec le token de réinitialisation existe et est valide
    const user = await User.findByResetToken(resetToken);

    if (!user) {
      throw new Error('Token de réinitialisation invalide ou expiré');
    }

    const email = user.email; // Extraire l'email de l'utilisateur trouvé
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const sql = `
          UPDATE users 
          SET password = ?, reset_token = NULL, reset_token_expires = NULL
          WHERE email = ? 
        `;

    console.log(`SQL: ${sql}`); // Pour le débogage
    console.log(`Params: [${hashedPassword}, ${email}]`); // Pour le débogage

    const [result] = await pool.query(sql, [hashedPassword, email]);

    console.log(`Result: ${JSON.stringify(result)}`); // Pour le débogage

    return result.affectedRows > 0; // Retourne true si le mot de passe a été mis à jour
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error);
    throw error; // Relancer l'erreur après l'avoir loggée
  }
}
  // Mettre à jour un utilisateur
  static async update(userId, updatedUser) {
    const sql = `
      UPDATE users 
      SET first_name = ?, last_name = ?, email = ?, password = ?, phone = ?
      WHERE user_id = ?
    `;
    const values = [updatedUser.first_name, updatedUser.last_name, updatedUser.email, updatedUser.password, updatedUser.phone, userId];
    await pool.query(sql, values);
  }

  // Supprimer un utilisateur
  static async delete(userId) {
    const sql = 'DELETE FROM users WHERE user_id = ?';
    await pool.query(sql, [userId]);
  }

  // Récupérer tous les utilisateurs
  static async findAll() {
    const sql = 'SELECT * FROM users';
    const [rows] = await pool.query(sql);
    return rows.map(row => new User(row));
  }
}

module.exports = User;



 