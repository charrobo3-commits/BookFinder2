function createCoverPlaceholder(title) {
  const placeholder = document.createElement('div');
  placeholder.className = 'cover-placeholder';
  placeholder.textContent = title.charAt(0).toUpperCase();
  return placeholder;
}

function attachFallbackImage(img, title) {
  img.onerror = () => {
    const placeholder = createCoverPlaceholder(title);
    img.replaceWith(placeholder);
  };
}

export default function createBookCard(book) {
  const article = document.createElement('div');
  article.className = 'book-card';
  article.dataset.key = book.key;

  const coverWrap = document.createElement('div');
  coverWrap.className = 'cover-wrap';
  if (book.cover_i) {
    const img = document.createElement('img');
    img.src = `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;
    img.alt = `${book.title} cover`;
    attachFallbackImage(img, book.title);
    coverWrap.appendChild(img);
  } else {
    coverWrap.appendChild(createCoverPlaceholder(book.title));
  }

  const titleElement = document.createElement('h3');
  titleElement.textContent = book.title;

  const authorElement = document.createElement('p');
  authorElement.textContent = Array.isArray(book.author_name) ? book.author_name.join(', ') : 'Unknown author';

  const metaRow = document.createElement('div');
  metaRow.className = 'card-meta';

  if (book.first_publish_year) {
    const year = document.createElement('span');
    year.className = 'meta-pill';
    year.textContent = `${book.first_publish_year}`;
    metaRow.appendChild(year);
  }

  if (typeof book.edition_count === 'number') {
    const edition = document.createElement('span');
    edition.className = 'meta-pill';
    edition.textContent = `${book.edition_count} edition${book.edition_count === 1 ? '' : 's'}`;
    metaRow.appendChild(edition);
  }

  if (book.has_fulltext) {
    const free = document.createElement('span');
    free.className = 'meta-pill';
    free.textContent = 'Free to read';
    metaRow.appendChild(free);
  }

  const actionRow = document.createElement('div');
  actionRow.className = 'actions-row';

  const buttonGroup = document.createElement('div');
  buttonGroup.className = 'action-group';

  const favouriteButton = document.createElement('button');
  favouriteButton.type = 'button';
  favouriteButton.className = 'action-button';
  favouriteButton.dataset.action = 'save-favourites';
  favouriteButton.textContent = '♥ Favourite';

  const readLaterButton = document.createElement('button');
  readLaterButton.type = 'button';
  readLaterButton.className = 'action-button secondary';
  readLaterButton.dataset.action = 'save-read-later';
  readLaterButton.textContent = '🔖 Read Later';

  const detailButton = document.createElement('button');
  detailButton.type = 'button';
  detailButton.className = 'action-button';
  detailButton.dataset.action = 'show-detail';
  detailButton.textContent = 'View details';

  buttonGroup.appendChild(favouriteButton);
  buttonGroup.appendChild(readLaterButton);
  actionRow.appendChild(buttonGroup);
  actionRow.appendChild(detailButton);

  const cardBody = document.createElement('div');
  cardBody.className = 'card-body';
  cardBody.appendChild(titleElement);
  cardBody.appendChild(authorElement);
  cardBody.appendChild(metaRow);

  article.appendChild(coverWrap);
  article.appendChild(cardBody);
  article.appendChild(actionRow);

  return article;
}
