const filterForm = document.getElementById('filter-form');
const locationInput = document.getElementById('location');
const locationSuggestions = document.getElementById('location-suggestions'); // Créez cet élément dans votre HTML

// Gestion de la soumission du formulaire de filtrage
filterForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(filterForm);
    const filters = Object.fromEntries(formData);

    try {
        const response = await fetch('/offres/filter', { // Assurez-vous que l'URL est correcte
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(filters)
        });

        if (!response.ok) {
            throw new Error('Erreur lors du filtrage des offres');
        }

        const offres = await response.json();
        // ... (logique pour afficher les offres filtrées)
    } catch (error) {
        console.error('Erreur lors du filtrage des offres :', error);
        // ... (gestion des erreurs)
    }
});

// Gestion des suggestions de localisation
locationInput.addEventListener('input', async () => {
    const searchTerm = locationInput.value;

    try {
        const response = await fetch(`/locations?q=${searchTerm}`);
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des suggestions de localisation');
        }

        const locations = await response.json();

        // Effacez les suggestions précédentes
        locationSuggestions.innerHTML = '';

        // Ajoutez les nouvelles suggestions
        locations.forEach(location => {
            const suggestionItem = document.createElement('div');
            suggestionItem.textContent = location;
            suggestionItem.addEventListener('click', () => {
                locationInput.value = location;
                locationSuggestions.innerHTML = ''; // Effacez les suggestions après la sélection
            });
            locationSuggestions.appendChild(suggestionItem);
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des suggestions de localisation :', error);
        // ... (gestion des erreurs)
    }
});