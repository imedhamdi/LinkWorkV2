const keywordsInput = document.getElementById('keywords');
const suggestionsList = document.createElement('ul');
suggestionsList.classList.add('suggestions-list');
keywordsInput.parentNode.appendChild(suggestionsList);

let selectedIndex = -1;  // Index de la suggestion actuellement sélectionnée
let debounceTimeout;  // Timeout pour le debouncing

keywordsInput.addEventListener('input', () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    const keywords = keywordsInput.value;
    if (keywords.length >= 3) { // Déclencher l'autocomplétion après 3 lettres
      fetchSuggestions(keywords);
    } else {
      clearSuggestions(); // Effacez les suggestions si moins de 3 lettres
    }
  }, 300); // Délai de 300ms avant d'appeler l'API
});

async function fetchSuggestions(keywords) {
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
}

function displaySuggestions(suggestions) {
  suggestionsList.innerHTML = '';
  selectedIndex = -1;  // Réinitialiser l'index sélectionné

  suggestions.forEach((suggestion, index) => {
    const listItem = document.createElement('li');
    listItem.textContent = suggestion.intitule;   
 
    listItem.addEventListener('click', () => {
      keywordsInput.value = suggestion.intitule;
      clearSuggestions();
      // Vous pouvez également déclencher la recherche ici si vous le souhaitez
      // fetchAndDisplayJobs(); 
    });

    listItem.addEventListener('mouseover', () => {
      highlightSuggestion(index);
    });

    suggestionsList.appendChild(listItem);
  });

  suggestionsList.style.display = 'block';
}

function clearSuggestions() {
  suggestionsList.innerHTML = '';
  suggestionsList.style.display = 'none';
  selectedIndex = -1;
}

function highlightSuggestion(index) {
  // Enlever la classe 'highlighted' de toutes les suggestions
  const items = suggestionsList.querySelectorAll('li');
  items.forEach(item => item.classList.remove('highlighted'));

  // Ajouter la classe 'highlighted' à la suggestion actuelle
  if (index >= 0 && index < items.length) {
    items[index].classList.add('highlighted');
    selectedIndex = index;
  }
}

keywordsInput.addEventListener('keydown', (event) => {
  const items = suggestionsList.querySelectorAll('li');

  if (event.key === 'ArrowDown') {
    // Flèche vers le bas : passer à l'élément suivant
    selectedIndex = (selectedIndex + 1) % items.length;
    highlightSuggestion(selectedIndex);
  } else if (event.key === 'ArrowUp') {
    // Flèche vers le haut : passer à l'élément précédent
    selectedIndex = (selectedIndex - 1 + items.length) % items.length;
    highlightSuggestion(selectedIndex);
  } else if (event.key === 'Enter') {
    // Enter : sélectionner l'élément en surbrillance
    if (selectedIndex >= 0 && selectedIndex < items.length) {
      items[selectedIndex].click();
      event.preventDefault(); // Empêcher la soumission du formulaire si Enter est pressé
    }
  } else if (event.key === 'Escape') {
    // Echap : fermer les suggestions
    clearSuggestions();
  }
});
