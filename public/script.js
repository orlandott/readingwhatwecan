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

  const renderAllBooks = () => {
    for (let i = 0; i < 20; i += 1) {
      renderBook(first_entry[i], "beginner-parent", i);
      renderBook(ml[i], "ml-parent", i);
      renderBook(ais[i], "aisafety-parent", i);
      renderBook(scifi[i], "scifi-parent", i);
    }
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
      track: (formData.get("track") || "first_entry").toString(),
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
    payload.set("name", data.name);
    payload.set("author", data.author);
    payload.set("link", data.link);
    payload.set("pages", data.pages || "");
    payload.set("track", trackLabel);
    payload.set("track_key", data.track || "");
    payload.set("submitted_at", new Date().toISOString());
    payload.set(
      "payload_json",
      JSON.stringify({
        name: data.name,
        author: data.author,
        link: data.link,
        pages: data.pages || "",
        track: trackLabel,
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
