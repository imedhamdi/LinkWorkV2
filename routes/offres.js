const apiUrl = 'https://linkworkv2.onrender.com/offres'; 

const jobListingsContainer = document.querySelector('#job-listings .container'); 
const paginationContainer = document.querySelector('#pagination'); 

let currentPage = 1;
let totalPages = 0;

async function fetchAndDisplayJobs(page = 1) {
  try {
    const response = await fetch(`${apiUrl}?page=${page}&limit=10`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des offres');
    }

    const { offres, totalOffres } = await response.json();
    totalPages = Math.ceil(totalOffres / 10); 

    jobListingsContainer.innerHTML = '';

    if (offres.length === 0) {
      jobListingsContainer.innerHTML = '<p>Aucune offre trouvée pour cette page.</p>';
    } else {
      offres.forEach(offre => {
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
        detailsButton.href = `offre.html?id=${offre.id}`; // ID de l'offre ajouté à l'URL
        detailsButton.classList.add('apply-btn');
        detailsButton.textContent = 'Détails';
        
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
    }

    displayPagination(); 
  } catch (error) {
    console.error('Erreur lors de l\'affichage des offres :', error);
    jobListingsContainer.innerHTML = '<p>Une erreur s\'est produite lors du chargement des offres. Veuillez réessayer plus tard.</p>';
  }
}

function displayPagination() {
  // Effacez la pagination existante
  paginationContainer.innerHTML = '';

  // Bouton Précédent
  const prevButton = document.createElement('button');
  prevButton.innerHTML = '&laquo;'; // Utilisation de la flèche gauche
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      fetchAndDisplayJobs(currentPage);
    }
  });

  paginationContainer.appendChild(prevButton);

  // Numéro de page actuel
  const currentPageDisplay = document.createElement('span');
  currentPageDisplay.textContent = `Page ${currentPage} / ${totalPages}`;
  currentPageDisplay.style.margin = '0 15px'; // Ajoutez un peu d'espace autour du texte

  paginationContainer.appendChild(currentPageDisplay);

  // Bouton Suivant
  const nextButton = document.createElement('button');
  nextButton.innerHTML = '&raquo;'; // Utilisation de la flèche droite
  nextButton.disabled = currentPage === totalPages;
  nextButton.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      fetchAndDisplayJobs(currentPage);
    }
  });

  paginationContainer.appendChild(nextButton);
}

document.addEventListener('DOMContentLoaded', fetchAndDisplayJobs);
