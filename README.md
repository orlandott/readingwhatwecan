# [Reading What We Can](https://readingwhatwecan.com)

📚📚📚📚📚📚📚📚📚 Reading everything

[![Netlify Status](https://api.netlify.com/api/v1/badges/db1201fd-2948-475e-85e1-efceac89bba5/deploy-status)](https://app.netlify.com/sites/bright-cucurucho-3be4e5/deploys)

### Add a new book by editing the [books.js](public/books.js) file and submitting a pull request

### Suggestions submission endpoint

Suggestions are submitted from the website based on the config in [`public/suggestion-form-config.js`](public/suggestion-form-config.js).

- Current default mode is an Apps Script web app endpoint writing to a Google Sheet.
- If you use Apps Script, deploy it with public access ("Anyone") so website visitors can submit.
- You can also switch to Google Form mode using `formResponseUrl` + `entry.*` mappings.
- Use [`docs/google-form-copy.md`](docs/google-form-copy.md) as the canonical Google Form copy template.

Keep config changes in git so submission routing is reviewable in pull requests.
