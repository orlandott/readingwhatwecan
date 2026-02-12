const grid = document.getElementById("booksGrid");
const search = document.getElementById("searchInput");

if (!window.books) {
  console.error("books.js not loaded");
  window.books = [];
}

function renderBooks(list) {
  grid.innerHTML = "";
  list.forEach(book => {
    const card = document.createElement("div");
    card.className = "book-card";
    card.innerHTML = `
      <h3>${book.title}</h3>
      <small>${book.author || ""}</small>
      <p>${book.description || ""}</p>
      <a href="${book.link}" target="_blank">Read →</a>
    `;
    grid.appendChild(card);
  });
}

renderBooks(window.books);

search.addEventListener("input", e => {
  const q = e.target.value.toLowerCase();
  renderBooks(window.books.filter(b =>
    b.title.toLowerCase().includes(q) ||
    (b.author || "").toLowerCase().includes(q)
  ));
});

const form = document.getElementById("submitForm");
const status = document.getElementById("formStatus");

// 🔴 replace with your Apps Script URL
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwQY1XXNQxh1_6rxTrMEXlk3aDUidhsQM8hq5T0Qzbv8tfErjqldlDub98STgnHtXj9DA/exec";

form.addEventListener("submit", e => {
  e.preventDefault();
  status.innerText = "Submitting...";

  fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    body: new FormData(form)
  })
  .then(() => {
    status.innerText = "✅ Submitted!";
    form.reset();
  })
  .catch(() => {
    status.innerText = "❌ Error submitting.";
  });
});

