# BookFinder2# 📚 BookFinder

A fast, no-framework book discovery app. Search any title using the Open Library API, view full book details, and organise your reading life with two personal lists — **Favourites** and **Read Later**.

---

## Features

- **Full-text book search** — queries the Open Library Search API by title; results show cover, authors, publish year, edition count, subjects, publisher, and languages
- **Book detail view** — click any result to expand its full Open Library record, including description, subjects, ISBN, and a direct link to the Open Library page
- **Favourites** — save books you love with a ♥ button; persists across sessions
- **Read Later** — save books to a reading queue with a 🔖 button; persists across sessions
- **Dual-list management** — dedicated tabs for each list; remove books individually
- **List filtering** — filter either saved list by title or author in real time
- **Cover images** — loaded from the Open Library Covers CDN with a lettered fallback placeholder
- **Debounced search** — waits 480 ms after you stop typing before firing a request
- **Sort options** — relevance, newest, oldest, top rated
- **Zero dependencies** — no npm, no bundler, no framework; runs directly in any modern browser

---

## Tech stack

| Concern | Choice |
|---|---|
| Markup | HTML5 (semantic, single-page) |
| Styles | CSS3 with custom properties |
| Logic | Vanilla JS, ES2020 modules |
| Search | Open Library Search API |
| Book details | Open Library Works API |
| Covers | Open Library Covers CDN |
| Persistence | `localStorage` |
| Fonts | Fraunces + DM Sans (Google Fonts) |

---

## Color palette — Citrus & Ink

| Token | Hex | Usage |
|---|---|---|
| Cream | `#FFF8F0` | Page background |
| Navy | `#1A1A2E` | Header, headings, body text |
| Tangerine | `#FF6B35` | Primary actions, focus rings, badges |
| Peach | `#F5E6D3` | Card surfaces, metadata chips |
| Teal | `#4ECDC4` | "Free to read" badge, Read Later accent |

---

## File structure

```
index.html
style.css
app.js                  ← entry point, routing, event wiring
api.js                  ← all fetch calls (search, works, covers)
storage.js              ← localStorage read/write for both lists
components/
  bookCard.js           ← search result card DOM node
  bookDetail.js         ← expanded book detail panel DOM node
  emptyState.js         ← zero-state display DOM node
  listItem.js           ← saved book row DOM node (shared by both lists)
README.md
AGENTS.md
```

---

## API reference

### Search
```
GET https://openlibrary.org/search.json
  ?title={query}
  &fields=key,title,author_name,cover_i,first_publish_year,edition_count,
          has_fulltext,subject,publisher,language,isbn,ia
  &limit=20
  &sort={relevance|new|old|rating}
```

### Full book record (Works API)
```
GET https://openlibrary.org/works/{workId}.json
```
Returns: description, subjects, links, cover IDs, first publish date, excerpts.

### Cover image
```
https://covers.openlibrary.org/b/id/{cover_i}-M.jpg   ← card thumbnail
https://covers.openlibrary.org/b/id/{cover_i}-L.jpg   ← detail panel
```

---

## Saved lists

Both lists are stored in `localStorage` as JSON arrays.

| List | Key | Button |
|---|---|---|
| Favourites | `bookfinder-favourites` | ♥ |
| Read Later | `bookfinder-read-later` | 🔖 |

Each saved entry is the search result object plus `{ savedAt: Date.now() }`. Entries are prepended (most recently saved first). A book can exist in both lists independently.

---

## Possible extensions

- Reading status tags within Read Later (Unread / In Progress / Done)
- Export either list as CSV or JSON
- Author detail pages via the Open Library Authors API
- Subject/genre browsing via the Subjects API
- Offline support via a Service Worker