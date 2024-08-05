const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    // Utilisez un service de messagerie pris en charge par Nodemailer (Gmail, Outlook, etc.)
    // ou configurez directement le serveur SMTP si vous avez votre propre serveur de messagerie.
    host: 'smtp.office365.com',  // Remplacez par l'adresse du serveur SMTP
    port: 587,                 // Port SMTP standard (ou 465 pour SSL/TLS)
    secure: false,             // Utiliser SSL/TLS si nécessaire
    auth: {
        user: 'imedhamdi007@hotmail.fr',  // Remplacez par votre adresse email
        pass: 'Djerba68@@@',             // Remplacez par votre mot de passe
    },
});

module.exports = transporter;