document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".gauntlet-tab");
  const panes = document.querySelectorAll(".w-tab-pane");

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
      entry.Image = seed.Image;
    }
    if (!normalizePositiveInteger(entry.page_count) && normalizePositiveInteger(seed.page_count)) {
      entry.page_count = seed.page_count;
    }
    if (!entry.Year && normalizeYear(seed.Year)) {
      entry.Year = normalizeYear(seed.Year);
    }
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
    const coverUrl = links.thumbnail || links.smallThumbnail || "";
    const publishedDate = bestVolumeInfo.publishedDate || "";
    const publishedYearMatch = publishedDate.match(/\b(18|19|20)\d{2}\b/);

    return {
      coverUrl: coverUrl ? coverUrl.replace("http://", "https://") : "",
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
      wireCoverFallback(ids.coverElementId, entry.Name || "Book");
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
    applySeededMetadata(entry);
    const inferredYear = getEntryYear(entry);
    if (!entry.Year && inferredYear) {
      entry.Year = inferredYear;
    }

    const safeName = escapeHtml(entry.Name || "Untitled");
    const safeAuthor = escapeHtml(entry.Author || "Unknown author");
    const safeSummary = escapeHtml(getEntrySummary(entry));
    const summaryMarkup = safeSummary
      ? `<p class="resource-summary" title="${safeSummary}">${safeSummary}</p>`
      : "";
    const normalizedLink = (entry.Link || entry.Goodreads || "#").trim();
    const safeLink = escapeHtml(normalizedLink);
    const entryDomKey = toSafeDomId(
      `${entry.Name || "untitled"}-${entry.Author || "unknown"}`
    );
    const coverElementId = `book-cover-${toSafeDomId(target)}-${entryDomKey}`;
    const pageElementId = `book-pages-${toSafeDomId(target)}-${entryDomKey}`;
    const yearElementId = `book-year-${toSafeDomId(target)}-${entryDomKey}`;
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
          ${summaryMarkup}
          <div class="book-meta">
            <span class="source-pill">${getSourceLabel(normalizedLink)}</span>
            <span id="${yearElementId}" class="page-pill year-pill${yearText ? "" : " is-hidden"}">${yearText}</span>
            <span id="${pageElementId}" class="page-pill">${pageCount}</span>
          </div>
        </div>
        <span class="open-link">Open <img class="link-icon" src="./images/arrow-up-outline.svg" /></span>
      </a>`
    );
    wireCoverFallback(coverElementId, entry.Name || "Book");

    if (!entry.Image || !normalizePositiveInteger(entry.page_count) || !yearValue) {
      void hydrateEntryMetadata(entry, { coverElementId, pageElementId, yearElementId });
    }
  };

  const buildEntryLookup = () => {
    const byLookupKey = new Map();
    const extras =
      typeof additional_resources !== "undefined" && Array.isArray(additional_resources)
        ? additional_resources
        : [];
    const categorizedAdditions =
      typeof categorized_resources !== "undefined" && Array.isArray(categorized_resources)
        ? categorized_resources
        : [];
    const allEntries = [...first_entry, ...ml, ...ais, ...scifi, ...extras, ...categorizedAdditions];
    const categoryKeysFromData = {
      entry_point: new Set(),
      canon: new Set(),
      problem_space: new Set(),
      technical_frontier: new Set(),
      speculative_fiction: new Set(),
    };

    allEntries.forEach((entry) => {
      if (!entry || !entry.Name) {
        return;
      }

      enrichEntryLinks(entry);
      applySeededMetadata(entry);
      const inferredYear = getEntryYear(entry);
      if (!entry.Year && inferredYear) {
        entry.Year = inferredYear;
      }
      const lookupKey = getTitleLookupKey(entry.Name);
      if (!lookupKey) {
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

          if (!primaryEntry.Author && secondaryEntry.Author) {
            primaryEntry.Author = secondaryEntry.Author;
          }
          if ((!primaryEntry.Link || !primaryEntry.Link.trim()) && secondaryEntry.Link) {
            primaryEntry.Link = secondaryEntry.Link;
          }
          if ((!primaryEntry.Image || !primaryEntry.Image.trim()) && secondaryEntry.Image) {
            primaryEntry.Image = secondaryEntry.Image;
          }
          if (!normalizePositiveInteger(primaryEntry.page_count) && normalizePositiveInteger(secondaryEntry.page_count)) {
            primaryEntry.page_count = secondaryEntry.page_count;
          }
          if (!primaryEntry.Year && secondaryEntry.Year) {
            primaryEntry.Year = secondaryEntry.Year;
          }
          if ((!primaryEntry.Summary || !primaryEntry.Summary.trim()) && secondaryEntry.Summary) {
            primaryEntry.Summary = secondaryEntry.Summary;
          }
          if (!primaryEntry.Category && secondaryEntry.Category) {
            primaryEntry.Category = secondaryEntry.Category;
          }
          if (!primaryEntry.Goodreads && secondaryEntry.Goodreads) {
            primaryEntry.Goodreads = secondaryEntry.Goodreads;
          }

          byLookupKey.set(lookupKey, primaryEntry);
        }
      }

      const categoryKey = (entry.Category || "").toString();
      if (categoryKeysFromData[categoryKey]) {
        categoryKeysFromData[categoryKey].add(lookupKey);
      }
    });

    return { byLookupKey, categoryKeysFromData };
  };

  const sortControl = document.getElementById("category-sort-control");

  const getSortMode = () => (sortControl && sortControl.value) || "curated";

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

  const renderAllBooks = () => {
    const { byLookupKey: entryLookup, categoryKeysFromData } = buildEntryLookup();
    const sortMode = getSortMode();

    categoryTargets.forEach(({ key, parentId }) => {
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

      const orderedEntries = sortSelectedEntries(selectedEntries, sortMode);

      orderedEntries.forEach((entry, index) => {
        renderBook(entry, parentId, index);
      });
      renderBook(null, parentId, orderedEntries.length);
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

  if (sortControl) {
    sortControl.addEventListener("change", () => {
      renderAllBooks();
    });
  }

  renderAllBooks();
});
