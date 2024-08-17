document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registrationForm');
    const errorMessageDiv = document.getElementById('error-message');
    const responseMessageDiv = document.getElementById('response-message');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        errorMessageDiv.textContent = '';
        responseMessageDiv.textContent = '';

        // Récupération des valeurs des champs du formulaire
        const firstName = document.getElementById('first_name').value;
        const lastName = document.getElementById('last_name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const phone = document.getElementById('phone').value;
        const situationActuelle = document.getElementById('situation_actuelle').value;
        const disponibilite = document.getElementById('disponibilite').value;
        const experience = document.getElementById('experience').value;
        const qualification = document.getElementById('qualification').value;
        const resume = document.getElementById('resume').files[0];

        // Validation côté client (vous pouvez ajouter plus de validations ici si nécessaire)
        if (password !== confirmPassword) {
            errorMessageDiv.textContent = 'Les mots de passe ne correspondent pas.';
            return;
        }

        const formData = new FormData();
        formData.append('first_name', firstName);
        formData.append('last_name', lastName);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('phone', phone);
        formData.append('situation_actuelle', situationActuelle);
        formData.append('disponibilite', disponibilite);
        formData.append('experience', experience);
        formData.append('qualification', qualification);
        if (resume) {
            formData.append('resume', resume);
        }

        try {
            // Indication de chargement
            responseMessageDiv.textContent = 'Inscription en cours...';

            const response = await fetch('https://linkworkv2.onrender.com/users/register', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                responseMessageDiv.textContent = 'Inscription réussie !';
                responseMessageDiv.style.color = 'green'; // Mettre le texte en vert
                form.reset();

                setTimeout(() => {
                    window.location.href = 'seConnecter.html';
                }, 1000);
            } else {
                if (data.errors && Array.isArray(data.errors)) {
                    errorMessageDiv.textContent = data.errors.map(err => err.msg).join('\n');
                } else {
                    errorMessageDiv.textContent = 'Erreur lors de l\'inscription : ' + (data.error || 'Une erreur inconnue est survenue.');
                }
                errorMessageDiv.style.color = 'red'; // Mettre le texte en rouge
            }
        } catch (error) {
            console.error('Erreur réseau:', error);
            errorMessageDiv.textContent = 'Une erreur s\'est produite lors de la communication avec le serveur.';
        } finally {
            if (responseMessageDiv.textContent === 'Inscription en cours...') {
                responseMessageDiv.textContent = '';
            }
        }
    });
});