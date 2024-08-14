// Assurez-vous que cette URL correspond à votre route backend
const apiUrl = 'https://linkworkv2.onrender.com/offres'; // Ou l'URL appropriée si différente

// Sélectionnez l'élément où vous souhaitez afficher les offres
const jobListingsContainer = document.querySelector('#job-listings .container'); // Ou l'élément approprié

async function fetchAndDisplayJobs() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des offres');
        }
        const offres = await response.json();

        // Effacez le contenu existant avant d'ajouter les nouvelles offres
        jobListingsContainer.innerHTML = '';

        offres.forEach(offre => {
            // Créez les éléments HTML pour chaque offre
            const jobListing = document.createElement('div');
            jobListing.classList.add('job-listing');

            const jobHeader = document.createElement('div');
            jobHeader.classList.add('job-header');

            const jobTitle = document.createElement('h2');
            jobTitle.textContent = offre.intitule;

            const jobMeta = document.createElement('div');
            jobMeta.classList.add('job-meta');

            const company = document.createElement('p');
            company.classList.add('company');
            company.innerHTML = `<i class="fas fa-building"></i> ${offre.entreprise_nom}`;

            const location = document.createElement('p');
            location.classList.add('location');
            location.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${offre.lieu_travail_libelle}`;

            const salary = document.createElement('p');
            salary.classList.add('salary');
            salary.innerHTML = `<i class="fas fa-money-bill-wave"></i> ${offre.salaire_libelle}`;

            const detailsButton = document.createElement('a');
            detailsButton.href = '#'; // Remplacez par l'URL de la page de détails de l'offre
            detailsButton.classList.add('apply-btn');
            detailsButton.textContent = 'Détails';

            // Ajoutez les éléments à la structure
            jobMeta.appendChild(company);
            jobMeta.appendChild(location);
            jobMeta.appendChild(salary);
            jobMeta.appendChild(detailsButton);

            jobHeader.appendChild(jobTitle);
            jobHeader.appendChild(jobMeta);

            const description = document.createElement('p');
            description.classList.add('description');
            description.textContent = offre.description;

            jobListing.appendChild(jobHeader);
            jobListing.appendChild(description);

            jobListingsContainer.appendChild(jobListing);
        });
    } catch (error) {
        console.error('Erreur lors de l\'affichage des offres :', error);
        // Gérez l'erreur de manière appropriée (par exemple, affichez un message d'erreur à l'utilisateur)
    }
}

// Appelez la fonction pour récupérer et afficher les offres au chargement de la page
fetchAndDisplayJobs();