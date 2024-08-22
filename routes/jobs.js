
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../db/db');
const router = express.Router();
const Offre = require('../models/Jobs');



  router.get('/', async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1; // Page par défaut : 1
      const limit = parseInt(req.query.limit) || 10; // Limite par défaut : 10
  
      const { offres: offresData, totalOffres } = await Offre.getPaginated(page, limit);
      const offres = offresData.map(data => new Offre(data));
  
      res.json({
        offres,
        totalOffres
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des offres :', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });




  // Route pour récupérer une offre par ID
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const offre = await Offre.getById(id);

    if (!offre) {
      return res.status(404).json({ message: 'Offre non trouvée' });
    }

    res.json(offre);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'offre par ID :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});


module.exports = router;