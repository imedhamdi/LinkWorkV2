
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
  




// GET /jobs/filter - Filtrer les offres d'emploi
router.get('/filter', async (req, res) => {
    try {
        const { keywords, location, job_type, contract_type, salary_range, remote } = req.query;

        // Construction de la requête SQL avec des conditions dynamiques
        let query = `
            SELECT j.*, c.company_name, jt.type_name, ct.contract_type_name, sr.salary_range_label, rm.remote_option
            FROM jobs j
            JOIN companies c ON j.company_id = c.company_id
            JOIN job_types jt ON j.type_id = jt.type_id
            JOIN contract_types ct ON j.contract_type_id = ct.contract_type_id
            JOIN job_salary sr ON j.job_salary_id = sr.salary_range_id
            JOIN job_remote rm ON j.remote_id = rm.remote_id
            WHERE 1=1 
        `;
        const values = [];

        // Ajout des conditions de filtrage si les paramètres sont présents
        if (keywords) {
            query += ' AND j.title LIKE ?';
            values.push(`%${keywords}%`);
        }
        if (location) {
            query += ' AND (j.city LIKE ? OR j.country LIKE ?)';
            values.push(`%${location}%`, `%${location}%`);
        }
        if (job_type) {
            query += ' AND jt.type_name = ?';
            values.push(job_type);
        }
        if (contract_type) {
            query += ' AND ct.contract_type_name = ?';
            values.push(contract_type);
        }
        if (salary_range) {
            query += ' AND sr.salary_range_label = ?';
            values.push(salary_range);
        }
        if (remote) {
            query += ' AND rm.remote_option = ?';
            values.push(remote);
        }

        // Exécution de la requête
        const [rows] = await pool.query(query, values);

        res.json(rows);
    } catch (err) {
        console.error('Erreur lors du filtrage des offres :', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});


module.exports = router;