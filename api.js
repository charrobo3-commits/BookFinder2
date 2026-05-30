const SEARCH_FIELDS = [
  'key',
  'title',
  'author_name',
  'cover_i',
  'first_publish_year',
  'edition_count',
  'has_fulltext',
  'subject',
  'publisher',
  'language',
  'isbn',
  'ia'
].join(',');

export async function searchBooks(query, sort = 'relevance') {
  const url = new URL('https://openlibrary.org/search.json');
  url.searchParams.set('title', query);
  url.searchParams.set('fields', SEARCH_FIELDS);
  url.searchParams.set('limit', '20');
  url.searchParams.set('sort', sort);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error('Search request failed');
  }

  return response.json();
}

export async function fetchWorkDetails(workKey) {
  const workId = workKey.replace('/works/', '').replace('.json', '');
  const url = `https://openlibrary.org/works/${workId}.json`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to load book details');
  }

  const data = await response.json();
  const description =
    typeof data.description === 'string'
      ? data.description
      : data.description?.value || '';

  return {
    ...data,
    description,
  };
}
