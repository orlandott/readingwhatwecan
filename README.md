# [Reading What We Can](https://readingwhatwecan.com)

📚📚📚📚📚📚📚📚📚 Reading everything

[![Netlify Status](https://api.netlify.com/api/v1/badges/db1201fd-2948-475e-85e1-efceac89bba5/deploy-status)](https://app.netlify.com/sites/bright-cucurucho-3be4e5/deploys)

### Add a new book by editing the [books.js](public/books.js) file and submitting a pull request

### Suggestions via Google Form

Suggestions are submitted from the website directly to a Google Form endpoint.

- Form config lives in [`public/suggestion-form-config.js`](public/suggestion-form-config.js).
- Keep this file in git so updates to the copied form mapping are reviewable in pull requests.
- Replace the placeholder `formViewUrl`, `formResponseUrl`, and `entry.*` field IDs with your copied form's values.
- Use [`docs/google-form-copy.md`](docs/google-form-copy.md) as the canonical form-copy template.

When the form is linked to a Google Sheet, incoming website suggestions are added there automatically.
