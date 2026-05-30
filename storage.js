const STORAGE_KEYS = {
  favourites: 'bookfinder-favourites',
  'read-later': 'bookfinder-read-later',
};

function loadList(listName) {
  const raw = localStorage.getItem(STORAGE_KEYS[listName]);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveList(listName, books) {
  localStorage.setItem(STORAGE_KEYS[listName], JSON.stringify(books));
}

export function getList(listName) {
  return loadList(listName);
}

export function saveToList(listName, book) {
  const existing = loadList(listName);
  if (existing.some((item) => item.key === book.key)) {
    return existing;
  }

  const next = [{ ...book, savedAt: Date.now() }, ...existing];
  saveList(listName, next);
  return next;
}

export function removeFromList(listName, key) {
  const existing = loadList(listName);
  const next = existing.filter((item) => item.key !== key);
  saveList(listName, next);
  return next;
}

export function isInList(listName, key) {
  const existing = loadList(listName);
  return existing.some((item) => item.key === key);
}
