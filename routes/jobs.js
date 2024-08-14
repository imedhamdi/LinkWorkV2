
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../db/db');
const router = express.Router();
const Offre = require('../models/Jobs');




router.get('/', async (req, res) => {
    try {
      const offresData = await Offre.getAll();
      const offres = offresData.map(data => new Offre(data));
      res.json(offres);
    } catch (error) {
      console.error('Erreur lors de la récupération des offres :', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });



module.exports = router;