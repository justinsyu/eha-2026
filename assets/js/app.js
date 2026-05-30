const DATA_URL = "assets/data/presentations-index.json?v=eha-2026";
const INITIAL_LIMIT = 80;
const LIMIT_STEP = 80;

const state = {
  data: null,
  query: "",
  marker: "",
  topic: "",
  type: "",
  structure: "",
  sort: "relevance",
  visibleLimit: INITIAL_LIMIT,
};

const elements = {};

function text(value) {
  return value == null ? "" : String(value);
}

function escapeHtml(value) {
  return text(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function numberFormat(value) {
  return new Intl.NumberFormat("en-US").format(value || 0);
}

function optionLabel(item) {
  return `${item.name} (${numberFormat(item.count)})`;
}

function breakableLabel(value) {
  return escapeHtml(value).replaceAll("/", "/<wbr>").replaceAll("-", "-<wbr>");
}

function initElements() {
  elements.filters = document.querySelector("#filters");
  elements.search = document.querySelector("#search");
  elements.markerFilter = document.querySelector("#marker-filter");
  elements.topicFilter = document.querySelector("#topic-filter");
  elements.typeFilter = document.querySelector("#type-filter");
  elements.structureFilter = document.querySelector("#structure-filter");
  elements.sortFilter = document.querySelector("#sort-filter");
  elements.clearFilters = document.querySelector("#clear-filters");
  elements.resultCount = document.querySelector("#result-count");
  elements.results = document.querySelector("#results");
  elements.loadMore = document.querySelector("#load-more");
  elements.markerList = document.querySelector("#marker-list");
  elements.topicList = document.querySelector("#topic-list");
  elements.dialog = document.querySelector("#abstract-dialog");
  elements.dialogContent = document.querySelector("#dialog-content");
}

function populateSelect(select, items, limit = 500) {
  const options = items
    .slice(0, limit)
    .map((item) => `<option value="${escapeHtml(item.name)}">${escapeHtml(optionLabel(item))}</option>`)
    .join("");
  select.insertAdjacentHTML("beforeend", options);
}

function populateStats(data) {
  document.querySelector('[data-stat="records"]').textContent = numberFormat(data.record_count);
  document.querySelector('[data-stat="structured"]').textContent = numberFormat(data.structured_count);
  document.querySelector('[data-stat="groups"]').textContent = numberFormat(data.markers.length);
  document.querySelector('[data-stat="source-urls"]').textContent = numberFormat(data.source_url_count);
}

function renderAnalytics(list, items, filterName, maxItems = 12) {
  list.innerHTML = items
    .slice(0, maxItems)
    .map(
      (item) => `
        <li>
          <button class="analytics-button" type="button" data-filter-name="${escapeHtml(filterName)}" data-filter-value="${escapeHtml(item.name)}">
            <span class="topic-card-title">${breakableLabel(item.name)}</span>
            <span class="topic-card-meta">${numberFormat(item.count)} records</span>
          </button>
        </li>
      `,
    )
    .join("");
}

function recordMatches(record) {
  if (state.marker && record.marker !== state.marker) return false;
  if (state.topic && record.topic !== state.topic) return false;
  if (state.type && record.presentation_type !== state.type) return false;
  if (state.structure && record.structure !== state.structure) return false;
  if (!state.query) return true;

  const terms = state.query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!record._searchText) {
    record._searchText = [
      record.display_code,
      record.abstract_number,
      record.eha_abstract_id,
      record.title,
      record.summary,
      record.authors_text,
      record.affiliations_text,
      record.marker,
      record.topic,
      record.presentation_type,
      record.session_title,
      record.keywords,
      Object.keys(record.sections || {}).join(" "),
      Object.values(record.sections || {}).join(" "),
    ]
      .join(" ")
      .toLowerCase();
  }
  return terms.every((term) => record._searchText.includes(term));
}

function compareRecords(a, b) {
  const collator = new Intl.Collator("en-US", { numeric: true, sensitivity: "base" });
  if (state.sort === "title") return collator.compare(a.title, b.title);
  if (state.sort === "code") return collator.compare(a.display_code, b.display_code);
  if (state.sort === "group") return collator.compare(a.marker, b.marker) || collator.compare(a.display_code, b.display_code);
  if (state.sort === "topic") return collator.compare(a.topic, b.topic) || collator.compare(a.display_code, b.display_code);
  if (state.sort === "date") return collator.compare(a.date, b.date) || collator.compare(a.display_code, b.display_code);
  return 0;
}

function metadata(record) {
  return [
    record.display_code,
    record.eha_abstract_id,
    record.marker,
    record.presentation_type,
    record.topic,
    record.date,
    record.structure,
  ].filter(Boolean);
}

function renderRecord(record) {
  const parts = metadata(record);
  return `
    <li>
      <article class="document-row-link abstract-row">
        <div class="document-row-chip">${escapeHtml(record.marker)}</div>
        <div class="document-row-body">
          <h3 class="document-row-title">${escapeHtml(record.title || "Untitled record")}</h3>
          <p class="document-row-meta">
            ${parts.map((part) => `<span>${escapeHtml(part)}</span>`).join("")}
          </p>
          <p class="abstract-summary">${escapeHtml(record.summary || "No abstract text was available for this record.")}</p>
          <div class="abstract-actions">
            <button class="button button-primary" type="button" data-uid="${escapeHtml(record.uid)}">View details</button>
            ${record.source_url ? `<a class="button button-secondary" href="${escapeHtml(record.source_url)}" target="_blank" rel="noopener">View EHA source</a>` : ""}
          </div>
        </div>
      </article>
    </li>
  `;
}

function filteredRecords() {
  return state.data.presentations.filter(recordMatches).sort(compareRecords);
}

function renderResults() {
  const records = filteredRecords();
  const visible = records.slice(0, state.visibleLimit);
  elements.resultCount.textContent = `${numberFormat(records.length)} matching record${records.length === 1 ? "" : "s"}`;
  elements.results.innerHTML = visible.map(renderRecord).join("");
  elements.loadMore.hidden = records.length <= state.visibleLimit;
  elements.loadMore.textContent = `Load ${numberFormat(Math.min(LIMIT_STEP, records.length - state.visibleLimit))} more`;
}

function syncStateFromControls() {
  state.query = elements.search.value.trim();
  state.marker = elements.markerFilter.value;
  state.topic = elements.topicFilter.value;
  state.type = elements.typeFilter.value;
  state.structure = elements.structureFilter.value;
  state.sort = elements.sortFilter.value;
  state.visibleLimit = INITIAL_LIMIT;
  renderResults();
}

function clearFilters() {
  elements.search.value = "";
  elements.markerFilter.value = "";
  elements.topicFilter.value = "";
  elements.typeFilter.value = "";
  elements.structureFilter.value = "";
  elements.sortFilter.value = "relevance";
  syncStateFromControls();
}

function sectionMarkup(record) {
  const entries = Object.entries(record.sections || {});
  if (!entries.length) {
    return '<p class="lead">No structured abstract body was available for this record.</p>';
  }
  return entries
    .map(
      ([label, value]) => `
        <section class="abstract-section">
          <h3>${escapeHtml(label)}</h3>
          <p>${escapeHtml(value)}</p>
        </section>
      `,
    )
    .join("");
}

function sourceList(record) {
  return `
    <section class="source-list" aria-labelledby="sources-heading">
      <h2 id="sources-heading">Source links</h2>
      <ul>
        ${record.source_url ? `<li><a href="${escapeHtml(record.source_url)}" target="_blank" rel="noopener">EHA Library detail page</a></li>` : ""}
      </ul>
    </section>
  `;
}

function openDetail(uid) {
  const record = state.data.presentations.find((item) => item.uid === uid);
  if (!record) return;
  const parts = metadata(record);
  elements.dialogContent.innerHTML = `
    <header class="document-header dialog-header">
      <p class="eyebrow">${escapeHtml(record.session_title || record.topic || "EHA 2026")}</p>
      <h1 id="dialog-title">${escapeHtml(record.title || "Untitled record")}</h1>
      <dl class="metadata">
        ${parts
          .map(
            (part) => `
              <div>
                <dt>Record</dt>
                <dd>${escapeHtml(part)}</dd>
              </div>
            `,
          )
          .join("")}
        <div><dt>Content ID</dt><dd>${escapeHtml(record.content_id)}</dd></div>
      </dl>
      <div class="document-actions">
        ${record.source_url ? `<a class="button button-primary" href="${escapeHtml(record.source_url)}" target="_blank" rel="noopener">View EHA source</a>` : ""}
        <a class="button button-secondary download-link" href="data/eha_2026_abstracts.json" download>JSON</a>
        <a class="button button-secondary download-link" href="assets/data/eha_2026_abstracts.md" download>Markdown</a>
      </div>
    </header>
    <div class="content abstract-detail-content">
      ${record.authors_text ? `<p class="author-line">${escapeHtml(record.authors_text)}</p>` : ""}
      ${record.affiliations_text ? `<p class="affiliation-line">${escapeHtml(record.affiliations_text)}</p>` : ""}
      ${record.keywords ? `<p class="keyword-line"><strong>Keywords:</strong> ${escapeHtml(record.keywords)}</p>` : ""}
      ${sectionMarkup(record)}
      ${sourceList(record)}
    </div>
  `;
  elements.dialog.showModal();
}

function bindEvents() {
  elements.filters.addEventListener("submit", (event) => {
    event.preventDefault();
    syncStateFromControls();
  });
  elements.search.addEventListener("input", syncStateFromControls);
  elements.markerFilter.addEventListener("change", syncStateFromControls);
  elements.topicFilter.addEventListener("change", syncStateFromControls);
  elements.typeFilter.addEventListener("change", syncStateFromControls);
  elements.structureFilter.addEventListener("change", syncStateFromControls);
  elements.sortFilter.addEventListener("change", syncStateFromControls);
  elements.clearFilters.addEventListener("click", clearFilters);
  elements.loadMore.addEventListener("click", () => {
    state.visibleLimit += LIMIT_STEP;
    renderResults();
  });
  elements.results.addEventListener("click", (event) => {
    const button = event.target.closest("[data-uid]");
    if (button) openDetail(button.dataset.uid);
  });
  elements.dialog.addEventListener("click", (event) => {
    if (event.target === elements.dialog || event.target.closest(".dialog-close")) {
      elements.dialog.close();
    }
  });
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter-name]");
    if (!button) return;
    if (button.dataset.filterName === "marker") elements.markerFilter.value = button.dataset.filterValue;
    if (button.dataset.filterName === "topic") elements.topicFilter.value = button.dataset.filterValue;
    syncStateFromControls();
    document.querySelector("#browse").scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

async function start() {
  initElements();
  bindEvents();
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error(`Failed to load ${DATA_URL}`);
    state.data = await response.json();
    populateSelect(elements.markerFilter, state.data.markers);
    populateSelect(elements.topicFilter, state.data.topics);
    populateSelect(elements.typeFilter, state.data.presentation_types);
    populateSelect(elements.structureFilter, state.data.structures);
    populateStats(state.data);
    renderAnalytics(elements.markerList, state.data.markers, "marker", state.data.markers.length);
    renderAnalytics(elements.topicList, state.data.topics, "topic", 16);
    renderResults();
  } catch (error) {
    elements.resultCount.textContent = "Unable to load EHA records.";
    elements.results.innerHTML = `<li><p>${escapeHtml(error.message)}</p></li>`;
  }
}

start();
