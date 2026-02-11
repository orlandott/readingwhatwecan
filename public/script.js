document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".gauntlet-tab");
  const panes = document.querySelectorAll(".w-tab-pane");
  const ensureArray = (value) => (Array.isArray(value) ? value : []);
  const rawResourceGuardrails = window.RWWC_RESOURCE_GUARDRAILS || {};
  const resourceGuardrails = {
    disabledTitles: ensureArray(rawResourceGuardrails.disabledTitles),
    disabledLinks: ensureArray(rawResourceGuardrails.disabledLinks),
  };

  const sourceLabels = [
    { match: "goodreads.com", label: "Book" },
    { match: "amazon", label: "Book" },
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
  const validTrackKeys = new Set(Object.keys(trackLabels));
  const suggestionFieldLimits = {
    name: 140,
    author: 120,
    email: 160,
    link: 2048,
  };
  const submissionTimeoutMs = 15000;
  const metadataLookupTimeoutMs = 12000;
  const metadataHydrationConcurrency = 6;
  const readingListStorageKey = "rwwc-reading-list-v1";
  const readingProgressLabels = {
    "": "No status",
    to_read: "To read",
    reading: "Reading",
    finished: "Finished",
  };
  const readingProgressOrder = ["to_read", "reading", "finished"];

  const baseCategoryBookNames = {
    entry_point: [
      "The AI Revolution",
      "Preventing an AI-related catastrophe",
      "The Coming Technological Singularity",
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
      "A Brief History of Intelligence",
      "Life 3.0",
      "The Precipice (Chapter on AI)",
      "Rationality: From AI to Zombies",
      "Reframing Superintelligence",
      "The Ethical Algorithm",
      "Army of None: Autonomous Weapons and the Future of War",
      "The Age of Spiritual Machines",
      "Deep Learning",
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
      "I, Robot",
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
  const categoryBookNames = {
    entry_point: [...baseCategoryBookNames.entry_point],
    canon: [...baseCategoryBookNames.canon],
    problem_space: [...baseCategoryBookNames.problem_space],
    technical_frontier: [...baseCategoryBookNames.technical_frontier],
    speculative_fiction: [...baseCategoryBookNames.speculative_fiction],
  };

  const categoryTargets = [
    { key: "entry_point", parentId: "entry-point-parent" },
    { key: "canon", parentId: "canon-parent" },
    { key: "problem_space", parentId: "problem-space-parent" },
    { key: "technical_frontier", parentId: "technical-frontier-parent" },
    { key: "speculative_fiction", parentId: "speculative-fiction-parent" },
  ];

  const knownPublicationYears = {
    "The Coming Technological Singularity": 1994,
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
    "A Brief History of Intelligence": 2024,
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
  const seededEntrySummaries = {
    "The AI Revolution":
      "Tim Urban's long-form primer explains AI capability jumps in plain language and why rapid progress could outpace institutions.",
    "Preventing an AI-related catastrophe":
      "This 80,000 Hours profile maps major AGI risk arguments, key uncertainties, and practical ways newcomers can contribute.",
    "The Coming Technological Singularity":
      "Vinge's classic essay introduces the singularity hypothesis and argues superhuman intelligence could end reliable long-range forecasting.",
    "AGI safety from first principles":
      "Richard Ngo derives alignment difficulty from optimization pressure and generalization limits in modern machine learning.",
    "Machines of Loving Grace":
      "Amodei's essay argues transformative AI could create broad prosperity if development is paired with credible safety and governance.",
    "Situational Awareness":
      "Aschenbrenner outlines near-term scaling dynamics, model capability trajectories, and strategic implications for lab and state actors.",
    "The Most Important Century":
      "Karnofsky argues this era may be uniquely consequential because advanced AI decisions could shape civilization's entire long-term future.",
    "Introduction to AI Safety, Ethics, and Society":
      "Hendrycks' textbook surveys technical failures, governance constraints, and ethical trade-offs in deploying advanced AI systems.",
    "The Risks of Artificial Intelligence":
      "Bill Gates' essay sketches concrete social and safety risks from frontier AI while arguing for measured but proactive mitigation.",
  };

  const seededEntryMetadata = {
    Superintelligence: {
      Image: "https://covers.openlibrary.org/b/id/8039542-L.jpg",
    },
    "The Singularity is Near": {
      Image: "https://covers.openlibrary.org/b/id/400518-L.jpg",
    },
    "The Alignment Problem": {
      Image: "https://covers.openlibrary.org/b/id/10678431-L.jpg",
    },
    "A Brief History of Intelligence": {
      Image: "https://covers.openlibrary.org/b/isbn/9780063286368-L.jpg",
      page_count: 561,
      Year: 2024,
    },
    "Artificial Intelligence: A Guide for Thinking Humans": {
      Image: "https://covers.openlibrary.org/b/isbn/9780374715236-L.jpg",
      page_count: 209,
      Year: 2019,
    },
    "Life 3.0": {
      Image: "https://covers.openlibrary.org/b/id/10239283-L.jpg",
    },
    "The Precipice (Chapter on AI)": {
      Image: "https://covers.openlibrary.org/b/id/9338949-L.jpg",
    },
    "Rationality: From AI to Zombies": {
      Image: "https://books.google.com/books/content?id=9Zlx0WWuTj8C&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
      page_count: 238,
    },
    "Reframing Superintelligence": {
      Image: "https://books.google.com/books/content?id=eRcmrgEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
      page_count: 227,
    },
    "The Ethical Algorithm": {
      Image: "https://covers.openlibrary.org/b/id/14674500-L.jpg",
    },
    "The Age of Em": {
      Image: "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1452923947i/26831944.jpg",
      page_count: 569,
      Year: 2016,
    },
    "Army of None: Autonomous Weapons and the Future of War": {
      Image: "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1529056546i/40180025.jpg",
      page_count: 388,
      Year: 2018,
    },
    "The Age of Spiritual Machines": {
      Image: "https://covers.openlibrary.org/b/id/7343904-L.jpg",
    },
    "Deep Learning": {
      Image: "https://covers.openlibrary.org/b/id/8086288-L.jpg",
    },
    "I, Robot": {
      Image: "https://covers.openlibrary.org/b/id/752299-L.jpg",
    },
    "Gödel, Escher, Bach": {
      Image: "https://covers.openlibrary.org/b/id/14368453-L.jpg",
    },
    "The Beginning of Infinity": {
      Image: "https://covers.openlibrary.org/b/id/8622269-L.jpg",
    },
    "Genius Makers": {
      Image: "https://covers.openlibrary.org/b/id/10708874-L.jpg",
    },
    Cybernetics: {
      Image: "https://covers.openlibrary.org/b/id/14428293-L.jpg",
    },
    "Computing Machinery and Intelligence": {
      Image: "https://covers.openlibrary.org/b/id/14196301-L.jpg",
    },
    "Mind Children": {
      Image: "https://covers.openlibrary.org/b/id/9315107-L.jpg",
    },
    "The Society of Mind": {
      Image: "https://covers.openlibrary.org/b/id/4170566-L.jpg",
    },
    "On Intelligence": {
      Image: "https://covers.openlibrary.org/b/id/8731272-L.jpg",
    },
    "Homo Deus": {
      Image: "https://covers.openlibrary.org/b/id/14421556-L.jpg",
    },
    "Enlightenment Now": {
      Image: "https://covers.openlibrary.org/b/id/8147013-L.jpg",
    },
    "The Fabric of Reality": {
      Image: "https://covers.openlibrary.org/b/id/452204-L.jpg",
    },
    "The Diamond Age": {
      Image: "https://covers.openlibrary.org/b/id/8598269-L.jpg",
    },
    "Snow Crash": {
      Image: "https://covers.openlibrary.org/b/id/392508-L.jpg",
    },
    "Simulation and Simulacra": {
      Image: "https://covers.openlibrary.org/b/id/307858-L.jpg",
    },
    "Finite and Infinite Games": {
      Image: "https://covers.openlibrary.org/b/id/6609213-L.jpg",
    },
    "Complexity: A Guided Tour": {
      Image: "https://covers.openlibrary.org/b/id/6378519-L.jpg",
    },
    "Out of Control": {
      Image: "https://covers.openlibrary.org/b/id/9242841-L.jpg",
    },
    "Whole Earth Discipline": {
      Image: "https://covers.openlibrary.org/b/id/11744008-L.jpg",
    },
    "Profiles of the Future": {
      Image: "https://covers.openlibrary.org/b/id/380579-L.jpg",
    },
    "Klara and the Sun": {
      Image: "https://covers.openlibrary.org/b/id/10648686-L.jpg",
      page_count: 321,
    },
    Excession: {
      Image: "https://covers.openlibrary.org/b/id/5276044-L.jpg",
      page_count: 470,
    },
    "Permutation City": {
      Image: "https://covers.openlibrary.org/b/id/1000639-L.jpg",
      page_count: 290,
    },
    Accelerando: {
      Image: "https://covers.openlibrary.org/b/id/284259-L.jpg",
      page_count: 596,
    },
    "A Closed and Common Orbit": {
      Image: "https://covers.openlibrary.org/b/id/8211950-L.jpg",
      page_count: 303,
    },
    "There Is No Antimemetics Division": {
      Image: "https://covers.openlibrary.org/b/id/11457905-L.jpg",
      page_count: 289,
    },
    Hyperion: {
      Image: "https://covers.openlibrary.org/b/id/380332-L.jpg",
      page_count: 532,
    },
    Daemon: {
      Image: "https://covers.openlibrary.org/b/id/6404884-L.jpg",
      page_count: 482,
    },
    "Avogadro Corp": {
      Image: "https://covers.openlibrary.org/b/id/7246548-L.jpg",
      page_count: 266,
    },
    "Service Model": {
      Image: "https://covers.openlibrary.org/b/id/15061573-L.jpg",
      page_count: 293,
    },
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
        email: "entry.1000000006",
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

  const buildErrorContext = (error) => {
    if (!error) {
      return null;
    }
    const context = {
      name: error.name || "Error",
      message: error.message || "Unknown error",
    };
    if (error.stack) {
      context.stack = error.stack;
    }
    return context;
  };

  const logResilienceWarning = (event, detail = {}, error = null) => {
    if (typeof console === "undefined" || typeof console.warn !== "function") {
      return;
    }
    console.warn(`[RWWC] ${event}`, {
      ...detail,
      error: buildErrorContext(error),
      timestamp: new Date().toISOString(),
    });
  };

  const logResilienceError = (event, detail = {}, error = null) => {
    if (typeof console === "undefined" || typeof console.error !== "function") {
      return;
    }
    console.error(`[RWWC] ${event}`, {
      ...detail,
      error: buildErrorContext(error),
      timestamp: new Date().toISOString(),
    });
  };

  const getSourceLabel = (link = "") => {
    const normalizedLink = link.toLowerCase();
    const found = sourceLabels.find(({ match }) => normalizedLink.includes(match));
    return found ? found.label : "Article";
  };

  const normalizeTypeKey = (value = "") =>
    value
      .toString()
      .toLowerCase()
      .replaceAll(/[^a-z0-9]+/g, "_")
      .replaceAll(/^_+|_+$/g, "");

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

  const isValidHttpUrl = (value = "") => {
    try {
      const url = new URL(value.toString().trim());
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (error) {
      return false;
    }
  };

  const normalizeStringInput = (value = "") =>
    value
      .toString()
      .replaceAll(/[\u0000-\u001F\u007F]+/g, " ")
      .replaceAll(/\s+/g, " ")
      .trim();

  const trimToLimit = (value = "", limit = 255) =>
    normalizeStringInput(value).slice(0, limit);

  const sanitizeSuggestionInput = (rawData) => {
    const pagesValue = trimToLimit(rawData && rawData.pages, 10);
    const normalizedPages = normalizePositiveInteger(pagesValue);
    return {
      name: trimToLimit(rawData && rawData.name, suggestionFieldLimits.name),
      author: trimToLimit(rawData && rawData.author, suggestionFieldLimits.author),
      email: trimToLimit(rawData && rawData.email, suggestionFieldLimits.email).toLowerCase(),
      link: trimToLimit(rawData && rawData.link, suggestionFieldLimits.link),
      pages: normalizedPages ? `${normalizedPages}` : "",
      track: validTrackKeys.has((rawData && rawData.track) || "")
        ? rawData.track
        : "entry_point",
    };
  };

  const isValidEmail = (value = "") =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.toString().trim());

  const validateSuggestionInput = (data = {}) => {
    if (!data.name || !data.author || !data.link) {
      return "Please fill title, author, and link before submitting.";
    }
    if (!isHttpsUrl(data.link) || !isValidHttpUrl(data.link)) {
      return "Please use a valid https:// link.";
    }
    if (data.email && !isValidEmail(data.email)) {
      return "Please provide a valid email or leave it blank.";
    }
    if (data.pages && !normalizePositiveInteger(data.pages)) {
      return "Pages must be a positive whole number.";
    }
    if (normalizePositiveInteger(data.pages) > 5000) {
      return "Pages value looks too high. Please double-check it.";
    }
    return "";
  };

  const sanitizeImageUrl = (value = "") => {
    const normalized = value.toString().trim();
    if (!normalized) {
      return "";
    }
    try {
      const imageUrl = new URL(normalized);
      if (imageUrl.protocol === "http:") {
        imageUrl.protocol = "https:";
      }
      return imageUrl.protocol === "https:" ? imageUrl.toString() : "";
    } catch (error) {
      return "";
    }
  };

  const createTimeoutError = (operationName, timeoutMs) => {
    const timeoutError = new Error(`${operationName} timed out after ${timeoutMs}ms`);
    timeoutError.name = "TimeoutError";
    return timeoutError;
  };

  const fetchWithTimeout = async (url, options = {}, timeoutMs = 10000, operationName = "request") => {
    const controller = new AbortController();
    const timerId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, {
        ...options,
        signal: controller.signal,
      });
    } catch (error) {
      if (error && error.name === "AbortError") {
        throw createTimeoutError(operationName, timeoutMs);
      }
      throw error;
    } finally {
      clearTimeout(timerId);
    }
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
    return pageCount ? `${pageCount} pages` : "";
  };

  const getEntrySummary = (entry) => {
    if (!entry) {
      return "";
    }

    const explicitSummary = (entry.Summary || entry.summary || "").toString().trim();
    if (explicitSummary) {
      return explicitSummary;
    }
    const seededSummary = (seededEntrySummaries[entry.Name] || "").toString().trim();
    if (seededSummary) {
      return seededSummary;
    }

    const link = (entry.Link || entry.Goodreads || "").toString();
    const source = getSourceLabel(link).toLowerCase();
    return `Useful ${source} resource for understanding AI safety risks, alignment strategies, and governance trade-offs.`;
  };

  const applySeededMetadata = (entry) => {
    if (!entry || !entry.Name) {
      return;
    }

    const seed = seededEntryMetadata[entry.Name];
    if (!seed) {
      return;
    }

    if ((!entry.Image || !entry.Image.trim()) && seed.Image) {
      entry.Image = sanitizeImageUrl(seed.Image);
    }
    if (!normalizePositiveInteger(entry.page_count) && normalizePositiveInteger(seed.page_count)) {
      entry.page_count = seed.page_count;
    }
    if (!entry.Year && normalizeYear(seed.Year)) {
      entry.Year = normalizeYear(seed.Year);
    }
  };

  const getEntryPrimaryLink = (entry = {}) =>
    (entry.Link || entry.Goodreads || "").toString().trim();

  const prepareEntryForRender = (entry) => {
    if (!entry) {
      return;
    }
    enrichEntryLinks(entry);
    applySeededMetadata(entry);
    entry.Image = sanitizeImageUrl(entry.Image || "");
    const inferredYear = getEntryYear(entry);
    if (!entry.Year && inferredYear) {
      entry.Year = inferredYear;
    }
  };

  const mergeEntryData = (primaryEntry, secondaryEntry) => {
    if (!primaryEntry || !secondaryEntry) {
      return primaryEntry;
    }

    const mergeableTextFields = ["Author", "Link", "Image", "Summary", "Category", "Goodreads"];
    mergeableTextFields.forEach((field) => {
      const primaryValue = (primaryEntry[field] || "").toString().trim();
      const secondaryValue = (secondaryEntry[field] || "").toString().trim();
      if (!primaryValue && secondaryValue) {
        primaryEntry[field] = secondaryEntry[field];
      }
    });

    if (!normalizePositiveInteger(primaryEntry.page_count) && normalizePositiveInteger(secondaryEntry.page_count)) {
      primaryEntry.page_count = secondaryEntry.page_count;
    }

    if (!getEntryYear(primaryEntry)) {
      const secondaryYear = getEntryYear(secondaryEntry);
      if (secondaryYear) {
        primaryEntry.Year = secondaryYear;
      }
    }

    return primaryEntry;
  };

  const normalizeTitleForLookup = (title = "") =>
    title
      .toString()
      .normalize("NFKD")
      .replaceAll(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replaceAll(/&/g, " and ")
      .replaceAll(/\((18|19|20)\d{2}\)/g, " ")
      .replaceAll(/[^a-z0-9]+/g, " ")
      .trim();

  const titleAliasLookup = {
    "the precipice chapter on ai": "the precipice",
    "general intelligence from ai services": "reframing superintelligence",
    "harry potter and the methods of rationality 1 of 6":
      "harry potter and the methods of rationality",
    "the dark forest 2 of three body problem": "the dark forest",
  };

  const getTitleLookupKey = (title = "") => {
    const normalized = normalizeTitleForLookup(title);
    return titleAliasLookup[normalized] || normalized;
  };

  const isValidProgressStatus = (value = "") =>
    readingProgressOrder.includes(value.toString());

  const getReadingProgressLabel = (value = "") =>
    readingProgressLabels[value] || readingProgressLabels[""];

  const getProgressOptionsMarkup = (selectedValue = "") =>
    [
      `<option value=""${selectedValue ? "" : " selected"}>${readingProgressLabels[""]}</option>`,
      ...readingProgressOrder.map(
        (status) =>
          `<option value="${status}"${selectedValue === status ? " selected" : ""}>${readingProgressLabels[status]}</option>`
      ),
    ].join("");

  const getEntryTypeKey = (entry = {}) =>
    normalizeTypeKey(getSourceLabel(getEntryPrimaryLink(entry)));

  const readingListSummaryElement = document.getElementById("reading-list-summary");
  const readingTrackProgressElement = document.getElementById("reading-track-progress");
  const readingListPreviewElement = document.getElementById("reading-list-preview");
  let latestEntryLookup = new Map();

  const normalizeStoredTimestamp = (value = "") => {
    const timestamp = Date.parse(value.toString());
    return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : new Date().toISOString();
  };

  const normalizeReadingListRecord = (lookupKey, record = {}) => {
    const normalizedStatus = isValidProgressStatus(record.status) ? record.status : "";
    const normalizedYear = normalizeYear(record.year);
    const normalizedLink = isValidHttpUrl(record.link || "") ? record.link.toString().trim() : "";
    const normalizedCategory = validTrackKeys.has((record.category || "").toString())
      ? (record.category || "").toString()
      : "";
    return {
      lookupKey,
      name: trimToLimit(record.name || "", 180),
      author: trimToLimit(record.author || "", 140),
      link: normalizedLink,
      category: normalizedCategory,
      year: normalizedYear || null,
      status: normalizedStatus,
      savedAt: normalizeStoredTimestamp(record.savedAt),
      updatedAt: normalizeStoredTimestamp(record.updatedAt),
    };
  };

  const loadReadingListState = () => {
    try {
      const storedValue = window.localStorage.getItem(readingListStorageKey);
      if (!storedValue) {
        return {};
      }
      const parsed = JSON.parse(storedValue);
      if (!parsed || typeof parsed !== "object") {
        return {};
      }
      const normalizedEntries = {};
      Object.entries(parsed).forEach(([lookupKey, record]) => {
        if (!lookupKey) {
          return;
        }
        normalizedEntries[lookupKey] = normalizeReadingListRecord(lookupKey, record);
      });
      return normalizedEntries;
    } catch (error) {
      logResilienceWarning("reading_list_load_failed", {}, error);
      return {};
    }
  };

  let readingListState = loadReadingListState();

  const persistReadingListState = () => {
    try {
      window.localStorage.setItem(readingListStorageKey, JSON.stringify(readingListState));
    } catch (error) {
      logResilienceWarning("reading_list_persist_failed", {}, error);
    }
  };

  const getReadingListRecord = (lookupKey = "") =>
    (lookupKey && readingListState[lookupKey]) || null;

  const createReadingListRecordFromEntry = (lookupKey, entry, status = "") => {
    const existing = getReadingListRecord(lookupKey);
    const nowIso = new Date().toISOString();
    const linkFromEntry = getEntryPrimaryLink(entry);
    const normalizedLink =
      isValidHttpUrl(linkFromEntry)
        ? linkFromEntry
        : existing && existing.link
          ? existing.link
          : "";
    const normalizedStatus = isValidProgressStatus(status)
      ? status
      : existing && isValidProgressStatus(existing.status)
        ? existing.status
        : "";

    return {
      lookupKey,
      name: trimToLimit(
        (entry && entry.Name) || (existing && existing.name) || "Untitled",
        180
      ),
      author: trimToLimit(
        (entry && entry.Author) || (existing && existing.author) || "",
        140
      ),
      link: normalizedLink,
      category:
        (entry && validTrackKeys.has((entry.Category || "").toString()) && entry.Category) ||
        (existing && existing.category) ||
        "",
      year:
        (entry && getEntryYear(entry)) ||
        (existing && normalizeYear(existing.year)) ||
        null,
      status: normalizedStatus,
      savedAt: (existing && existing.savedAt) || nowIso,
      updatedAt: nowIso,
    };
  };

  const updateReadingListRecord = (lookupKey, entry, status = "") => {
    if (!lookupKey) {
      return;
    }
    const nextRecord = createReadingListRecordFromEntry(lookupKey, entry, status);
    readingListState = {
      ...readingListState,
      [lookupKey]: nextRecord,
    };
    persistReadingListState();
  };

  const removeReadingListRecord = (lookupKey) => {
    if (!lookupKey || !readingListState[lookupKey]) {
      return;
    }
    const nextState = { ...readingListState };
    delete nextState[lookupKey];
    readingListState = nextState;
    persistReadingListState();
  };

  const getSortedReadingListRecords = () =>
    Object.values(readingListState).sort(
      (left, right) => Date.parse(right.updatedAt || "") - Date.parse(left.updatedAt || "")
    );

  const renderReadingDashboard = () => {
    if (!readingListSummaryElement || !readingTrackProgressElement || !readingListPreviewElement) {
      return;
    }

    const records = getSortedReadingListRecords();
    const totalSaved = records.length;
    const totalFinished = records.filter((record) => record.status === "finished").length;
    const completionPercent = totalSaved
      ? Math.round((totalFinished / totalSaved) * 100)
      : 0;
    readingListSummaryElement.textContent = totalSaved
      ? `${totalSaved} saved • ${totalFinished} finished (${completionPercent}% complete)`
      : "Save resources to track progress.";

    const trackProgressMarkup = Object.entries(trackLabels)
      .map(([trackKey, trackLabel]) => {
        const trackRecords = records.filter((record) => record.category === trackKey);
        const trackFinished = trackRecords.filter((record) => record.status === "finished").length;
        const trackPercent = trackRecords.length
          ? Math.round((trackFinished / trackRecords.length) * 100)
          : 0;
        return `
          <div class="track-progress-item">
            <div class="track-progress-top">
              <span class="track-progress-label">${escapeHtml(trackLabel)}</span>
              <span class="track-progress-count">${trackFinished}/${trackRecords.length || 0}</span>
            </div>
            <div class="track-progress-bar">
              <span class="track-progress-fill" style="width:${trackPercent}%"></span>
            </div>
          </div>
        `;
      })
      .join("");
    readingTrackProgressElement.innerHTML = trackProgressMarkup;

    if (!records.length) {
      readingListPreviewElement.innerHTML = `
        <li class="reading-list-empty">
          No saved resources yet. Use the Save button on any resource card.
        </li>
      `;
      return;
    }

    readingListPreviewElement.innerHTML = records
      .slice(0, 10)
      .map((record) => {
        const safeName = escapeHtml(record.name || "Untitled");
        const safeAuthor = escapeHtml(record.author || "Unknown author");
        const safeLink = escapeHtml(record.link || "#");
        const safeLookupKey = escapeHtml(record.lookupKey || "");
        const progressMarkup = getProgressOptionsMarkup(record.status || "");
        return `
          <li class="reading-list-item">
            <div class="reading-list-item-main">
              <a href="${safeLink}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer" class="reading-list-item-link">${safeName}</a>
              <span class="reading-list-item-meta">${safeAuthor}</span>
            </div>
            <div class="reading-list-item-actions">
              <select class="reading-list-status-select" data-dashboard-progress-select="${safeLookupKey}" aria-label="Progress for ${safeName}">
                ${progressMarkup}
              </select>
              <button type="button" class="reading-list-remove" data-reading-remove-key="${safeLookupKey}">
                Remove
              </button>
            </div>
          </li>
        `;
      })
      .join("");
  };
  const disabledTitleKeys = new Set(
    resourceGuardrails.disabledTitles
      .map((title) => getTitleLookupKey(title))
      .filter(Boolean)
  );
  const disabledLinks = new Set(
    resourceGuardrails.disabledLinks
      .map((link) => link.toString().trim())
      .filter(Boolean)
  );

  const isEntryDisabledByGuardrails = (entry, lookupKey = "") => {
    if (!entry) {
      return true;
    }
    if (lookupKey && disabledTitleKeys.has(lookupKey)) {
      return true;
    }
    const entryLink = getEntryPrimaryLink(entry);
    if (!entryLink || !isValidHttpUrl(entryLink)) {
      return true;
    }
    return disabledLinks.has(entryLink);
  };

  const isLikelySearchLink = (link = "") => {
    const normalizedLink = link.toLowerCase();
    return (
      normalizedLink.includes("google.com/search") ||
      normalizedLink.includes("goodreads.com/search")
    );
  };

  const getEntryQualityScore = (entry = {}) => {
    const hasSummary = Boolean((entry.Summary || "").trim());
    const hasImage = Boolean((entry.Image || "").trim());
    const hasPages = Boolean(normalizePositiveInteger(entry.page_count));
    const hasYear = Boolean(getEntryYear(entry));
    const hasCategory = Boolean((entry.Category || "").trim());
    const link = (entry.Link || "").trim();
    const hasStrongLink = Boolean(link) && !isLikelySearchLink(link);

    return (
      (hasSummary ? 8 : 0) +
      (hasImage ? 4 : 0) +
      (hasPages ? 3 : 0) +
      (hasYear ? 2 : 0) +
      (hasStrongLink ? 2 : 0) +
      (hasCategory ? 1 : 0)
    );
  };

  const formatRank = (index) => (index + 1 < 10 ? `0${index + 1}` : `${index + 1}`);

  const getFallbackInitial = (title = "") => {
    const trimmed = title.trim();
    return trimmed.length ? trimmed[0].toUpperCase() : "R";
  };

  const toSafeDomId = (value = "") =>
    value.toString().replaceAll(/[^a-zA-Z0-9_-]/g, "-");

  const wireCoverFallback = (coverElementId, fallbackTitle) => {
    const coverContainer = document.getElementById(coverElementId);
    if (!coverContainer) {
      return;
    }
    const imageElement = coverContainer.querySelector("img.book-image");
    if (!imageElement) {
      return;
    }
    const fallbackInitial = escapeHtml(getFallbackInitial(fallbackTitle));
    imageElement.addEventListener(
      "error",
      () => {
        coverContainer.innerHTML = `<span class="cover-fallback">${fallbackInitial}</span>`;
      },
      { once: true }
    );
  };

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
    let response;
    try {
      response = await fetchWithTimeout(
        queryUrl,
        {},
        metadataLookupTimeoutMs,
        "OpenLibrary metadata lookup"
      );
    } catch (error) {
      logResilienceWarning(
        "openlibrary_lookup_failed",
        { title, author, queryUrl },
        error
      );
      return { coverUrl: "", pageCount: null, year: null };
    }
    if (!response.ok) {
      logResilienceWarning("openlibrary_lookup_unexpected_status", {
        title,
        author,
        status: response.status,
      });
      return { coverUrl: "", pageCount: null, year: null };
    }

    try {
      const payload = await response.json();
      return extractOpenLibraryMetadata(payload);
    } catch (error) {
      logResilienceWarning(
        "openlibrary_payload_parse_failed",
        { title, author },
        error
      );
      return { coverUrl: "", pageCount: null, year: null };
    }
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
    let response;
    try {
      response = await fetchWithTimeout(
        queryUrl,
        {},
        metadataLookupTimeoutMs,
        "Google Books metadata lookup"
      );
    } catch (error) {
      logResilienceWarning(
        "google_books_lookup_failed",
        { title, author, queryUrl },
        error
      );
      return { coverUrl: "", pageCount: null, year: null };
    }
    if (!response.ok) {
      logResilienceWarning("google_books_lookup_unexpected_status", {
        title,
        author,
        status: response.status,
      });
      return { coverUrl: "", pageCount: null, year: null };
    }

    let payload;
    try {
      payload = await response.json();
    } catch (error) {
      logResilienceWarning(
        "google_books_payload_parse_failed",
        { title, author },
        error
      );
      return { coverUrl: "", pageCount: null, year: null };
    }
    const items = payload && Array.isArray(payload.items) ? payload.items : [];
    const bestVolumeInfo = items
      .map((item) => (item ? item.volumeInfo : null))
      .filter(Boolean)
      .sort((left, right) => {
        const score = (volumeInfo) =>
          (volumeInfo.imageLinks ? 2 : 0) +
          (normalizePositiveInteger(volumeInfo.pageCount) ? 2 : 0) +
          (volumeInfo.publishedDate ? 1 : 0);
        return score(right) - score(left);
      })[0];

    if (!bestVolumeInfo) {
      return { coverUrl: "", pageCount: null, year: null };
    }

    const links = bestVolumeInfo.imageLinks || {};
    const coverUrl = sanitizeImageUrl(links.thumbnail || links.smallThumbnail || "");
    const publishedDate = bestVolumeInfo.publishedDate || "";
    const publishedYearMatch = publishedDate.match(/\b(18|19|20)\d{2}\b/);

    return {
      coverUrl,
      pageCount: normalizePositiveInteger(bestVolumeInfo.pageCount),
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
        metadata.coverUrl = sanitizeImageUrl(openLibraryMetadata.coverUrl || "");
        metadata.pageCount = normalizePositiveInteger(openLibraryMetadata.pageCount);
        metadata.year = normalizeYear(openLibraryMetadata.year);

        if (!metadata.coverUrl || !metadata.pageCount || !metadata.year) {
          const googleBooksMetadata = await queryGoogleBooksMetadata(entry);
          if (!metadata.coverUrl) {
            metadata.coverUrl = sanitizeImageUrl(googleBooksMetadata.coverUrl || "");
          }
          if (!metadata.pageCount) {
            metadata.pageCount = normalizePositiveInteger(googleBooksMetadata.pageCount);
          }
          if (!metadata.year) {
            metadata.year = normalizeYear(googleBooksMetadata.year);
          }
        }
      } catch (error) {
        logResilienceWarning(
          "metadata_lookup_failed",
          { name: entry && entry.Name, author: entry && entry.Author },
          error
        );
      }

      entryMetadataCache.set(key, metadata);
      pendingMetadataLookups.delete(key);
      return metadata;
    })();

    pendingMetadataLookups.set(key, pendingLookup);
    return pendingLookup;
  };

  const hydrateEntryMetadata = async (entry, ids) => {
    try {
      if (!entry) {
        return;
      }

      if (entry.Image && normalizePositiveInteger(entry.page_count) && getEntryYear(entry)) {
        return;
      }

      const metadata = await fetchEntryMetadata(entry);

      const safeCoverUrl = sanitizeImageUrl(metadata.coverUrl);

      if (!entry.Image && safeCoverUrl) {
        entry.Image = safeCoverUrl;
        const coverElement = document.getElementById(ids.coverElementId);
        if (coverElement) {
          const safeAlt = escapeHtml(`${entry.Name || "Book"} cover`);
          coverElement.innerHTML = `<img class="book-image" src="${escapeHtml(safeCoverUrl)}" loading="lazy" alt="${safeAlt}" />`;
        }
        wireCoverFallback(ids.coverElementId, entry.Name || "Book");
      }

      if (!normalizePositiveInteger(entry.page_count) && metadata.pageCount) {
        entry.page_count = metadata.pageCount;
        const pageElement = document.getElementById(ids.pageElementId);
        if (pageElement) {
          pageElement.textContent = `${metadata.pageCount} pages`;
          pageElement.classList.remove("is-hidden");
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
    } catch (error) {
      // Keep rendering resilient even when metadata providers fail.
      logResilienceWarning(
        "metadata_hydration_skipped_for_entry",
        { name: entry && entry.Name },
        error
      );
    }
  };

  const metadataHydrationQueue = [];
  const queuedMetadataHydrationKeys = new Set();
  let activeMetadataHydrations = 0;

  const getMetadataHydrationTaskKey = (ids = {}) =>
    `${ids.coverElementId || ""}|${ids.pageElementId || ""}|${ids.yearElementId || ""}`;

  const drainMetadataHydrationQueue = () => {
    while (
      activeMetadataHydrations < metadataHydrationConcurrency &&
      metadataHydrationQueue.length
    ) {
      const nextTask = metadataHydrationQueue.shift();
      if (!nextTask) {
        continue;
      }
      activeMetadataHydrations += 1;
      void hydrateEntryMetadata(nextTask.entry, nextTask.ids)
        .catch((error) => {
          logResilienceWarning(
            "metadata_hydration_queue_task_failed",
            { name: nextTask.entry && nextTask.entry.Name },
            error
          );
        })
        .finally(() => {
          activeMetadataHydrations = Math.max(0, activeMetadataHydrations - 1);
          queuedMetadataHydrationKeys.delete(nextTask.taskKey);
          drainMetadataHydrationQueue();
        });
    }
  };

  const queueMetadataHydration = (entry, ids) => {
    if (!ids || !ids.coverElementId || !ids.pageElementId || !ids.yearElementId) {
      return;
    }
    const taskKey = getMetadataHydrationTaskKey(ids);
    if (queuedMetadataHydrationKeys.has(taskKey)) {
      return;
    }
    queuedMetadataHydrationKeys.add(taskKey);
    metadataHydrationQueue.push({ entry, ids, taskKey });
    drainMetadataHydrationQueue();
  };

  const renderSuggestionCard = (parent, index) => {
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
  };

  const renderBook = (entry, target, index) => {
    try {
      const parent = document.getElementById(target);
      if (!parent) {
        return;
      }

      if (!entry) {
        renderSuggestionCard(parent, index);
        return;
      }

      prepareEntryForRender(entry);

      const normalizedLink = getEntryPrimaryLink(entry);
      if (!isValidHttpUrl(normalizedLink)) {
        return;
      }

      const safeName = escapeHtml(entry.Name || "Untitled");
      const safeAuthor = escapeHtml(entry.Author || "Unknown author");
      const safeSummary = escapeHtml(getEntrySummary(entry));
      const summaryMarkup = safeSummary
        ? `<p class="resource-summary" title="${safeSummary}">${safeSummary}</p>`
        : "";
      const safeLink = escapeHtml(normalizedLink);
      const safeImageUrl = sanitizeImageUrl(entry.Image || "");
      if (entry.Image !== safeImageUrl) {
        entry.Image = safeImageUrl;
      }
      const lookupKey = getTitleLookupKey(entry.Name || "");
      if (!lookupKey) {
        return;
      }
      const safeLookupKey = escapeHtml(lookupKey);
      const readingRecord = getReadingListRecord(lookupKey);
      const isSaved = Boolean(readingRecord);
      const progressValue = readingRecord && isValidProgressStatus(readingRecord.status)
        ? readingRecord.status
        : "";
      const progressOptionsMarkup = getProgressOptionsMarkup(progressValue);
      const entryDomKey = toSafeDomId(
        `${entry.Name || "untitled"}-${entry.Author || "unknown"}`
      );
      const coverElementId = `book-cover-${toSafeDomId(target)}-${entryDomKey}`;
      const pageElementId = `book-pages-${toSafeDomId(target)}-${entryDomKey}`;
      const yearElementId = `book-year-${toSafeDomId(target)}-${entryDomKey}`;
      const statusElementId = `book-status-${toSafeDomId(target)}-${entryDomKey}`;
      const pageCountText = getPageCountLabel(entry);
      const yearValue = getEntryYear(entry);
      const yearText = yearValue ? `${yearValue}` : "";
      const coverMarkup = safeImageUrl
        ? `<img class="book-image" src="${escapeHtml(safeImageUrl)}" loading="lazy" alt="${safeName} cover" />`
        : `<span class="cover-fallback">${getFallbackInitial(entry.Name || "")}</span>`;

      parent.insertAdjacentHTML(
        "beforeend",
        `
        <article class="hypothesis book resource-card responsive w-inline-block${isSaved ? " is-saved" : ""}" data-lookup-key="${safeLookupKey}">
          <span class="book-rank">${formatRank(index)}</span>
          <span id="${coverElementId}" class="book-cover">${coverMarkup}</span>
          <div class="book-main">
            <h4 class="idea-header book">${safeName}</h4>
            <span class="author" title="${safeAuthor}">${safeAuthor}</span>
            ${summaryMarkup}
            <div class="book-meta">
              <span class="source-pill">${getSourceLabel(normalizedLink)}</span>
              <span id="${statusElementId}" class="page-pill status-pill${progressValue ? "" : " is-hidden"}">${escapeHtml(getReadingProgressLabel(progressValue))}</span>
              <span id="${yearElementId}" class="page-pill year-pill${yearText ? "" : " is-hidden"}">${yearText}</span>
              <span id="${pageElementId}" class="page-pill${pageCountText ? "" : " is-hidden"}">${pageCountText}</span>
            </div>
            <div class="resource-actions">
              <button type="button" class="resource-save-button${isSaved ? " is-saved" : ""}" data-save-toggle="${safeLookupKey}" aria-pressed="${isSaved ? "true" : "false"}">
                ${isSaved ? "Saved" : "Save"}
              </button>
              <select class="resource-progress-select" data-progress-select="${safeLookupKey}" aria-label="Reading progress for ${safeName}">
                ${progressOptionsMarkup}
              </select>
            </div>
          </div>
          <a href="${safeLink}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer" class="open-link resource-open-link">Open <img class="link-icon" src="./images/arrow-up-outline.svg" /></a>
        </article>`
      );
      wireCoverFallback(coverElementId, entry.Name || "Book");

      if (!entry.Image || !normalizePositiveInteger(entry.page_count) || !yearValue) {
        queueMetadataHydration(entry, { coverElementId, pageElementId, yearElementId });
      }
    } catch (error) {
      logResilienceWarning(
        "entry_render_skipped_due_error",
        { name: entry && entry.Name },
        error
      );
    }
  };

  const applyReadingRecordToCardElement = (cardElement, record) => {
    if (!cardElement) {
      return;
    }
    const isSaved = Boolean(record);
    cardElement.classList.toggle("is-saved", isSaved);

    const saveButton = cardElement.querySelector("[data-save-toggle]");
    if (saveButton) {
      saveButton.textContent = isSaved ? "Saved" : "Save";
      saveButton.classList.toggle("is-saved", isSaved);
      saveButton.setAttribute("aria-pressed", isSaved ? "true" : "false");
    }

    const progressSelect = cardElement.querySelector("[data-progress-select]");
    if (progressSelect) {
      const nextProgressValue =
        record && isValidProgressStatus(record.status) ? record.status : "";
      progressSelect.value = nextProgressValue;
    }

    const statusPill = cardElement.querySelector(".status-pill");
    if (statusPill) {
      const nextStatus =
        record && isValidProgressStatus(record.status) ? record.status : "";
      statusPill.textContent = getReadingProgressLabel(nextStatus);
      statusPill.classList.toggle("is-hidden", !nextStatus);
    }
  };

  const syncReadingRecordToRenderedCards = (lookupKey) => {
    if (!lookupKey) {
      return;
    }
    const record = getReadingListRecord(lookupKey);
    const cards = document.querySelectorAll(".resource-card[data-lookup-key]");
    cards.forEach((card) => {
      if (card && card.getAttribute("data-lookup-key") === lookupKey) {
        applyReadingRecordToCardElement(card, record);
      }
    });
  };

  const getEntryByLookupKey = (lookupKey) =>
    (lookupKey && latestEntryLookup && latestEntryLookup.get(lookupKey)) || null;

  const toggleReadingListRecord = (lookupKey) => {
    if (!lookupKey) {
      return;
    }
    const existingRecord = getReadingListRecord(lookupKey);
    if (existingRecord) {
      removeReadingListRecord(lookupKey);
      syncReadingRecordToRenderedCards(lookupKey);
      renderReadingDashboard();
      return;
    }

    const entry = getEntryByLookupKey(lookupKey);
    if (!entry) {
      logResilienceWarning("reading_list_add_missing_entry", { lookupKey });
      return;
    }
    updateReadingListRecord(lookupKey, entry, "to_read");
    syncReadingRecordToRenderedCards(lookupKey);
    renderReadingDashboard();
  };

  const updateReadingProgress = (lookupKey, statusValue = "") => {
    if (!lookupKey) {
      return;
    }
    const normalizedStatus = isValidProgressStatus(statusValue) ? statusValue : "";
    const existingRecord = getReadingListRecord(lookupKey);
    const entry = getEntryByLookupKey(lookupKey);

    if (!existingRecord && !entry) {
      logResilienceWarning("reading_progress_update_missing_entry", {
        lookupKey,
        statusValue: normalizedStatus,
      });
      return;
    }

    updateReadingListRecord(lookupKey, entry || existingRecord, normalizedStatus);
    syncReadingRecordToRenderedCards(lookupKey);
    renderReadingDashboard();
  };

  const buildEntryLookup = () => {
    const byLookupKey = new Map();
    const primaryEntries =
      typeof first_entry !== "undefined" && Array.isArray(first_entry) ? first_entry : [];
    const mlEntries = typeof ml !== "undefined" && Array.isArray(ml) ? ml : [];
    const aisEntries = typeof ais !== "undefined" && Array.isArray(ais) ? ais : [];
    const scifiEntries =
      typeof scifi !== "undefined" && Array.isArray(scifi) ? scifi : [];
    const extras =
      typeof additional_resources !== "undefined" && Array.isArray(additional_resources)
        ? additional_resources
        : [];
    const categorizedAdditions =
      typeof categorized_resources !== "undefined" && Array.isArray(categorized_resources)
        ? categorized_resources
        : [];
    const allEntries = [
      ...primaryEntries,
      ...mlEntries,
      ...aisEntries,
      ...scifiEntries,
      ...extras,
      ...categorizedAdditions,
    ];
    if (!allEntries.length) {
      logResilienceError("resource_dataset_unavailable", {
        hasPrimaryEntries: primaryEntries.length > 0,
        hasMlEntries: mlEntries.length > 0,
        hasAisEntries: aisEntries.length > 0,
        hasScifiEntries: scifiEntries.length > 0,
      });
    }
    const categoryKeysFromData = {
      entry_point: new Set(),
      canon: new Set(),
      problem_space: new Set(),
      technical_frontier: new Set(),
      speculative_fiction: new Set(),
    };

    allEntries.forEach((entry) => {
      try {
        if (!entry || !entry.Name) {
          return;
        }

        prepareEntryForRender(entry);
        const lookupKey = getTitleLookupKey(entry.Name);
        if (!lookupKey || isEntryDisabledByGuardrails(entry, lookupKey)) {
          return;
        }

        if (!byLookupKey.has(lookupKey)) {
          byLookupKey.set(lookupKey, entry);
        } else {
          const existingEntry = byLookupKey.get(lookupKey);
          if (existingEntry) {
            const shouldSwapPrimary =
              getEntryQualityScore(entry) > getEntryQualityScore(existingEntry);
            const primaryEntry = shouldSwapPrimary ? entry : existingEntry;
            const secondaryEntry = shouldSwapPrimary ? existingEntry : entry;

            byLookupKey.set(lookupKey, mergeEntryData(primaryEntry, secondaryEntry));
          }
        }

        const categoryKey = (entry.Category || "").toString();
        if (categoryKeysFromData[categoryKey]) {
          categoryKeysFromData[categoryKey].add(lookupKey);
        }
      } catch (error) {
        logResilienceWarning(
          "entry_data_skipped_due_error",
          { name: entry && entry.Name },
          error
        );
      }
    });

    return { byLookupKey, categoryKeysFromData };
  };

  const sortControl = document.getElementById("category-sort-control");
  const typeControl = document.getElementById("category-type-control");
  const yearFromControl = document.getElementById("category-year-from-control");
  const yearToControl = document.getElementById("category-year-to-control");
  const filterResetButton = document.getElementById("category-filter-reset");

  const getSortMode = () => (sortControl && sortControl.value) || "curated";

  const getFilterState = () => {
    const typeFilter = normalizeTypeKey((typeControl && typeControl.value) || "all") || "all";
    let fromYear = normalizeYear((yearFromControl && yearFromControl.value) || "");
    let toYear = normalizeYear((yearToControl && yearToControl.value) || "");
    if (fromYear && toYear && fromYear > toYear) {
      [fromYear, toYear] = [toYear, fromYear];
      if (yearFromControl && yearToControl) {
        yearFromControl.value = `${fromYear}`;
        yearToControl.value = `${toYear}`;
      }
    }
    return {
      typeFilter,
      fromYear,
      toYear,
    };
  };

  const hasActiveFilters = (filters) =>
    Boolean(
      filters &&
      (filters.typeFilter !== "all" || filters.fromYear || filters.toYear)
    );

  const updateYearSelectOptions = (control, years = []) => {
    if (!control) {
      return;
    }
    const currentValue = normalizeYear(control.value);
    const optionsMarkup = [
      '<option value="">Any</option>',
      ...years.map((year) => `<option value="${year}">${year}</option>`),
    ].join("");
    control.innerHTML = optionsMarkup;
    if (currentValue && years.includes(currentValue)) {
      control.value = `${currentValue}`;
    }
  };

  const syncYearFilterControls = (entryLookup = new Map()) => {
    const years = [...entryLookup.values()]
      .map((entry) => getEntryYear(entry))
      .filter((year) => Number.isFinite(year))
      .filter((year, index, values) => values.indexOf(year) === index)
      .sort((left, right) => left - right);
    updateYearSelectOptions(yearFromControl, years);
    updateYearSelectOptions(yearToControl, years);
  };

  const entryMatchesFilters = (entry, filters) => {
    if (!entry) {
      return false;
    }
    const entryType = getEntryTypeKey(entry);
    if (filters.typeFilter !== "all" && entryType !== filters.typeFilter) {
      return false;
    }
    if (!filters.fromYear && !filters.toYear) {
      return true;
    }
    const entryYear = getEntryYear(entry);
    if (!entryYear) {
      return false;
    }
    if (filters.fromYear && entryYear < filters.fromYear) {
      return false;
    }
    if (filters.toYear && entryYear > filters.toYear) {
      return false;
    }
    return true;
  };

  const compareEntriesByYearAsc = (left, right) => {
    const leftYear = getEntryYear(left);
    const rightYear = getEntryYear(right);
    const leftHasYear = Number.isFinite(leftYear);
    const rightHasYear = Number.isFinite(rightYear);

    if (leftHasYear && rightHasYear) {
      if (leftYear !== rightYear) {
        return leftYear - rightYear;
      }
    } else if (leftHasYear) {
      return -1;
    } else if (rightHasYear) {
      return 1;
    }

    return (left.Name || "").localeCompare(right.Name || "");
  };

  const sortSelectedEntries = (entries, sortMode) => {
    if (sortMode === "year_desc") {
      return [...entries].sort((left, right) => compareEntriesByYearAsc(right, left));
    }
    if (sortMode === "year_asc") {
      return [...entries].sort(compareEntriesByYearAsc);
    }
    if (sortMode === "title_asc") {
      return [...entries].sort((left, right) =>
        (left.Name || "").localeCompare(right.Name || "")
      );
    }
    return entries;
  };

  const renderCategoryFallbackState = (
    parent,
    title = "Resources temporarily unavailable",
    copy = "We could not load this category right now. Please refresh, or suggest a resource below."
  ) => {
    if (!parent) {
      return;
    }
    parent.insertAdjacentHTML(
      "beforeend",
      `
      <article class="resource-empty-state" role="status" aria-live="polite">
        <h4 class="resource-empty-state-title">${escapeHtml(title)}</h4>
        <p class="resource-empty-state-copy">${escapeHtml(copy)}</p>
      </article>
      `
    );
  };

  const renderAllBooks = () => {
    let entryLookup;
    let categoryKeysFromData;
    try {
      const lookupResult = buildEntryLookup();
      entryLookup = lookupResult.byLookupKey;
      categoryKeysFromData = lookupResult.categoryKeysFromData;
      latestEntryLookup = entryLookup;
      syncYearFilterControls(entryLookup);
    } catch (error) {
      logResilienceError("resource_lookup_build_failed", {}, error);
      categoryTargets.forEach(({ parentId }) => {
        const categoryParent = document.getElementById(parentId);
        if (!categoryParent) {
          return;
        }
        categoryParent.innerHTML = "";
        renderCategoryFallbackState(categoryParent);
        renderBook(null, parentId, 0);
      });
      return;
    }
    renderReadingDashboard();
    const sortMode = getSortMode();
    const filterState = getFilterState();
    const usingFilters = hasActiveFilters(filterState);

    categoryTargets.forEach(({ key, parentId }) => {
      try {
        const categoryParent = document.getElementById(parentId);
        if (!categoryParent) {
          return;
        }
        categoryParent.innerHTML = "";

        const selectedLookupKeys = new Set();
        (categoryBookNames[key] || []).forEach((name) => {
          const lookupKey = getTitleLookupKey(name);
          if (lookupKey) {
            selectedLookupKeys.add(lookupKey);
          }
        });
        (categoryKeysFromData[key] || new Set()).forEach((lookupKey) => {
          if (lookupKey) {
            selectedLookupKeys.add(lookupKey);
          }
        });

        const selectedEntries = [...selectedLookupKeys]
          .map((lookupKey) => entryLookup.get(lookupKey))
          .filter(Boolean);
        const filteredEntries = selectedEntries.filter((entry) =>
          entryMatchesFilters(entry, filterState)
        );

        const orderedEntries = sortSelectedEntries(filteredEntries, sortMode);

        if (!orderedEntries.length) {
          if (usingFilters) {
            renderCategoryFallbackState(
              categoryParent,
              "No resources match your filters",
              "Try resetting type/year filters to broaden results."
            );
          } else {
            renderCategoryFallbackState(categoryParent);
          }
        } else {
          orderedEntries.forEach((entry, index) => {
            renderBook(entry, parentId, index);
          });
        }
        renderBook(null, parentId, orderedEntries.length);
      } catch (error) {
        logResilienceWarning(
          "category_render_skipped_due_error",
          { categoryKey: key },
          error
        );
      }
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
      email: (formData.get("email") || "").toString().trim(),
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
    if (fields.email && isEntryField(fields.email) && data.email) {
      payload.set(fields.email, data.email);
    }
    payload.set(fields.link, data.link);
    payload.set(fields.pages, data.pages || "");
    payload.set(fields.track, trackLabels[data.track] || data.track);

    try {
      await fetchWithTimeout(
        submissionConfig.googleForm.formResponseUrl,
        {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
          body: payload.toString(),
        },
        submissionTimeoutMs,
        "Google Form suggestion submission"
      );
    } catch (error) {
      logResilienceError(
        "google_form_submission_failed",
        {
          track: data.track,
          hasEmail: Boolean(data.email),
        },
        error
      );
      throw error;
    }
  };

  const submitSuggestionToAppsScript = async (data) => {
    const payload = new URLSearchParams();
    const trackLabel = trackLabels[data.track] || data.track;
    // Send common aliases so different Apps Script schemas all receive values.
    payload.set("name", data.name);
    payload.set("title", data.name);
    payload.set("book_title", data.name);
    payload.set("author", data.author);
    payload.set("email", data.email || "");
    payload.set("submitter_email", data.email || "");
    payload.set("contact_email", data.email || "");
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
        email: data.email || "",
        link: data.link,
        pages: data.pages || "",
        track: trackLabel,
        reading_track: trackLabel,
        category: trackLabel,
        track_key: data.track || "",
      })
    );

    try {
      await fetchWithTimeout(
        submissionConfig.appsScript.endpointUrl,
        {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
          body: payload.toString(),
        },
        submissionTimeoutMs,
        "Apps Script suggestion submission"
      );
    } catch (error) {
      logResilienceError(
        "apps_script_submission_failed",
        {
          track: data.track,
          hasEmail: Boolean(data.email),
        },
        error
      );
      throw error;
    }
  };

  if (suggestionForm) {
    suggestionForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const rawData = getSuggestionValues();
      const data = sanitizeSuggestionInput(rawData);
      const validationError = validateSuggestionInput(data);
      if (validationError) {
        setFeedback(validationError);
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
        logResilienceWarning(
          "suggestion_submission_failed",
          {
            mode: submissionMode,
            track: data.track,
          },
          error
        );
        setFeedback("Unable to send suggestion right now. Please try again.");
      } finally {
        if (suggestionSubmitButton) {
          suggestionSubmitButton.disabled = false;
          suggestionSubmitButton.textContent = "Send suggestion";
        }
      }
    });
  }

  if (sortControl) {
    sortControl.addEventListener("change", () => {
      renderAllBooks();
    });
  }

  if (typeControl) {
    typeControl.addEventListener("change", () => {
      renderAllBooks();
    });
  }

  if (yearFromControl) {
    yearFromControl.addEventListener("change", () => {
      renderAllBooks();
    });
  }

  if (yearToControl) {
    yearToControl.addEventListener("change", () => {
      renderAllBooks();
    });
  }

  if (filterResetButton) {
    filterResetButton.addEventListener("click", () => {
      if (typeControl) {
        typeControl.value = "all";
      }
      if (yearFromControl) {
        yearFromControl.value = "";
      }
      if (yearToControl) {
        yearToControl.value = "";
      }
      renderAllBooks();
    });
  }

  document.addEventListener("click", (event) => {
    const clickTarget = event.target;
    if (!clickTarget || typeof clickTarget.closest !== "function") {
      return;
    }

    const saveToggleButton = clickTarget.closest("[data-save-toggle]");
    if (saveToggleButton) {
      event.preventDefault();
      const lookupKey = (saveToggleButton.getAttribute("data-save-toggle") || "").trim();
      if (lookupKey) {
        toggleReadingListRecord(lookupKey);
      }
      return;
    }

    const removeButton = clickTarget.closest("[data-reading-remove-key]");
    if (removeButton) {
      event.preventDefault();
      const lookupKey = (removeButton.getAttribute("data-reading-remove-key") || "").trim();
      if (lookupKey) {
        removeReadingListRecord(lookupKey);
        syncReadingRecordToRenderedCards(lookupKey);
        renderReadingDashboard();
      }
    }
  });

  document.addEventListener("change", (event) => {
    const changeTarget = event.target;
    if (!changeTarget || typeof changeTarget.matches !== "function") {
      return;
    }

    if (changeTarget.matches("[data-progress-select]")) {
      const lookupKey = (changeTarget.getAttribute("data-progress-select") || "").trim();
      if (lookupKey) {
        updateReadingProgress(lookupKey, changeTarget.value || "");
      }
      return;
    }

    if (changeTarget.matches("[data-dashboard-progress-select]")) {
      const lookupKey = (changeTarget.getAttribute("data-dashboard-progress-select") || "").trim();
      if (lookupKey) {
        updateReadingProgress(lookupKey, changeTarget.value || "");
      }
    }
  });

  renderAllBooks();
});
