export default function createListItem(book, { listName }) {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-item';
  wrapper.dataset.key = book.key;

  const topRow = document.createElement('div');
  topRow.className = 'list-row';

  const titleBlock = document.createElement('div');
  const title = document.createElement('h3');
  title.textContent = book.title;
  const author = document.createElement('p');
  author.textContent = Array.isArray(book.author_name) ? book.author_name.join(', ') : 'Unknown author';
  titleBlock.appendChild(title);
  titleBlock.appendChild(author);

  const controls = document.createElement('div');
  controls.className = 'action-group';
  const removeButton = document.createElement('button');
  removeButton.type = 'button';
  removeButton.className = 'remove-button';
  removeButton.dataset.action = 'remove';
  removeButton.textContent = 'Remove';
  controls.appendChild(removeButton);

  topRow.appendChild(titleBlock);
  topRow.appendChild(controls);

  const metadata = document.createElement('div');
  metadata.className = 'card-meta';

  if (book.first_publish_year) {
    const year = document.createElement('span');
    year.className = 'meta-pill';
    year.textContent = String(book.first_publish_year);
    metadata.appendChild(year);
  }

  if (listName === 'favourites') {
    const badge = document.createElement('span');
    badge.className = 'meta-pill';
    badge.textContent = '♥ Favourite';
    metadata.appendChild(badge);
  }

  if (listName === 'read-later') {
    const badge = document.createElement('span');
    badge.className = 'meta-pill';
    badge.textContent = '🔖 Read Later';
    metadata.appendChild(badge);
  }

  wrapper.appendChild(topRow);
  wrapper.appendChild(metadata);

  return wrapper;
}
