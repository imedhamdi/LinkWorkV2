document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reset-password-form');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const passwordError = document.getElementById('passwordError');

    form.addEventListener('submit', (event) => {
        if (passwordInput.value !== confirmPasswordInput.value) {
            event.preventDefault();
            passwordError.textContent = 'Les mots de passe ne correspondent pas'; // Afficher le message d'erreur
            passwordError.style.display = 'block';
        } else {
            passwordError.style.display = 'none'; // Masquer le message d'erreur
        }
    });

    // Masquer le message d'erreur lorsque les champs sont modifiés
    passwordInput.addEventListener('input', () => {
        passwordError.style.display = 'none';
    });
    confirmPasswordInput.addEventListener('input', () => {
        passwordError.style.display = 'none';
    });
});