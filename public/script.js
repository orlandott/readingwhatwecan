document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".gauntlet-tab");
  const panes = document.querySelectorAll(".w-tab-pane");

  const sourceLabels = [
    { match: "goodreads.com", label: "Goodreads" },
    { match: "amazon", label: "Amazon" },
    { match: ".pdf", label: "PDF" },
    { match: "lesswrong", label: "LessWrong" },
    { match: "arxiv", label: "ArXiv" },
    { match: "docs.google", label: "Google Docs" },
  ];
  const entryMetadataCache = new Map();
  const pendingMetadataLookups = new Map();

  const trackLabels = {
    entry_point: "The Entry Point (Primers & Essays)",
    canon: "The Canon (Foundational Books)",
    problem_space: "The Problem Space (Research Agendas & Concepts)",
    technical_frontier: "The Technical Frontier (Mechanisms & Interpretability)",
    speculative_fiction: "Speculative Fiction (AI-Relevant Sci-Fi)",
  };

  const categoryBookNames = {
    entry_point: [
      "The AI Revolution",
      "Preventing an AI-related catastrophe",
      "The Coming Technological Singularity (1994)",
      "AGI safety from first principles",
      "Machines of Loving Grace",
      "Situational Awareness",
      "The Most Important Century",
      "Introduction to AI Safety, Ethics, and Society",
      "Human Compatible",
      "Uncontrollable: The Threat of Artificial Superintelligence",
      "You Look Like a Thing and I Love You",
      "Hello World: Being Human in the Age of Algorithms",
      "AI Superpowers",
      "The Risks of Artificial Intelligence",
    ],
    canon: [
      "Superintelligence",
      "The Singularity is Near",
      "The Age of Em",
      "The Alignment Problem",
      "Life 3.0",
      "The Precipice (Chapter on AI)",
      "Rationality: From AI to Zombies",
      "Reframing Superintelligence",
      "The Ethical Algorithm",
      "Army of None: Autonomous Weapons and the Future of War",
      "The Age of Spiritual Machines",
      "Deep Learning",
      "I, Robot",
    ],
    problem_space: [
      "Concrete problems in AI safety",
      "Research agenda for AI alignment",
      "Research priorities for robust and beneficial AI",
      "Alignment for advanced machine learning systems",
      "AI as positive and negative risk factors",
      "Risks from Learned Optimization",
      "Is Power-Seeking AI an Existential Risk?",
      "Taking AI Welfare Seriously",
      "Gradual Disempowerment",
      "Does AI Progress Have a Speed Limit?",
      "The Offense-Defense Balance of Scientific Openness",
      "Model Organisms of Misalignment",
      "Unsolved Problems in ML Safety",
      "Goal Misgeneralization",
      "Specification Gaming: The Flip Side of AI Ingenuity",
      "AI Safety via Debate",
    ],
    technical_frontier: [
      "The Circuits Series 0",
      "The Circuits Series 1",
      "The Circuits Series 2",
      "Eliciting Latent Knowledge",
      "Training a Helpful and Harmless Assistant with RLHF",
      "Instruct-GPT-3",
      "GopherCite",
      "World Models",
      "Constitutional AI: Harmlessness from AI Feedback",
      "Weak-to-Strong Generalization",
      "Sleeper Agents: Training Deceptive LLMs that Persist Through Safety Training",
      "Toy Models of Superposition",
      "Red Teaming Language Models to Reduce Harms",
      "Discovering Latent Knowledge in Language Models Without Supervision",
      "Sparks of Artificial General Intelligence",
      "Scaling Laws for Neural Language Models",
      "Deep Reinforcement Learning from Human Preferences",
      "Causal Confusion in Imitation Learning",
    ],
    speculative_fiction: [
      "The Fable of the Dragon-Tyrant",
      "Harry Potter and the Methods of Rationality (#1 of 6)",
      "Do Androids Dream of Electric Sheep?",
      "The Last Question",
      "The Dark Forest (#2 of Three Body Problem)",
      "Neuromancer",
      "Crystal Society trilogy: Inside the mind of an AI",
      "Virtua",
      "Logic Beach",
      "Flatland: A Romance of Many Dimensions",
      "The Bridge to Lucy Dunne",
      "We Are Legion (We Are Bob)",
      "Of Ants and Dinosaurs",
      "Geometry for Ocelots",
      "Klara and the Sun",
      "Excession",
      "Permutation City",
      "Accelerando",
      "A Closed and Common Orbit",
      "There Is No Antimemetics Division",
      "Hyperion",
      "Daemon",
      "Avogadro Corp",
      "Service Model",
    ],
  };

  const knownPublicationYears = {
    "The Coming Technological Singularity (1994)": 1994,
    "Machines of Loving Grace": 2024,
    "Situational Awareness": 2024,
    "The Most Important Century": 2021,
    "Introduction to AI Safety, Ethics, and Society": 2025,
    "Human Compatible": 2019,
    "Uncontrollable: The Threat of Artificial Superintelligence": 2023,
    "You Look Like a Thing and I Love You": 2019,
    "Hello World: Being Human in the Age of Algorithms": 2018,
    "AI Superpowers": 2018,
    "The Risks of Artificial Intelligence": 2023,
    "The Alignment Problem": 2020,
    "Life 3.0": 2017,
    "The Precipice (Chapter on AI)": 2020,
    "Rationality: From AI to Zombies": 2015,
    "Reframing Superintelligence": 2019,
    "The Ethical Algorithm": 2019,
    "Army of None: Autonomous Weapons and the Future of War": 2018,
    "The Age of Spiritual Machines": 1999,
    "Deep Learning": 2016,
    "I, Robot": 1950,
    "Is Power-Seeking AI an Existential Risk?": 2022,
    "Taking AI Welfare Seriously": 2024,
    "Gradual Disempowerment": 2025,
    "Does AI Progress Have a Speed Limit?": 2025,
    "The Offense-Defense Balance of Scientific Openness": 2022,
    "Model Organisms of Misalignment": 2021,
    "Unsolved Problems in ML Safety": 2021,
    "Goal Misgeneralization": 2022,
    "Specification Gaming: The Flip Side of AI Ingenuity": 2020,
    "AI Safety via Debate": 2018,
    "Constitutional AI: Harmlessness from AI Feedback": 2022,
    "Weak-to-Strong Generalization": 2023,
    "Sleeper Agents: Training Deceptive LLMs that Persist Through Safety Training": 2024,
    "Toy Models of Superposition": 2022,
    "Red Teaming Language Models to Reduce Harms": 2022,
    "Discovering Latent Knowledge in Language Models Without Supervision": 2022,
    "Sparks of Artificial General Intelligence": 2023,
    "Scaling Laws for Neural Language Models": 2020,
    "Deep Reinforcement Learning from Human Preferences": 2017,
    "Causal Confusion in Imitation Learning": 2019,
    "Klara and the Sun": 2021,
    Excession: 1996,
    "Permutation City": 1994,
    Accelerando: 2005,
    "A Closed and Common Orbit": 2016,
    "There Is No Antimemetics Division": 2021,
    Hyperion: 1989,
    Daemon: 2006,
    "Avogadro Corp": 2011,
    "Service Model": 2024,
  };

  const defaultSubmissionConfig = {
    mode: "google_form",
    appsScript: {
      endpointUrl: "",
      sheetUrl: "",
    },
    googleForm: {
      formViewUrl: "https://docs.google.com/forms/d/e/REPLACE_WITH_FORM_ID/viewform",
      formResponseUrl: "https://docs.google.com/forms/d/e/REPLACE_WITH_FORM_ID/formResponse",
      fields: {
        name: "entry.1000000001",
        author: "entry.1000000002",
        link: "entry.1000000003",
        pages: "entry.1000000004",
        track: "entry.1000000005",
      },
    },
  };
  const rawSubmissionConfig = window.RWWC_SUGGESTION_SUBMISSION || {};
  const legacyGoogleFormConfig = window.RWWC_GOOGLE_FORM || {};
  const sourceGoogleFormConfig = rawSubmissionConfig.googleForm || legacyGoogleFormConfig;

  const submissionConfig = {
    mode: rawSubmissionConfig.mode || defaultSubmissionConfig.mode,
    appsScript: {
      ...defaultSubmissionConfig.appsScript,
      ...(rawSubmissionConfig.appsScript || {}),
    },
    googleForm: {
      ...defaultSubmissionConfig.googleForm,
      ...sourceGoogleFormConfig,
      fields: {
        ...defaultSubmissionConfig.googleForm.fields,
        ...(sourceGoogleFormConfig.fields || {}),
      },
    },
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

  const getSourceLabel = (link = "") => {
    const normalizedLink = link.toLowerCase();
    const found = sourceLabels.find(({ match }) => normalizedLink.includes(match));
    return found ? found.label : "Article";
  };

  const buildGoodreadsSearchUrl = (entry = {}) => {
    const query = [entry.Name || "", entry.Author || ""]
      .join(" ")
      .trim();
    if (!query) {
      return "https://www.goodreads.com/";
    }
    return `https://www.goodreads.com/search?q=${encodeURIComponent(query)}`;
  };

  const enrichEntryLinks = (entry) => {
    if (!entry) {
      return;
    }

    const rawLink = typeof entry.Link === "string" ? entry.Link.trim() : "";
    const hasGoodreadsInPrimaryLink = rawLink.toLowerCase().includes("goodreads.com");

    if (!entry.Goodreads || !entry.Goodreads.trim()) {
      entry.Goodreads = hasGoodreadsInPrimaryLink
        ? rawLink
        : buildGoodreadsSearchUrl(entry);
    }

    if (!rawLink && entry.Goodreads) {
      entry.Link = entry.Goodreads;
    }
  };

  const normalizePositiveInteger = (value) => {
    const numericValue = Number.parseInt(value, 10);
    return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : null;
  };

  const normalizeYear = (value) => {
    const numericValue = Number.parseInt(value, 10);
    return Number.isFinite(numericValue) && numericValue >= 1800 && numericValue <= 2100
      ? numericValue
      : null;
  };

  const inferYearFromTitle = (title = "") => {
    const match = title.toString().match(/\b(18|19|20)\d{2}\b/);
    return match ? normalizeYear(match[0]) : null;
  };

  const inferYearFromArxivLink = (link = "") => {
    const modernMatch = link.match(/arxiv\.org\/(?:abs|pdf)\/(\d{2})(\d{2})\.\d+/i);
    if (modernMatch) {
      const year = 2000 + Number.parseInt(modernMatch[1], 10);
      return normalizeYear(year);
    }
    return null;
  };

  const inferYearFromLink = (link = "") => {
    const arxivYear = inferYearFromArxivLink(link);
    if (arxivYear) {
      return arxivYear;
    }

    const urlYearMatch = link.match(/(?:\/|=)(18|19|20)\d{2}(?:\/|[-_]|$)/);
    return urlYearMatch ? normalizeYear(urlYearMatch[0].replaceAll(/[^0-9]/g, "")) : null;
  };

  const getEntryYear = (entry) => {
    if (!entry) {
      return null;
    }

    const explicitYear = normalizeYear(entry.Year);
    if (explicitYear) {
      return explicitYear;
    }

    const knownYear = normalizeYear(knownPublicationYears[entry.Name]);
    if (knownYear) {
      return knownYear;
    }

    const fromTitle = inferYearFromTitle(entry.Name || "");
    if (fromTitle) {
      return fromTitle;
    }

    return inferYearFromLink((entry.Link || "").trim());
  };

  const getPageCountLabel = (entry) => {
    const pageCount = normalizePositiveInteger(entry && entry.page_count);
    return pageCount ? `${pageCount} pages` : "Page count unknown";
  };

  const formatRank = (index) => (index + 1 < 10 ? `0${index + 1}` : `${index + 1}`);

  const getFallbackInitial = (title = "") => {
    const trimmed = title.trim();
    return trimmed.length ? trimmed[0].toUpperCase() : "R";
  };

  const toSafeDomId = (value = "") =>
    value.toString().replaceAll(/[^a-zA-Z0-9_-]/g, "-");

  const extractOpenLibraryMetadata = (payload) => {
    const docs = payload && Array.isArray(payload.docs) ? payload.docs : [];
    const match = docs.find((doc) => doc && (doc.cover_i || doc.number_of_pages_median || doc.first_publish_year));
    if (!match) {
      return { coverUrl: "", pageCount: null, year: null };
    }

    return {
      coverUrl: match.cover_i ? `https://covers.openlibrary.org/b/id/${match.cover_i}-L.jpg` : "",
      pageCount: normalizePositiveInteger(match.number_of_pages_median),
      year: normalizeYear(match.first_publish_year),
    };
  };

  const queryOpenLibraryMetadata = async (entry) => {
    const title = (entry.Name || "").trim();
    const author = (entry.Author || "").trim();
    if (!title) {
      return { coverUrl: "", pageCount: null, year: null };
    }

    const queryUrl = `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}${author ? `&author=${encodeURIComponent(author)}` : ""}&limit=5`;
    const response = await fetch(queryUrl);
    if (!response.ok) {
      return { coverUrl: "", pageCount: null, year: null };
    }

    const payload = await response.json();
    return extractOpenLibraryMetadata(payload);
  };

  const queryGoogleBooksMetadata = async (entry) => {
    const title = (entry.Name || "").trim();
    const author = (entry.Author || "").trim();
    if (!title) {
      return { coverUrl: "", pageCount: null, year: null };
    }

    const queryParts = [`intitle:${title}`];
    if (author) {
      queryParts.push(`inauthor:${author}`);
    }
    const queryUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(queryParts.join(" "))}&maxResults=3`;
    const response = await fetch(queryUrl);
    if (!response.ok) {
      return { coverUrl: "", pageCount: null, year: null };
    }

    const payload = await response.json();
    const items = payload && Array.isArray(payload.items) ? payload.items : [];
    const match = items.find((item) => item && item.volumeInfo);
    if (!match || !match.volumeInfo) {
      return { coverUrl: "", pageCount: null, year: null };
    }

    const links = match.volumeInfo.imageLinks || {};
    const coverUrl = links.thumbnail || links.smallThumbnail || "";
    const publishedDate = match.volumeInfo.publishedDate || "";
    const publishedYearMatch = publishedDate.match(/\b(18|19|20)\d{2}\b/);

    return {
      coverUrl: coverUrl ? coverUrl.replace("http://", "https://") : "",
      pageCount: normalizePositiveInteger(match.volumeInfo.pageCount),
      year: publishedYearMatch ? normalizeYear(publishedYearMatch[0]) : null,
    };
  };

  const fetchEntryMetadata = async (entry) => {
    const key = `${(entry.Name || "").trim().toLowerCase()}::${(entry.Author || "").trim().toLowerCase()}`;
    if (!key || key === "::") {
      return { coverUrl: "", pageCount: null, year: null };
    }

    if (entryMetadataCache.has(key)) {
      return entryMetadataCache.get(key);
    }

    if (pendingMetadataLookups.has(key)) {
      return pendingMetadataLookups.get(key);
    }

    const pendingLookup = (async () => {
      const metadata = { coverUrl: "", pageCount: null, year: null };
      try {
        const openLibraryMetadata = await queryOpenLibraryMetadata(entry);
        metadata.coverUrl = openLibraryMetadata.coverUrl || "";
        metadata.pageCount = normalizePositiveInteger(openLibraryMetadata.pageCount);
        metadata.year = normalizeYear(openLibraryMetadata.year);

        if (!metadata.coverUrl || !metadata.pageCount || !metadata.year) {
          const googleBooksMetadata = await queryGoogleBooksMetadata(entry);
          if (!metadata.coverUrl) {
            metadata.coverUrl = googleBooksMetadata.coverUrl || "";
          }
          if (!metadata.pageCount) {
            metadata.pageCount = normalizePositiveInteger(googleBooksMetadata.pageCount);
          }
          if (!metadata.year) {
            metadata.year = normalizeYear(googleBooksMetadata.year);
          }
        }
      } catch (error) {
        metadata.coverUrl = metadata.coverUrl || "";
      }

      entryMetadataCache.set(key, metadata);
      pendingMetadataLookups.delete(key);
      return metadata;
    })();

    pendingMetadataLookups.set(key, pendingLookup);
    return pendingLookup;
  };

  const hydrateEntryMetadata = async (entry, ids) => {
    if (!entry) {
      return;
    }

    if (entry.Image && normalizePositiveInteger(entry.page_count) && getEntryYear(entry)) {
      return;
    }

    const metadata = await fetchEntryMetadata(entry);

    if (!entry.Image && metadata.coverUrl) {
      entry.Image = metadata.coverUrl;
      const coverElement = document.getElementById(ids.coverElementId);
      if (coverElement) {
        const safeAlt = escapeHtml(`${entry.Name || "Book"} cover`);
        coverElement.innerHTML = `<img class="book-image" src="${escapeHtml(metadata.coverUrl)}" loading="lazy" alt="${safeAlt}" />`;
      }
    }

    if (!normalizePositiveInteger(entry.page_count) && metadata.pageCount) {
      entry.page_count = metadata.pageCount;
      const pageElement = document.getElementById(ids.pageElementId);
      if (pageElement) {
        pageElement.textContent = `${metadata.pageCount} pages`;
      }
    }

    if (!getEntryYear(entry) && metadata.year) {
      entry.Year = metadata.year;
      const yearElement = document.getElementById(ids.yearElementId);
      if (yearElement) {
        yearElement.textContent = `${metadata.year}`;
        yearElement.classList.remove("is-hidden");
      }
    }
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

    enrichEntryLinks(entry);
    const inferredYear = getEntryYear(entry);
    if (!entry.Year && inferredYear) {
      entry.Year = inferredYear;
    }

    const safeName = escapeHtml(entry.Name || "Untitled");
    const safeAuthor = escapeHtml(entry.Author || "Unknown author");
    const normalizedLink = (entry.Link || entry.Goodreads || "#").trim();
    const safeLink = escapeHtml(normalizedLink);
    const coverElementId = `book-cover-${toSafeDomId(target)}-${index}`;
    const pageElementId = `book-pages-${toSafeDomId(target)}-${index}`;
    const yearElementId = `book-year-${toSafeDomId(target)}-${index}`;
    const pageCount = getPageCountLabel(entry);
    const yearValue = getEntryYear(entry);
    const yearText = yearValue ? `${yearValue}` : "";
    const coverMarkup = entry.Image
      ? `<img class="book-image" src="${escapeHtml(entry.Image)}" loading="lazy" alt="${safeName} cover" />`
      : `<span class="cover-fallback">${getFallbackInitial(safeName)}</span>`;

    parent.insertAdjacentHTML(
      "beforeend",
      `
      <a href="${safeLink}" target="_blank" rel="noopener noreferrer" class="hypothesis book responsive w-inline-block">
        <span class="book-rank">${formatRank(index)}</span>
        <span id="${coverElementId}" class="book-cover">${coverMarkup}</span>
        <div class="book-main">
          <h4 class="idea-header book">${safeName}</h4>
          <span class="author" title="${safeAuthor}">${safeAuthor}</span>
          <div class="book-meta">
            <span class="source-pill">${getSourceLabel(normalizedLink)}</span>
            <span id="${yearElementId}" class="page-pill year-pill${yearText ? "" : " is-hidden"}">${yearText}</span>
            <span id="${pageElementId}" class="page-pill">${pageCount}</span>
          </div>
        </div>
        <span class="open-link">Open <img class="link-icon" src="./images/arrow-up-outline.svg" /></span>
      </a>`
    );

    if (!entry.Image || !normalizePositiveInteger(entry.page_count) || !yearValue) {
      void hydrateEntryMetadata(entry, { coverElementId, pageElementId, yearElementId });
    }
  };

  const buildEntryLookup = () => {
    const byName = new Map();
    const extras =
      typeof additional_resources !== "undefined" && Array.isArray(additional_resources)
        ? additional_resources
        : [];
    const allEntries = [...first_entry, ...ml, ...ais, ...scifi, ...extras];

    allEntries.forEach((entry) => {
      enrichEntryLinks(entry);
      const inferredYear = getEntryYear(entry);
      if (!entry.Year && inferredYear) {
        entry.Year = inferredYear;
      }
      if (entry && entry.Name && !byName.has(entry.Name)) {
        byName.set(entry.Name, entry);
      }
    });

    return byName;
  };

  const renderAllBooks = () => {
    const entryLookup = buildEntryLookup();
    const categoryTargets = [
      { key: "entry_point", parentId: "entry-point-parent" },
      { key: "canon", parentId: "canon-parent" },
      { key: "problem_space", parentId: "problem-space-parent" },
      { key: "technical_frontier", parentId: "technical-frontier-parent" },
      { key: "speculative_fiction", parentId: "speculative-fiction-parent" },
    ];

    categoryTargets.forEach(({ key, parentId }) => {
      const selectedEntries = (categoryBookNames[key] || [])
        .map((name) => entryLookup.get(name))
        .filter(Boolean);

      selectedEntries.forEach((entry, index) => {
        renderBook(entry, parentId, index);
      });
      renderBook(null, parentId, selectedEntries.length);
    });
  };

  const suggestionForm = document.getElementById("book-suggestion-form");
  const suggestionFeedback = document.getElementById("suggestion-feedback");
  const suggestionSubmitButton = suggestionForm
    ? suggestionForm.querySelector('button[type="submit"]')
    : null;

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
      track: (formData.get("track") || "entry_point").toString(),
    };
  };

  const hasPlaceholder = (value = "") =>
    value.toString().includes("REPLACE_WITH_FORM_ID");

  const isHttpsUrl = (value = "") => /^https:\/\/.+/i.test(value.toString());

  const isEntryField = (value = "") =>
    /^entry\.\d+$/.test(value.toString());

  const isAppsScriptConfigured = () =>
    isHttpsUrl(submissionConfig.appsScript.endpointUrl) &&
    !hasPlaceholder(submissionConfig.appsScript.endpointUrl);

  const isGoogleFormConfigured = () => {
    const requiredFieldNames = ["name", "author", "link", "pages", "track"];
    const configuredFields = submissionConfig.googleForm.fields || {};

    if (!submissionConfig.googleForm.formResponseUrl || hasPlaceholder(submissionConfig.googleForm.formResponseUrl)) {
      return false;
    }

    if (!submissionConfig.googleForm.formResponseUrl.includes("/formResponse")) {
      return false;
    }

    return requiredFieldNames.every(
      (fieldName) => configuredFields[fieldName] && isEntryField(configuredFields[fieldName])
    );
  };

  const getSubmissionMode = () => {
    const requestedMode = (submissionConfig.mode || "").toLowerCase();

    if (requestedMode === "apps_script" && isAppsScriptConfigured()) {
      return "apps_script";
    }
    if (requestedMode === "google_form" && isGoogleFormConfigured()) {
      return "google_form";
    }
    if (isAppsScriptConfigured()) {
      return "apps_script";
    }
    if (isGoogleFormConfigured()) {
      return "google_form";
    }

    return null;
  };

  const submitSuggestionToGoogleForm = async (data) => {
    const { fields } = submissionConfig.googleForm;
    const payload = new URLSearchParams();
    payload.set(fields.name, data.name);
    payload.set(fields.author, data.author);
    payload.set(fields.link, data.link);
    payload.set(fields.pages, data.pages || "");
    payload.set(fields.track, trackLabels[data.track] || data.track);

    await fetch(submissionConfig.googleForm.formResponseUrl, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: payload.toString(),
    });
  };

  const submitSuggestionToAppsScript = async (data) => {
    const payload = new URLSearchParams();
    const trackLabel = trackLabels[data.track] || data.track;
    // Send common aliases so different Apps Script schemas all receive values.
    payload.set("name", data.name);
    payload.set("title", data.name);
    payload.set("book_title", data.name);
    payload.set("author", data.author);
    payload.set("link", data.link);
    payload.set("pages", data.pages || "");
    payload.set("track_label", trackLabel);
    payload.set("track", trackLabel);
    payload.set("reading_track", trackLabel);
    payload.set("readingTrack", trackLabel);
    payload.set("category", trackLabel);
    payload.set("track_key", data.track || "");
    payload.set("submitted_at", new Date().toISOString());
    payload.set(
      "payload_json",
      JSON.stringify({
        name: data.name,
        title: data.name,
        author: data.author,
        link: data.link,
        pages: data.pages || "",
        track: trackLabel,
        reading_track: trackLabel,
        category: trackLabel,
        track_key: data.track || "",
      })
    );

    await fetch(submissionConfig.appsScript.endpointUrl, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: payload.toString(),
    });
  };

  if (suggestionForm) {
    suggestionForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = getSuggestionValues();
      if (!data || !data.name || !data.author || !data.link) {
        setFeedback("Please fill title, author, and link before submitting.");
        return;
      }

      const submissionMode = getSubmissionMode();
      if (!submissionMode) {
        setFeedback("Suggestion form is not configured yet. Update public/suggestion-form-config.js with a valid endpoint.");
        return;
      }

      try {
        if (suggestionSubmitButton) {
          suggestionSubmitButton.disabled = true;
          suggestionSubmitButton.textContent = "Sending...";
        }

        if (submissionMode === "apps_script") {
          await submitSuggestionToAppsScript(data);
        } else {
          await submitSuggestionToGoogleForm(data);
        }
        suggestionForm.reset();
        setFeedback("Thanks! Your suggestion was sent.");
      } catch (error) {
        setFeedback("Unable to send suggestion right now. Please try again.");
      } finally {
        if (suggestionSubmitButton) {
          suggestionSubmitButton.disabled = false;
          suggestionSubmitButton.textContent = "Send suggestion";
        }
      }
    });
  }

  renderAllBooks();
});
