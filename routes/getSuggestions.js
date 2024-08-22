const keywordsInput = document.getElementById('keywords');
const suggestionsList = document.createElement('ul');
suggestionsList.classList.add('suggestions-list');
keywordsInput.parentNode.appendChild(suggestionsList);
const apiUrl = 'https://linkworkv2.onrender.com/offres'; 

keywordsInput.addEventListener('input', async () => {
  const keywords = keywordsInput.value;
  if (keywords.length >= 3) { // Déclencher l'autocomplétion après 3 lettres
    try {
      const response = await fetch(`${apiUrl}/suggestions?keywords=${keywords}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des suggestions');
      }

      const suggestions = await response.json();
      displaySuggestions(suggestions);
    } catch (error) {
      console.error('Erreur lors de l\'autocomplétion :', error);
      // Gérez l'erreur de manière appropriée (par exemple, affichez un message d'erreur)
    }
  } else {
    clearSuggestions(); // Effacez les suggestions si moins de 3 lettres
  }
});

function displaySuggestions(suggestions) {
  suggestionsList.innerHTML = '';

  suggestions.forEach(suggestion => {
    const listItem = document.createElement('li');
    listItem.textContent = suggestion.intitule;   
 
    listItem.addEventListener('click', () => {
      keywordsInput.value = suggestion.intitule;
      clearSuggestions();
      // Vous pouvez également déclencher la recherche ici si vous le souhaitez
      // fetchAndDisplayJobs(); 
    });
    suggestionsList.appendChild(listItem);
  });

  suggestionsList.style.display = 'block';
}

function clearSuggestions() {
  suggestionsList.innerHTML = '';
  suggestionsList.style.display = 'none';
}