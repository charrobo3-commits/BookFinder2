# AGENTS.md — BookFinder

Read this file fully before writing or modifying any code. It defines the architecture, constraints, and conventions for the BookFinder project.

---

## Project overview

BookFinder is a single-page book discovery app. Users search by title via the Open Library API, view full book details, and save books to two independent personal lists: **Favourites** and **Read Later**. There is no build step, no framework, and no package manager. Everything runs in the browser from static files.

---

## Stack constraints

- **HTML5 + CSS3 + Vanilla JS (ES2020 modules)** — this is the entire stack
- No npm, no `package.json`, no `node_modules`
- No framework (React, Vue, Svelte, etc.)
- No bundler (Vite, Webpack, Parcel, Rollup, etc.)
- No TypeScript
- No external CSS libraries (Bootstrap, Tailwind, etc.)
- JS files use `<script type="module">` — imports are relative paths, no bare specifiers

Violating any of the above is a hard error. If a task seems to require one of these tools, solve it without them.

---

## File structure

```
index.html              ← app shell; imports style.css and app.js
style.css               ← all styles; CSS custom properties only — no hardcoded values
app.js                  ← entry point; initialises app, wires all event listeners
api.js                  ← all fetch calls; nothing else
storage.js              ← all localStorage calls; nothing else
components/
  bookCard.js           ← returns a <div> DOM node for a search result
  bookDetail.js         ← returns a <div> DOM node for the expanded book detail panel
  emptyState.js         ← returns a <div> DOM node for zero/empty states
  listItem.js           ← returns a <div> DOM node for a saved book in either list
README.md
AGENTS.md
```

Do not create files outside this structure without a strong reason. Do not create a `src/` folder or any build output directory.

---

## Design system

All visual values come from CSS custom properties defined in `:root` in `style.css`. Never hardcode a colour, font, or spacing value in HTML or JS — reference a variable.

### Colour tokens — Citrus & Ink

```css
:root {
  --color-cream:           #FFF8F0;
  --color-peach:           #F5E6D3;
  --color-tangerine:       #FF6B35;
  --color-tangerine-dark:  #E85A25;
  --color-tangerine-light: #FFF0EA;
  --color-navy:            #1A1A2E;
  --color-navy-mid:        #2D2D45;
  --color-teal:            #4ECDC4;
  --color-teal-light:      #E8F8F7;
  --color-teal-dark:       #2A9D96;
  --color-border:          rgba(26,26,46,0.12);
  --color-border-strong:   rgba(26,26,46,0.22);
  --color-muted:           rgba(26,26,46,0.45);
}
```

### Typography tokens

```css
:root {
  --font-display: 'Fraunces', Georgia, serif;   /* headings, book titles */
  --font-body:    'DM Sans', system-ui, sans-serif;
}
```

Both fonts are loaded from Google Fonts in `index.html`. Do not add other font imports.

### Spacing tokens

```css
:root {
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 40px;
}
```

---

## API — rules and endpoints

All network calls live exclusively in `api.js`. No other file may call `fetch`.

### 1. Title search

```
GET https://openlibrary.org/search.json
  ?title={query}
  &fields=key,title,author_name,cover_i,first_publish_year,edition_count,
          has_fulltext,subject,publisher,language,isbn,ia
  &limit=20
  &sort={relevance|new|old|rating}
```

Always include the `fields` parameter. Omitting it returns a very large payload and strains the public API.

Response shape (relevant parts):
```json
{
  "numFound": 1240,
  "docs": [
    {
      "key": "/works/OL27448W",
      "title": "The Lord of the Rings",
      "author_name": ["J. R. R. Tolkien"],
      "cover_i": 258027,
      "first_publish_year": 1954,
      "edition_count": 120,
      "has_fulltext": true,
      "subject": ["Fantasy fiction", "Rings"],
      "publisher": ["Allen & Unwin"],
      "language": ["eng"],
      "isbn": ["9780618640157"]
    }
  ]
}
```

### 2. Full book record (Works API)

Fired when the user clicks a book card to expand its detail view.

```
GET https://openlibrary.org/works/{workId}.json
```

Where `workId` is the numeric part of `key` — e.g. for `key: "/works/OL27448W"`, call `/works/OL27448W.json`.

Key fields from this response:
- `description` — may be a string or `{ type, value }` object; normalise to a string
- `subjects` — array of strings
- `links` — array of `{ title, url }` objects
- `covers` — array of cover IDs (integers)
- `first_publish_date` — string

### 3. Cover images

```
Thumbnail (card):  https://covers.openlibrary.org/b/id/{cover_i}-M.jpg
Full size (detail): https://covers.openlibrary.org/b/id/{cover_i}-L.jpg
```

`cover_i` may be absent in the search result. The Works API `covers[0]` is a fallback.

Always attach an `onerror` handler to every `<img>` pointing at this CDN. On error, replace the image with a `CoverPlaceholder` — a block showing the first letter of the title in `--color-tangerine` on a `--color-tangerine-light` background.

### 4. Debounce

The search input must be debounced at **480 ms** before any fetch is fired. Implement the debounce utility at the top of `app.js`. Do not use a library for this.

---

## Saved lists

All `localStorage` access lives exclusively in `storage.js`. No other file may call `localStorage`.

| List | localStorage key | UI button |
|---|---|---|
| Favourites | `bookfinder-favourites` | ♥ |
| Read Later | `bookfinder-read-later` | 🔖 |

### Data shape

Each saved entry is the full search result `doc` object plus:
```json
{ "savedAt": 1716000000000 }
```

New saves are **prepended** (most recently saved first). A book may exist in both lists independently — saving to one does not affect the other.

### `storage.js` must export

```js
export function getList(listName)           // returns array
export function saveToList(listName, book)  // prepends; no-op if already present
export function removeFromList(listName, key) // removes by book.key
export function isInList(listName, key)     // returns boolean
```

`listName` is always `'favourites'` or `'read-later'`.

---

## DOM conventions

### Building nodes

Components return DOM nodes built with `document.createElement` and `element.textContent`. This is the rule:

- **`textContent`** for any string that comes from the API or user input
- **`innerHTML`** only for static structural templates with no user data interpolated

This is a security requirement. Violating it (e.g. using `innerHTML` to inject a book title) is a hard error.

### Book identification

Every book card and list item must carry a `data-key` attribute set to the book's `key` value (e.g. `data-key="/works/OL27448W"`). This is used for event delegation and list lookups.

### State ownership

All app state (search results, active tab, open detail panel) lives in JS variables in `app.js`. Do not store state in the DOM beyond `data-key` identifiers.

---

## Event handling

Use **event delegation** on container elements. Do not attach listeners to individual cards or list items.

Delegated listeners to implement:
- Search results container — catches clicks on save-to-favourites (♥), save-to-read-later (🔖), and expand-detail actions, keyed off `data-key`
- Favourites container — catches remove clicks
- Read Later container — catches remove clicks

---

## Tab structure

The app has four tabs:

| Tab ID | Content |
|---|---|
| `search` | Search input, sort dropdown, results |
| `detail` | Expanded book record (opened by clicking a card) |
| `favourites` | Saved favourites list with filter input |
| `read-later` | Read Later list with filter input |

`detail` is a transient tab — it opens when a card is clicked and has a back button that returns to `search`. It is not shown in the main tab bar.

---

## Animations

Card entry is CSS-only:

```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

Applied via a `.fade-up` class. Staggered delay is set via inline style (`style="animation-delay: Xms"`), incrementing 40 ms per card. Do not use JS animation libraries.

---

## What never to do

- Call `fetch` outside `api.js`
- Call `localStorage` outside `storage.js`
- Use `innerHTML` with API or user data
- Hardcode a colour, font, or spacing value outside `style.css`
- Install a package or introduce a bundler
- Attach event listeners to individual dynamically-created cards

---

## Pre-commit checklist

- [ ] No `package.json` or `node_modules`
- [ ] All colours/fonts/spacing use CSS custom properties
- [ ] API data rendered with `textContent`, never `innerHTML`
- [ ] Search input debounced at 480 ms
- [ ] All `<img>` elements hitting Open Library have an `onerror` fallback
- [ ] `fetch` called only inside `api.js`
- [ ] `localStorage` called only inside `storage.js`
- [ ] Both list operations (save, remove, query) go through `storage.js` exports
- [ ] Every book card and list item has `data-key` set
- [ ] New components return a DOM node from a function in `components/`