document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.gauntlet-tab');
  const panes = document.querySelectorAll('.w-tab-pane');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.getAttribute('data-w-tab');

      tabs.forEach(t => t.classList.remove('w--current'));
      tab.classList.add('w--current');

      panes.forEach(pane => {
        pane.classList.remove('w--tab-active');
        if (pane.getAttribute('data-w-tab') === targetTab) {
          pane.classList.add('w--tab-active');
        }
      });
    });
  });

  const PrintItem = (entry, target, i) => {
    const parent = document.getElementById(target);
    if (entry) {
      parent.innerHTML += `
        <a href="${entry.Link}" target="_blank" class="hypothesis book w-inline-block">
          <span>${i + 1 < 10 ? "0" + (i + 1) : i + 1}</span>
          <h4 class="idea-header book">${entry.Name}</h4>
          <span class="author" title="${entry.Author}">${entry.Author.length > 30 ? entry.Author.slice(0, 30) + "..." : entry.Author}</span>
          <span class="link">${entry.Link.includes("amazon") ? "Amazon" : entry.Link.includes(".pdf") ? "PDF" : entry.Link.includes("lesswrong") ? "LessWrong" : entry.Link.includes("arxiv") ? "ArXiv" : entry.Link.includes("docs.google") ? "Google Docs" : "Article"} <img class="link-icon" src="./images/arrow-up-outline.svg" /></span>
          <span>${entry.page_count} pages</span>
          ${entry.Image ? `<img class="book-image" src="${entry.Image}" loading="lazy" alt="" />` : ""}
        </a>`;
    } else {
      parent.innerHTML += `
        <a href="https://github.com/apartresearch/readingwhatwecan/edit/main/public/books.js" target="_blank" class="hypothesis book w-inline-block">
          <span>${i + 1 < 10 ? "0" + (i + 1) : i + 1}</span>
          <h4 class="idea-header book">Click to suggest a book</h4>
          <span class="author">Github</span>
          <span class="link">Link <img class="link-icon" src="./images/arrow-up-outline.svg" /></span>
          <span>.</span>
        </a>`;
    }
  };

  for (let i = 0; i < 20; i++) {
    PrintItem(window.first_entry?.[i], "beginner-parent", i);
    PrintItem(window.ml?.[i], "ml-parent", i);
    PrintItem(window.ais?.[i], "aisafety-parent", i);
    PrintItem(window.scifi?.[i], "scifi-parent", i);
  }
});
