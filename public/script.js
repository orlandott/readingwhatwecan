document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".gauntlet-tab");
  const panes = document.querySelectorAll(".w-tab-pane");

  const sourceLabels = [
    { match: "amazon", label: "Amazon" },
    { match: ".pdf", label: "PDF" },
    { match: "lesswrong", label: "LessWrong" },
    { match: "arxiv", label: "ArXiv" },
    { match: "docs.google", label: "Google Docs" },
  ];

  const trackLabels = {
    first_entry: "AI safety basics",
    ml: "ML engineering & AI safety",
    ais: "ML upskilling",
    scifi: "AI safety-relevant sci-fi",
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetTab = tab.getAttribute("data-w-tab");

      tabs.forEach((t) => t.classList.remove("w--current"));
      tab.classList.add("w--current");

      panes.forEach((pane) => {
        pane.classList.remove("w--tab-active");
        if (pane.getAttribute("data-w-tab") === targetTab) {
          pane.classList.add("w--tab-active");
        }
      });
    });
  });

  const escapeHtml = (value = "") =>
    value
      .toString()
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  const escapeForJs = (value = "") =>
    value
      .toString()
      .replaceAll("\\", "\\\\")
      .replaceAll('"', '\\"');

  const getSourceLabel = (link = "") => {
    const normalizedLink = link.toLowerCase();
    const found = sourceLabels.find(({ match }) => normalizedLink.includes(match));
    return found ? found.label : "Article";
  };

  const formatRank = (index) => (index + 1 < 10 ? `0${index + 1}` : `${index + 1}`);

  const getFallbackInitial = (title = "") => {
    const trimmed = title.trim();
    return trimmed.length ? trimmed[0].toUpperCase() : "R";
  };

  const renderBook = (entry, target, index) => {
    const parent = document.getElementById(target);
    if (!parent) {
      return;
    }

    if (!entry) {
      parent.insertAdjacentHTML(
        "beforeend",
        `
        <a href="#suggestion-form-section" class="hypothesis book suggestion-card responsive w-inline-block">
          <span class="book-rank">${formatRank(index)}</span>
          <span class="book-cover"><span class="cover-fallback">+</span></span>
          <div class="book-main">
            <h4 class="idea-header book">Suggest a title for this slot</h4>
            <span class="author">Use the quick form above</span>
            <div class="book-meta">
              <span class="source-pill">Community</span>
              <span class="page-pill">Open suggestion</span>
            </div>
          </div>
          <span class="open-link">Suggest <img class="link-icon" src="./images/arrow-up-outline.svg" /></span>
        </a>`
      );
      return;
    }

    const safeName = escapeHtml(entry.Name || "Untitled");
    const safeAuthor = escapeHtml(entry.Author || "Unknown author");
    const normalizedLink = (entry.Link || "#").trim();
    const safeLink = escapeHtml(normalizedLink);
    const pageCount = Number.isFinite(Number(entry.page_count)) && Number(entry.page_count) > 0
      ? `${Number(entry.page_count)} pages`
      : "Page count unknown";
    const coverMarkup = entry.Image
      ? `<img class="book-image" src="${escapeHtml(entry.Image)}" loading="lazy" alt="${safeName} cover" />`
      : `<span class="cover-fallback">${getFallbackInitial(safeName)}</span>`;

    parent.insertAdjacentHTML(
      "beforeend",
      `
      <a href="${safeLink}" target="_blank" rel="noopener noreferrer" class="hypothesis book responsive w-inline-block">
        <span class="book-rank">${formatRank(index)}</span>
        <span class="book-cover">${coverMarkup}</span>
        <div class="book-main">
          <h4 class="idea-header book">${safeName}</h4>
          <span class="author" title="${safeAuthor}">${safeAuthor}</span>
          <div class="book-meta">
            <span class="source-pill">${getSourceLabel(normalizedLink)}</span>
            <span class="page-pill">${pageCount}</span>
          </div>
        </div>
        <span class="open-link">Open <img class="link-icon" src="./images/arrow-up-outline.svg" /></span>
      </a>`
    );
  };

  const renderAllBooks = () => {
    for (let i = 0; i < 20; i += 1) {
      renderBook(first_entry[i], "beginner-parent", i);
      renderBook(ml[i], "ml-parent", i);
      renderBook(ais[i], "aisafety-parent", i);
      renderBook(scifi[i], "scifi-parent", i);
    }
  };

  const suggestionForm = document.getElementById("book-suggestion-form");
  const copySnippetButton = document.getElementById("copy-book-snippet");
  const suggestionFeedback = document.getElementById("suggestion-feedback");

  const setFeedback = (message) => {
    if (suggestionFeedback) {
      suggestionFeedback.textContent = message;
    }
  };

  const getSuggestionValues = () => {
    if (!suggestionForm) {
      return null;
    }

    const formData = new FormData(suggestionForm);
    return {
      name: (formData.get("name") || "").toString().trim(),
      author: (formData.get("author") || "").toString().trim(),
      link: (formData.get("link") || "").toString().trim(),
      pages: (formData.get("pages") || "").toString().trim(),
      track: (formData.get("track") || "first_entry").toString(),
    };
  };

  const createSnippet = (data) => {
    const normalizedPageCount = Number.isFinite(Number(data.pages)) && Number(data.pages) > 0
      ? Number(data.pages)
      : 0;
    return `{ Name: "${escapeForJs(data.name)}", Link: "${escapeForJs(data.link)}", Author: "${escapeForJs(data.author)}", page_count: ${normalizedPageCount} },`;
  };

  const copyText = async (text) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const tempTextarea = document.createElement("textarea");
    tempTextarea.value = text;
    document.body.appendChild(tempTextarea);
    tempTextarea.select();
    document.execCommand("copy");
    document.body.removeChild(tempTextarea);
  };

  if (suggestionForm) {
    suggestionForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = getSuggestionValues();
      if (!data || !data.name || !data.author || !data.link) {
        setFeedback("Please fill title, author, and link before submitting.");
        return;
      }

      const snippet = createSnippet(data);
      const emailSubject = `[RWWC Suggestion] ${data.name}`;
      const emailBody = [
        "Hi Reading What We Can team,",
        "",
        "I'd like to suggest a new reading option:",
        "",
        `- Title: ${data.name}`,
        `- Author: ${data.author}`,
        `- Link: ${data.link}`,
        `- Pages: ${data.pages || "Unknown"}`,
        `- Reading track: ${trackLabels[data.track] || trackLabels.first_entry}`,
        "",
        "## books.js snippet",
        "```js",
        snippet,
        "```",
        "",
        "Thanks!",
      ].join("\n");
      const mailtoUrl = `mailto:esben@apartresearch.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

      window.location.href = mailtoUrl;
      setFeedback("Opened your email app with a pre-filled suggestion draft.");
    });
  }

  if (copySnippetButton) {
    copySnippetButton.addEventListener("click", async () => {
      const data = getSuggestionValues();
      if (!data || !data.name || !data.author || !data.link) {
        setFeedback("Fill out title, author, and link first to copy a valid snippet.");
        return;
      }

      try {
        await copyText(createSnippet(data));
        setFeedback("Copied books.js snippet to clipboard.");
      } catch (error) {
        setFeedback("Could not copy snippet automatically. You can still send the email draft.");
      }
    });
  }

  renderAllBooks();
});
