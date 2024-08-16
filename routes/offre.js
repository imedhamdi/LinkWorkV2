document.addEventListener("DOMContentLoaded", function () {
    const apiUrl = 'https://linkworkv2.onrender.com/offres';
    const params = new URLSearchParams(window.location.search);
    const offreId = params.get('id');
    const offerContainer = document.getElementById('offer-container');

    if (offreId) {
        fetch(`${apiUrl}/${offreId}`)
            .then(response => response.json())
            .then(offre => {
                const jobListing = document.createElement('div');
                jobListing.classList.add('job-listing-all');

                const jobDetails = document.createElement('div');
                jobDetails.classList.add('job-details');

                const jobTitle = document.createElement('h3');
                jobTitle.textContent = offre.intitule;

                const jobMeta = document.createElement('p');
                jobMeta.innerHTML = `
                    <strong>Type de contrat:</strong> ${offre.type_contrat}<br>
                    <strong>Entreprise:</strong> ${offre.entreprise_nom}<br>
                    <strong>Lieu:</strong> ${offre.lieu_travail_libelle}<br>
                    <strong>Salaire:</strong> ${offre.salaire_libelle}<br>
                    <strong>Date de publication:</strong> ${offre.date_creation}<br>
                `;

                const jobDescription = document.createElement('div');
                jobDescription.classList.add('job-description');

                const descriptionTitle = document.createElement('h4');
                descriptionTitle.textContent = 'Description';

                const descriptionContent = document.createElement('p');
                descriptionContent.textContent = offre.description;

                jobDetails.appendChild(jobTitle);
                jobDetails.appendChild(jobMeta);

                jobDescription.appendChild(descriptionTitle);
                jobDescription.appendChild(descriptionContent);

                // Ajouter le bouton "Postuler"
                const applyButton = document.createElement('a');
                applyButton.href = `apply.html?id=${offreId}`; // Redirige vers une page de candidature
                applyButton.classList.add('apply-btn');
                applyButton.textContent = 'Postuler';
                jobListing.appendChild(applyButton);

                jobListing.appendChild(jobDetails);
                jobListing.appendChild(jobDescription);

                offerContainer.appendChild(jobListing);
            })
            .catch(error => {
                console.error('Erreur lors du chargement de l\'offre:', error);
                offerContainer.innerHTML = '<p>Une erreur est survenue lors du chargement de l\'offre.</p>';
            });
    } else {
        offerContainer.innerHTML = '<p>Aucune offre sélectionnée.</p>';
    }
});