// Sélection des éléments et création des composants nécessaires
const keywordsInput = document.getElementById('keywords');
const suggestionsList = document.createElement('ul');
suggestionsList.classList.add('suggestions-list');
keywordsInput.parentNode.appendChild(suggestionsList);

// Variables globales pour gérer l'état
let selectedIndex = -1;
let debounceTimeout;

// Gestion de l'événement d'entrée de texte avec debouncing
keywordsInput.addEventListener('input', () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(handleInput, 300);
});

function handleInput() {
  const keywords = keywordsInput.value.trim();
  if (keywords.length >= 3) {
    fetchSuggestions(keywords);
  } else {
    clearSuggestions();
  }
}

// Récupération des suggestions via l'API
async function fetchSuggestions(keywords) {
  try {
    const response = await fetch(`${apiUrl}/suggestions?keywords=${encodeURIComponent(keywords)}`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des suggestions');
    }

    const suggestions = await response.json();
    displaySuggestions(suggestions);
  } catch (error) {
    console.error('Erreur lors de l\'autocomplétion :', error);
    clearSuggestions();
    // Affichage d'un message d'erreur ou autre gestion
  }
}

// Affichage des suggestions
function displaySuggestions(suggestions) {
  clearSuggestions();
  selectedIndex = -1;

  suggestions.forEach((suggestion, index) => {
    const listItem = document.createElement('li');
    listItem.textContent = suggestion.intitule;

    listItem.addEventListener('click', () => {
      selectSuggestion(suggestion.intitule);
    });

    listItem.addEventListener('mouseover', () => {
      highlightSuggestion(index);
    });

    suggestionsList.appendChild(listItem);
  });

  suggestionsList.style.display = 'block';
}

// Sélection d'une suggestion
function selectSuggestion(suggestion) {
  keywordsInput.value = suggestion;
  clearSuggestions();
  // Optionnel: déclencher la recherche ou autre action
}

// Effacement des suggestions
function clearSuggestions() {
  suggestionsList.innerHTML = '';
  suggestionsList.style.display = 'none';
  selectedIndex = -1;
}

// Gestion du surlignage des suggestions
function highlightSuggestion(index) {
  const items = suggestionsList.querySelectorAll('li');
  items.forEach(item => item.classList.remove('highlighted'));

  if (index >= 0 && index < items.length) {
    items[index].classList.add('highlighted');
    selectedIndex = index;
  }
}

// Gestion des interactions au clavier
keywordsInput.addEventListener('keydown', (event) => {
  const items = suggestionsList.querySelectorAll('li');

  switch (event.key) {
    case 'ArrowDown':
      if (items.length > 0) {
        selectedIndex = (selectedIndex + 1) % items.length;
        highlightSuggestion(selectedIndex);
      }
      break;
    case 'ArrowUp':
      if (items.length > 0) {
        selectedIndex = (selectedIndex - 1 + items.length) % items.length;
        highlightSuggestion(selectedIndex);
      }
      break;
    case 'Enter':
      if (selectedIndex >= 0 && selectedIndex < items.length) {
        items[selectedIndex].click();
        event.preventDefault();
      }
      break;
    case 'Escape':
      clearSuggestions();
      break;
  }
});
