export default function createEmptyState(message) {
  const wrapper = document.createElement('div');
  wrapper.className = 'empty-state';

  const title = document.createElement('h3');
  title.textContent = 'Nothing to show yet';

  const description = document.createElement('p');
  description.textContent = message;

  wrapper.appendChild(title);
  wrapper.appendChild(description);

  return wrapper;
}
