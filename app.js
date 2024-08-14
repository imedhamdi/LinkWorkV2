const express = require('express');
const helmet = require("helmet");
const hpp = require('hpp');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
const cors = require('cors');;
const usersRouter = require('./routes/users');
const jobRoutes = require('./routes/jobs')
const app = express();
const bodyParser = require('body-parser');


// Body Parser (inclus dans Express depuis la v4.16)
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Pour gérer les formulaires classiques

// Middleware de sécurité
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:
        ["'self'"], // Autoriser uniquement les ressources de votre propre domaine par défaut
      connectSrc: ["'self'", 'https://linkworkv2.onrender.com/'], // Autoriser les connexions à votre propre domaine et à l'API locale
      // ... autres directives selon vos besoins
    }
  }
}));
app.use(hpp());
app.use(xss());



// Configuration de CORS (plus flexible et sécurisée que les headers manuels)
app.use(cors({
  origin: 'https://linkworkv2.onrender.com', // Remplacez par votre domaine spécifique en production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Allow   


}));


// Journalisation (uniquement en développement)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limiteur de débit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,  // Retourne les headers RateLimit-*
  ignoreXForwardedFor: true // Désactiver la vérification de X-Forwarded-For

});
app.use(limiter);

// Politique de sécurité de contenu (CSP)

app.use(express.static(path.join(__dirname, 'public')));
app.use(
  helmet({
    contentSecurityPolicy: false,

  })
);

// Configuration du moteur de template EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Définissez le chemin vers votre dossier 'views'



// Routes
app.use('/users', usersRouter);
app.use('/offres', jobRoutes);



// Gestion des fichiers statiques 
app.use('/routes', express.static(path.join(__dirname, 'routes')));

// Page d'accueil par défaut (si nécessaire)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

module.exports = app;