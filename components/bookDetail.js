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

export default function createBookDetail({ book, workData }) {
  const wrapper = document.createElement('div');
  wrapper.className = 'detail-main';

  const grid = document.createElement('div');
  grid.className = 'detail-grid';

  const cover = document.createElement('div');
  cover.className = 'detail-cover';

  const coverId = workData.covers?.[0] || book.cover_i;
  if (coverId) {
    const image = document.createElement('img');
    image.src = `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
    image.alt = `${book.title} cover`;
    attachFallbackImage(image, book.title);
    cover.appendChild(image);
  } else {
    cover.appendChild(createCoverPlaceholder(book.title));
  }

  const info = document.createElement('div');
  info.className = 'detail-info';

  const title = document.createElement('h2');
  title.textContent = book.title;

  const author = document.createElement('p');
  author.textContent = Array.isArray(book.author_name) ? book.author_name.join(', ') : 'Unknown author';

  const description = document.createElement('p');
  description.textContent = workData.description || 'No description is available for this work.';

  const chipRow = document.createElement('div');
  chipRow.className = 'detail-chips';
  const subjects = Array.isArray(workData.subjects) ? workData.subjects.slice(0, 6) : [];
  subjects.forEach((subject) => {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.textContent = subject;
    chipRow.appendChild(chip);
  });

  const metadata = document.createElement('dl');
  metadata.className = 'large-metadata';

  function appendMetadata(label, value) {
    if (!value) {
      return;
    }
    const term = document.createElement('dt');
    term.textContent = label;
    const descriptionElement = document.createElement('dd');
    descriptionElement.textContent = value;
    metadata.appendChild(term);
    metadata.appendChild(descriptionElement);
  }

  appendMetadata('Published', workData.first_publish_date || book.first_publish_year || 'Unknown');
  appendMetadata('Editions', book.edition_count ? String(book.edition_count) : 'Unknown');
  appendMetadata('Publisher', Array.isArray(book.publisher) ? book.publisher[0] : 'Unknown');
  appendMetadata('Languages', Array.isArray(book.language) ? book.language.join(', ') : 'Unknown');
  appendMetadata('ISBN', Array.isArray(book.isbn) ? book.isbn.slice(0, 3).join(', ') : 'Unavailable');

  const link = document.createElement('a');
  link.className = 'action-button';
  link.href = `https://openlibrary.org${book.key}`;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = 'Open on Open Library';

  info.appendChild(title);
  info.appendChild(author);
  info.appendChild(chipRow);
  info.appendChild(description);
  info.appendChild(metadata);
  info.appendChild(link);

  grid.appendChild(cover);
  grid.appendChild(info);
  wrapper.appendChild(grid);

  return wrapper;
}
