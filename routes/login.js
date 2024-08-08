document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#login-form');
    const responseMessage = document.querySelector('#response-message');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.querySelector('#email').value;
        const password = document.querySelector('#password').value;

        try {
            const response = await fetch('https://linkworkv2.onrender.com/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            // Gestion centralisée de la réponse (succès ou erreur)
            const data = await response.json();

            if (response.ok) {
                // Stockage des données utilisateur
                localStorage.setItem('token', data.token || '');
                localStorage.setItem('firstName', data.firstName || '');
                localStorage.setItem('lastName', data.lastName || '');
                localStorage.setItem('phone', data.phone || '');
                localStorage.setItem('email', data.email || '');
                localStorage.setItem('userId', data.userId || '');

                responseMessage.textContent = 'Connexion réussie ! Vous êtes maintenant connecté.';
                responseMessage.style.color = 'green';

                setTimeout(() => {
                    window.location.href = 'dashboard.html'; 
                }, 2000);
            } else {
                // Gestion des erreurs du backend
                const errorMessage = data.error || 'Erreur lors de la connexion.';
                responseMessage.textContent = errorMessage;
                responseMessage.style.color = 'red';
            }
        } catch (error) {
            // Gestion des erreurs réseau
            console.error('Erreur réseau lors de la connexion:', error);
            responseMessage.textContent = 'Une erreur réseau s\'est produite. Veuillez réessayer.';
            responseMessage.style.color = 'red';
        }
    });
});