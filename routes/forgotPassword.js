document.getElementById('forgot-password-link').addEventListener('click', function (e) {
    e.preventDefault();
    document.getElementById('forgot-password-form').style.display = 'block';
});

document.getElementById('forgot-password-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('forgot-email').value;
    const responseMessage = document.getElementById('response-message');

    try {
        const response = await fetch('/users/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (response.ok) {
            // Email found and reset link sent
            responseMessage.textContent = data.message;
            responseMessage.style.color = 'green';
        } else {
            // Email not found or other error
            if (data.error === 'Email not found') {
                responseMessage.textContent = 'L\'email que vous avez fourni n\'est pas associé à un compte.';
            } else {
                responseMessage.textContent = data.error || 'Erreur lors de l\'envoi de la demande de réinitialisation.';
            }
            responseMessage.style.color = 'red';
        }

        // Effacer le message après 3 secondes
        setTimeout(() => {
            responseMessage.textContent = '';
        }, 3000);
        
    } catch (error) {
        responseMessage.textContent = 'Erreur lors de l\'envoi de la demande de réinitialisation.';
        responseMessage.style.color = 'red';

        // Effacer le message après 3 secondes
        setTimeout(() => {
            responseMessage.textContent = '';
        }, 3000);
    }
});