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



  // Méthode pour récupérer toutes les offres
  static async getAll() {
    try {
      const [rows] = await pool.query('SELECT * FROM offres');
      return rows;
    } catch (error) {
      console.error('Erreur lors de la récupération des offres :', error);
      throw error;
    }
  }
}
module.exports = Offre;