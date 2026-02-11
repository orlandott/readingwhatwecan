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

  const buildEntryLookup = () => {
    const byName = new Map();
    const extras =
      typeof additional_resources !== "undefined" && Array.isArray(additional_resources)
        ? additional_resources
        : [];
    const allEntries = [...first_entry, ...ml, ...ais, ...scifi, ...extras];

    allEntries.forEach((entry) => {
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

      const desiredCount = Math.max(selectedEntries.length, 20);
      for (let i = 0; i < desiredCount; i += 1) {
        renderBook(selectedEntries[i], parentId, i);
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
