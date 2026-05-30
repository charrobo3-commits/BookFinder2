import { searchBooks, fetchWorkDetails } from './api.js';
import { getList, saveToList, removeFromList, isInList } from './storage.js';
import createBookCard from './components/bookCard.js';
import createBookDetail from './components/bookDetail.js';
import createEmptyState from './components/emptyState.js';
import createListItem from './components/listItem.js';

const state = {
  activeTab: 'search',
  query: '',
  sort: 'relevance',
  searchResults: [],
  currentDetail: null,
  favourites: [],
  readLater: [],
};

const elements = {
  tabButtons: document.querySelectorAll('.tab-button'),
  tabPanels: document.querySelectorAll('.tab-panel'),
  searchInput: document.querySelector('#search-input'),
  sortSelect: document.querySelector('#sort-select'),
  searchStatus: document.querySelector('#search-status'),
  resultsContainer: document.querySelector('#results'),
  detailSection: document.querySelector('#detail'),
  detailView: document.querySelector('#detail-view'),
  detailBack: document.querySelector('#detail-back'),
  favouritesFilter: document.querySelector('#favourites-filter'),
  readLaterFilter: document.querySelector('#read-later-filter'),
  favouritesList: document.querySelector('#favourites-list'),
  readLaterList: document.querySelector('#read-later-list'),
};

function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => fn(...args), delay);
  };
}

function setActiveTab(tabId) {
  state.activeTab = tabId;
  elements.tabButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.tab === tabId);
  });
  elements.tabPanels.forEach((panel) => {
    panel.classList.toggle('active', panel.id === tabId);
  });

  if (tabId === 'search') {
    renderSearchResults();
  }

  if (tabId === 'favourites') {
    renderSavedList('favourites');
  }

  if (tabId === 'read-later') {
    renderSavedList('read-later');
  }
}

function updateSearchStatus(message) {
  elements.searchStatus.textContent = message;
}

function clearContainer(container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}

function displayEmptyState(container, message) {
  clearContainer(container);
  container.appendChild(createEmptyState(message));
}

function renderSearchResults() {
  const results = state.searchResults;
  clearContainer(elements.resultsContainer);

  if (!state.query.trim()) {
    updateSearchStatus('Start typing a title to search the Open Library.');
    displayEmptyState(elements.resultsContainer, 'Search results will appear here once you enter a title.');
    return;
  }

  if (results.length === 0) {
    updateSearchStatus('No books found for that query.');
    displayEmptyState(elements.resultsContainer, 'Try another title or a broader search term.');
    return;
  }

  updateSearchStatus(`${results.length} result${results.length === 1 ? '' : 's'} found.`);

  results.forEach((book, index) => {
    const card = createBookCard(book);
    card.style.animationDelay = `${index * 40}ms`;
    elements.resultsContainer.appendChild(card);
  });
}

async function performSearch() {
  const query = state.query.trim();
  if (!query) {
    state.searchResults = [];
    renderSearchResults();
    return;
  }

  updateSearchStatus('Searching…');

  try {
    const data = await searchBooks(query, state.sort);
    state.searchResults = Array.isArray(data.docs) ? data.docs : [];
    renderSearchResults();
  } catch (error) {
    updateSearchStatus('Unable to load search results. Please try again.');
    displayEmptyState(elements.resultsContainer, 'There was an error fetching data from Open Library.');
    console.error(error);
  }
}

const debouncedSearch = debounce(performSearch, 480);

function findBookByKey(key) {
  const foundInSearch = state.searchResults.find((book) => book.key === key);
  if (foundInSearch) {
    return foundInSearch;
  }

  return state.favourites.find((book) => book.key === key) || state.readLater.find((book) => book.key === key) || null;
}

async function openDetail(key) {
  const book = findBookByKey(key);
  if (!book) {
    return;
  }

  try {
    updateSearchStatus('Loading book details…');
    const workData = await fetchWorkDetails(book.key);
    state.currentDetail = { book, workData };
    elements.detailView.innerHTML = '';
    elements.detailView.appendChild(createBookDetail({ book, workData }));
    setActiveTab('detail');
  } catch (error) {
    updateSearchStatus('Unable to load book details.');
    console.error(error);
  }
}

function refreshSavedLists() {
  state.favourites = getList('favourites');
  state.readLater = getList('read-later');
}

function renderSavedList(listName) {
  const filterTerm = listName === 'favourites' ? elements.favouritesFilter.value.trim().toLowerCase() : elements.readLaterFilter.value.trim().toLowerCase();
  const container = listName === 'favourites' ? elements.favouritesList : elements.readLaterList;
  const items = listName === 'favourites' ? state.favourites : state.readLater;

  clearContainer(container);

  const filtered = items.filter((book) => {
    if (!filterTerm) {
      return true;
    }

    const title = book.title || '';
    const author = Array.isArray(book.author_name) ? book.author_name.join(' ') : '';
    return title.toLowerCase().includes(filterTerm) || author.toLowerCase().includes(filterTerm);
  });

  if (filtered.length === 0) {
    const message = listName === 'favourites' ? 'No favourites yet. Save a book from search.' : 'No books in Read Later yet. Save one from search.';
    displayEmptyState(container, message);
    return;
  }

  filtered.forEach((book) => {
    container.appendChild(createListItem(book, { listName }));
  });
}

function handleDelegatedResultClick(event) {
  const button = event.target.closest('button');
  const card = event.target.closest('[data-key]');
  if (!card) {
    return;
  }

  const key = card.dataset.key;

  if (button) {
    if (button.dataset.action === 'save-favourites') {
      saveToList('favourites', findBookByKey(key));
      refreshSavedLists();
      if (state.activeTab === 'favourites') {
        renderSavedList('favourites');
      }
      return;
    }

    if (button.dataset.action === 'save-read-later') {
      saveToList('read-later', findBookByKey(key));
      refreshSavedLists();
      if (state.activeTab === 'read-later') {
        renderSavedList('read-later');
      }
      return;
    }

    if (button.dataset.action === 'show-detail') {
      openDetail(key);
      return;
    }
  }

  openDetail(key);
}

function handleSavedListClick(event, listName) {
  const button = event.target.closest('button');
  const item = event.target.closest('[data-key]');
  if (!button || !item) {
    return;
  }

  if (button.dataset.action === 'remove') {
    removeFromList(listName, item.dataset.key);
    refreshSavedLists();
    renderSavedList(listName);
  }
}

function attachListeners() {
  document.querySelector('.tab-bar').addEventListener('click', (event) => {
    const button = event.target.closest('.tab-button');
    if (!button) {
      return;
    }
    setActiveTab(button.dataset.tab);
  });

  elements.searchInput.addEventListener('input', (event) => {
    state.query = event.target.value;
    debouncedSearch();
  });

  elements.sortSelect.addEventListener('change', (event) => {
    state.sort = event.target.value;
    if (state.query.trim()) {
      performSearch();
    }
  });

  elements.resultsContainer.addEventListener('click', handleDelegatedResultClick);

  elements.detailBack.addEventListener('click', () => setActiveTab('search'));

  elements.favouritesFilter.addEventListener('input', () => renderSavedList('favourites'));
  elements.readLaterFilter.addEventListener('input', () => renderSavedList('read-later'));

  elements.favouritesList.addEventListener('click', (event) => handleSavedListClick(event, 'favourites'));
  elements.readLaterList.addEventListener('click', (event) => handleSavedListClick(event, 'read-later'));
}

function initialize() {
  refreshSavedLists();
  attachListeners();
  renderSearchResults();
}

initialize();
