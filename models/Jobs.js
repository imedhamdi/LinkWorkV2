const pool = require('../db/db');
const fs = require('fs/promises');
class Offre {
  constructor(data) {
    this.id_offre = data.id_offre;
    this.intitule = data.intitule;
    this.description = data.description;
    this.date_creation = data.date_creation;
    this.date_actualisation = data.date_actualisation;
    this.lieu_travail_libelle = data.lieu_travail_libelle;
    this.entreprise_nom = data.entreprise_nom;
    this.type_contrat = data.type_contrat;
    this.experience_libelle = data.experience_libelle;
    this.formation_niveauLibelle = data.formation_niveauLibelle;
    this.competences_libelle = data.competences_libelle;
    this.salaire_libelle = data.salaire_libelle;
    this.duree_travail_Libelle = data.duree_travail_Libelle;
    this.dureeTravailLibelleConverti = data.dureeTravailLibelleConverti;
    this.alternance = data.alternance;
    this.nombre_postes = data.nombre_postes;
    this.secteur_activite_Libelle = data.secteur_activite_Libelle;
  }

  static async getPaginated(page, limit) {
    try {
      const offset = (page - 1) * limit; 
  
      const query = `
        SELECT * FROM offres
        LIMIT ? OFFSET ?
      `;
      const [rows] = await pool.query(query, [limit, offset]);
  
      // Récupérez également le nombre total d'offres pour le calcul du nombre de pages
      const [totalRows] = await pool.query('SELECT COUNT(*) as total FROM offres');
      const totalOffres = totalRows[0].total;
  
      return {
        offres: rows,
        totalOffres
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des offres paginées :', error);
      throw error;
    }
  }
  


 // Méthode pour obtenir une offre par ID
 static async getById(id) {
  try {
    const query = 'SELECT * FROM offres WHERE id_offre = ?';
    const [rows] = await pool.query(query, [id]);

    if (rows.length === 0) {
      return null; // Aucun résultat trouvé
    }

    return new Offre(rows[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'offre par ID :', error);
    throw error;
  }
}
}
 

module.exports = Offre;