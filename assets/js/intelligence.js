const DATA_URL = "assets/data/presentations-index.json?v=eha-2026";
const PAGE_SIZE = 120;

const colors = {
  blue: "#16375b",
  cyan: "#1689a0",
  green: "#167663",
  amber: "#9b711f",
  purple: "#6f5a9b",
  red: "#b34848",
  gold: "#d6b773",
  slate: "#67717a",
  teal: "#4ba78f",
  indigo: "#405f9f",
  olive: "#727b3a",
  clay: "#9f5f40",
};

const palette = Object.values(colors);

const termGroups = {
  ai: ["artificial intelligence", "machine learning", "deep learning", "digital health", "algorithm", "predictive model", "natural language processing", " ai "],
  mrd: ["mrd", "minimal residual disease", "measurable residual disease", "molecular residual disease", "ctdna", "circulating tumor dna", "liquid biopsy"],
  equity: ["disparit", "equity", "access to care", "socioeconomic", "underserved", "rural", "health economics", "cost-effectiveness", "quality of care"],
  immunotherapy: ["immunotherapy", "immune therapy", "bispecific", "bi-specific", "checkpoint", "t-cell engager", "t cell engager", "antibody", "blinatumomab", "glofitamab", "epcoritamab", "mosunetuzumab"],
  cellular: ["car-t", "cart cell", "chimeric antigen receptor", "cellular therapy", "t-cell therapy", "t cell therapy", "nk cell", "car-nk", "tumor-infiltrating"],
  genomics: ["genomic", "mutation", "molecular", "sequencing", "ngs", "transcriptomic", "gene expression", "cytogenetic", "epigenetic"],
  targeted: ["targeted therapy", "inhibitor", "btk", "bcl-2", "flt3", "jak", "menin", "idh1", "idh2", "venetoclax", "ruxolitinib", "gilteritinib"],
  realWorld: ["real-world", "real world", "registry", "retrospective", "database", "observational", "claims", "electronic health record", "ehr"],
  transplant: ["transplant", "hsct", "sct", "hematopoietic stem cell transplantation", "stem cell transplantation", "graft-versus-host", "gvhd", "conditioning"],
  supportive: ["quality of life", "qol", "supportive care", "palliative", "infection", "toxicity", "adverse event", "fatigue", "patient-reported"],
  geneTherapy: ["gene therapy", "gene editing", "crispr", "lentiviral", "exagamglogene", "lovo-cel", "lovotibeglogene"],
};

const chartDefinitions = {
  diseaseAreas: [
    ["AML", ["acute myeloid leukemia", " aml "]],
    ["ALL", ["acute lymphoblastic leukemia", " b-all", " t-all"]],
    ["CLL", ["chronic lymphocytic leukemia", " cll "]],
    ["CML", ["chronic myeloid leukemia", " cml "]],
    ["Myeloma / monoclonal gammopathies", ["multiple myeloma", "myeloma", "monoclonal gammopath"]],
    ["Large B-cell / aggressive lymphoma", ["large b cell lymphoma", "large b-cell lymphoma", "dlbcl", "aggressive lymphoma"]],
    ["Indolent / mantle-cell NHL", ["indolent", "mantle-cell", "mantle cell", "follicular lymphoma", "mcl "]],
    ["Hodgkin lymphoma", ["hodgkin"]],
    ["MDS", ["myelodysplastic", " mds "]],
    ["MPN", ["myeloproliferative", " mpn ", "polycythemia", "essential thrombocythemia", "myelofibrosis"]],
    ["Sickle cell disease", ["sickle cell", " scd "]],
    ["Thalassemia", ["thalassemia", "thalassaemia"]],
    ["Bone marrow failure / PNH", ["bone marrow failure", "aplastic anemia", "aplastic anaemia", "pnh", "paroxysmal nocturnal hemoglobinuria"]],
    ["Bleeding / platelet disorders", ["bleeding disorder", "hemophilia", "haemophilia", "von willebrand", "platelet disorder", "thrombocytopenia"]],
  ],
  paradigm: [
    ["Immunotherapy", termGroups.immunotherapy],
    ["Cellular therapy", termGroups.cellular],
    ["MRD / ctDNA", termGroups.mrd],
    ["Targeted therapy", termGroups.targeted],
    ["Genomics / molecular profiling", termGroups.genomics],
    ["Transplant / GVHD", termGroups.transplant],
    ["Real-world evidence", termGroups.realWorld],
    ["Supportive care / QoL", termGroups.supportive],
    ["Gene therapy / editing", termGroups.geneTherapy],
    ["AI / digital tools", termGroups.ai],
    ["Access / health economics", termGroups.equity],
  ],
  modalities: [
    ["CAR-T", ["car-t", "cart cell", "chimeric antigen receptor"]],
    ["Bispecific antibodies", ["bispecific", "bi-specific", "t-cell engager", "t cell engager"]],
    ["BTK inhibition", ["btk inhibitor", "ibrutinib", "acalabrutinib", "zanubrutinib", "pirtobrutinib"]],
    ["BCL-2 inhibition", ["bcl-2", "bcl2", "venetoclax"]],
    ["JAK / STAT inhibition", ["jak inhibitor", "jak2", "ruxolitinib", "momelotinib", "pacritinib", "fedratinib"]],
    ["FLT3 inhibition", ["flt3", "gilteritinib", "quizartinib", "midostaurin"]],
    ["Menin inhibition", ["menin inhibitor", "revumenib", "ziftomenib", "kmt2a"]],
    ["IDH inhibition", ["idh1", "idh2", "ivosidenib", "enasidenib", "olutasidenib"]],
    ["Gene therapy / editing", termGroups.geneTherapy],
    ["HSCT / conditioning", termGroups.transplant],
    ["Antibody-drug conjugates", ["antibody-drug conjugate", "antibody drug conjugate", " adc ", "vedotin", "ozogamicin"]],
    ["NK / T-cell therapy", ["nk cell", "car-nk", "t-cell therapy", "t cell therapy", "cytotoxic t lymphocyte"]],
  ],
  drugs: [
    ["Venetoclax", ["venetoclax", "venclexta"]],
    ["Blinatumomab", ["blinatumomab", "blincyto"]],
    ["Glofitamab", ["glofitamab", "columvi"]],
    ["Epcoritamab", ["epcoritamab", "epkinly"]],
    ["Mosunetuzumab", ["mosunetuzumab", "lunsumio"]],
    ["Tafasitamab", ["tafasitamab", "monjuvi", "minjuvi"]],
    ["Lenalidomide", ["lenalidomide", "revlimid"]],
    ["Daratumumab", ["daratumumab", "darzalex"]],
    ["Talquetamab", ["talquetamab", "talvey"]],
    ["Ruxolitinib", ["ruxolitinib", "jakafi", "jakavi"]],
    ["Ibrutinib", ["ibrutinib", "imbruvica"]],
    ["Acalabrutinib", ["acalabrutinib", "calquence"]],
    ["Zanubrutinib", ["zanubrutinib", "brukinsa"]],
    ["Pirtobrutinib", ["pirtobrutinib", "jaypirca"]],
    ["Azacitidine", ["azacitidine", "vidaza"]],
    ["Gilteritinib", ["gilteritinib", "xospata"]],
    ["Luspatercept", ["luspatercept", "reblozyl"]],
    ["Mitapivat", ["mitapivat", "pyrukynd"]],
  ],
  immuneSignals: [
    ["Blinatumomab / CD19 BiTE", ["blinatumomab", "cd19", "bite", "bispecific t-cell engager"]],
    ["CD20 bispecifics", ["glofitamab", "epcoritamab", "mosunetuzumab", "odronextamab", "cd20 bispecific"]],
    ["BCMA strategies", ["bcma", "teclistamab", "elranatamab", "ciltacabtagene", "idecabtagene"]],
    ["GPRC5D strategies", ["gprc5d", "talquetamab"]],
    ["CAR-T products", ["axi-cel", "axicabtagene", "liso-cel", "lisocabtagene", "brexu-cel", "brexucabtagene", "tisa-cel", "tisagenlecleucel", "ide-cel", "cilta-cel"]],
    ["NK-cell approaches", ["nk cell", "car-nk", "natural killer"]],
    ["Checkpoint blockade", ["pd-1", "pd-l1", "checkpoint inhibitor", "nivolumab", "pembrolizumab"]],
  ],
  genes: [
    ["FLT3", ["flt3"]],
    ["NPM1", ["npm1"]],
    ["TP53", ["tp53", "p53"]],
    ["JAK2", ["jak2"]],
    ["CALR", ["calr"]],
    ["MPL", [" mpl ", "mpl mutation"]],
    ["BCR-ABL", ["bcr-abl", "bcr::abl", "philadelphia chromosome"]],
    ["KMT2A", ["kmt2a", "mll rearranged", "mll-rearranged"]],
    ["IDH1/2", ["idh1", "idh2"]],
    ["DNMT3A", ["dnmt3a"]],
    ["TET2", ["tet2"]],
    ["ASXL1", ["asxl1"]],
    ["MYD88", ["myd88"]],
    ["BTK", [" btk ", "btk inhibitor"]],
    ["BCL2", ["bcl2", "bcl-2"]],
  ],
  targets: [
    ["BCMA", ["bcma"]],
    ["CD19", ["cd19"]],
    ["CD20", ["cd20"]],
    ["CD22", ["cd22"]],
    ["CD30", ["cd30"]],
    ["CD33", ["cd33"]],
    ["CD38", ["cd38"]],
    ["CD123", ["cd123"]],
    ["GPRC5D", ["gprc5d"]],
    ["FcRH5", ["fcrh5", "fc receptor-homolog 5"]],
    ["Menin / KMT2A", ["menin", "kmt2a"]],
    ["JAK2 / CALR / MPL", ["jak2", "calr", " mpl "]],
    ["BTK", [" btk ", "btk inhibitor"]],
    ["BCL-2", ["bcl-2", "bcl2"]],
  ],
  phase: [
    ["Phase I", ["phase 1", "phase i", "phase ib"]],
    ["Phase II", ["phase 2", "phase ii"]],
    ["Phase III", ["phase 3", "phase iii"]],
    ["Phase IV", ["phase 4", "phase iv"]],
  ],
  endpoints: [
    ["OS", ["overall survival", " os "]],
    ["PFS", ["progression-free survival", "pfs"]],
    ["EFS", ["event-free survival", "efs"]],
    ["MRD negativity", ["mrd-negative", "mrd negativity", "minimal residual disease negativity", "measurable residual disease negativity"]],
    ["ORR", ["objective response rate", " orr "]],
    ["CR / CMR", ["complete response", " cr ", "complete metabolic response", "cmr"]],
    ["DoR", ["duration of response", " dor "]],
    ["QoL / PRO", ["quality of life", "qol", "patient-reported", "patient reported"]],
    ["Safety", ["safety", "adverse event", "toxicity", "grade 3"]],
    ["Hemoglobin response", ["hemoglobin response", "haemoglobin response", "hb response"]],
  ],
  combos: [
    ["Venetoclax + HMA", ["venetoclax plus azacitidine", "venetoclax and azacitidine", "venetoclax plus decitabine", "venetoclax and decitabine"]],
    ["BTK inhibitor + venetoclax", ["ibrutinib plus venetoclax", "acalabrutinib plus venetoclax", "zanubrutinib plus venetoclax", "btk inhibitor plus venetoclax"]],
    ["Antibody + chemotherapy", ["antibody plus chemotherapy", "tafasitamab plus", "rituximab plus", "r-chop", "rchop"]],
    ["Bispecific combinations", ["bispecific plus", "bispecific antibody plus", "t-cell engager plus", "t cell engager plus"]],
    ["CAR-T sequencing / consolidation", ["car-t after", "post car-t", "car-t consolidation", "after car-t"]],
    ["JAK inhibitor combinations", ["ruxolitinib plus", "jak inhibitor plus", "momelotinib plus"]],
  ],
};

const app = {
  records: [],
  charts: [],
  selectedRecords: [],
  rendered: 0,
};

const TITLE_LOWERCASE_WORDS = new Set(["a", "an", "and", "as", "at", "by", "for", "from", "in", "into", "of", "on", "or", "per", "the", "to", "vs", "with", "without"]);
const TITLE_ACRONYMS = new Set(["ALL", "AML", "ASCT", "B", "BCL", "BCMA", "BCR", "BTK", "CALR", "CAR", "CD", "CHOP", "CLL", "CML", "CMR", "CNS", "CR", "CTDNA", "DLBCL", "DFS", "EFS", "GVHD", "HL", "HMA", "HSCT", "IDH", "JAK", "MCL", "MDS", "MPN", "MRD", "NK", "NHL", "NPM1", "ORR", "OS", "PFS", "PNH", "QoL", "RRMM", "SCD", "SCT", "T", "TP53"]);

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function numberFormat(value) {
  return new Intl.NumberFormat("en-US").format(value || 0);
}

function titleWord(part, isFirstWord, isSubpart = false) {
  if (!part || !/[A-Z]/.test(part)) return part;
  const match = part.match(/^([^A-Z0-9]*)(.*?)([^A-Z0-9]*)$/);
  if (!match) return part;
  const [, prefix, core, suffix] = match;
  if (!core) return part;
  if (core.includes("-") || core.includes("/")) {
    let firstCore = true;
    const formatted = core
      .split(/([/-])/)
      .map((piece) => {
        if (piece === "-" || piece === "/") return piece;
        const next = titleWord(piece, isFirstWord && firstCore, !firstCore);
        firstCore = false;
        return next;
      })
      .join("");
    return `${prefix}${formatted}${suffix}`;
  }
  const upper = core.toUpperCase();
  const lower = core.toLowerCase();
  if (TITLE_ACRONYMS.has(upper) || /\d/.test(core)) return `${prefix}${upper}${suffix}`;
  if (!isFirstWord && !isSubpart && TITLE_LOWERCASE_WORDS.has(lower)) return `${prefix}${lower}${suffix}`;
  const cased = isSubpart ? lower : lower.charAt(0).toUpperCase() + lower.slice(1);
  return `${prefix}${cased}${suffix}`;
}

function displayTitle(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "Untitled record";
  if (/[a-z]/.test(raw)) return raw;
  let wordIndex = 0;
  return raw.replace(/\S+/g, (part) => {
    const formatted = titleWord(part, wordIndex === 0);
    wordIndex += 1;
    return formatted;
  });
}

function displayLabel(value) {
  return String(value ?? "")
    .replace(/^\d+\.\s*/, "")
    .replace(/\s*-\s*(Clinical|Biology & translational research|Experimental)$/i, " ($1)")
    .trim();
}

function topicFamily(value) {
  const topic = String(value ?? "").trim();
  if (!topic || topic === "Unspecified") return "Unspecified";
  return topic
    .replace(/^\d+\.\s*/, "")
    .replace(/\s*-\s*(Clinical|Biology & translational research|Experimental)$/i, "")
    .trim();
}

function ensureLabelTooltip() {
  let tooltip = document.querySelector("#label-tooltip");
  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.id = "label-tooltip";
    tooltip.className = "label-tooltip";
    tooltip.hidden = true;
    document.body.append(tooltip);
  }
  return tooltip;
}

function positionLabelTooltip(tooltip, target) {
  const rect = target.getBoundingClientRect();
  tooltip.style.left = `${Math.min(window.innerWidth - tooltip.offsetWidth - 12, Math.max(12, rect.left))}px`;
  tooltip.style.top = `${Math.max(12, rect.top - tooltip.offsetHeight - 8)}px`;
}

function showLabelTooltip(target) {
  const text = target.dataset.fullLabel;
  const isTruncated = target.scrollWidth > target.clientWidth + 1;
  if (!text || !isTruncated) {
    hideLabelTooltip();
    return;
  }
  const tooltip = ensureLabelTooltip();
  tooltip.textContent = text;
  tooltip.hidden = false;
  positionLabelTooltip(tooltip, target);
}

function hideLabelTooltip() {
  const tooltip = document.querySelector("#label-tooltip");
  if (!tooltip) return;
  tooltip.hidden = true;
}

function textFor(record) {
  if (!record._intelText) {
    record._intelText = [
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
      record.structure,
      Object.keys(record.sections || {}).join(" "),
      Object.values(record.sections || {}).join(" "),
    ]
      .join(" ")
      .toLowerCase();
  }
  return record._intelText;
}

function matchTerms(record, terms) {
  const haystack = textFor(record);
  return terms.some((term) => haystack.includes(term.toLowerCase()));
}

function recordsForTerms(terms) {
  return app.records.filter((record) => matchTerms(record, terms));
}

function groupRecords(records, keyFn) {
  const grouped = new Map();
  records.forEach((record) => {
    const key = keyFn(record) || "Unspecified";
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(record);
  });
  return [...grouped.entries()].map(([label, records]) => ({ label, records }));
}

function countData(definitions) {
  return definitions.map(([label, terms]) => ({ label, terms, records: recordsForTerms(terms) }));
}

function sortedCountData(definitions) {
  return countData(definitions).sort((a, b) => b.records.length - a.records.length);
}

function sourceLabel(record) {
  return [
    record.display_code ? `Abstract ${record.display_code}` : "",
    record.eha_abstract_id,
    record.marker,
    displayLabel(record.topic || record.session_title),
  ]
    .filter(Boolean)
    .join(" / ");
}

function openRecords(kind, label, records) {
  app.selectedRecords = [...records].sort((a, b) => String(a.display_code || a.abstract_number).localeCompare(String(b.display_code || b.abstract_number), undefined, { numeric: true }));
  app.rendered = 0;
  document.querySelector("#dialog-kind").textContent = kind;
  document.querySelector("#dialog-title").textContent = displayLabel(label);
  document.querySelector("#dialog-summary").textContent = `${numberFormat(app.selectedRecords.length)} matching records. Each row links to the EHA Library source URL.`;
  document.querySelector("#dialog-search").value = "";
  renderRecords(true);
  document.querySelector("#records-dialog").showModal();
}

function filteredSelectedRecords() {
  const query = document.querySelector("#dialog-search").value.trim().toLowerCase();
  if (!query) return app.selectedRecords;
  const terms = query.split(/\s+/).filter(Boolean);
  return app.selectedRecords.filter((record) => terms.every((term) => textFor(record).includes(term)));
}

function renderRecords(reset = false) {
  if (reset) app.rendered = 0;
  const list = document.querySelector("#records-list");
  const records = filteredSelectedRecords();
  app.rendered = Math.min(records.length, app.rendered + PAGE_SIZE);
  list.innerHTML = records
    .slice(0, app.rendered)
    .map((record) => {
      const title = escapeHtml(displayTitle(record.title || "Untitled record"));
      const url = escapeHtml(record.source_url || "");
      const titleMarkup = url
        ? `<a class="record-title" href="${url}" target="_blank" rel="noopener">${title}</a>`
        : `<span class="record-title">${title}</span>`;
      return `
        <li>
          ${titleMarkup}
          <div class="record-meta">${escapeHtml(sourceLabel(record))}</div>
          ${url ? `<a class="record-url" href="${url}" target="_blank" rel="noopener">${url}</a>` : ""}
        </li>
      `;
    })
    .join("");
  const loadMore = document.querySelector("#load-more-records");
  loadMore.hidden = app.rendered >= records.length;
  loadMore.textContent = `Load more (${numberFormat(records.length - app.rendered)} remaining)`;
}

function kpiButton(label, records, className) {
  const button = document.createElement("button");
  button.className = `kpi kpi-${className}`;
  button.type = "button";
  button.innerHTML = `<div class="num">${numberFormat(records.length)}</div><div class="label">${escapeHtml(label)}</div>`;
  button.addEventListener("click", () => openRecords("Metric", label, records));
  return button;
}

function renderKpis(topicFamilies) {
  const oralAndPlenary = app.records.filter((record) => ["Oral Presentations", "Plenary Abstract Session"].includes(record.marker));
  const structured = app.records.filter((record) => record.has_structured_sections || record.structure === "Structured abstract");
  const topFamily = topicFamilies[0] || { label: "Top topic family", records: [] };
  const grid = document.querySelector("#kpi-grid");
  grid.innerHTML = "";
  grid.append(
    kpiButton("Total records", app.records, "blue"),
    kpiButton("Oral + plenary", oralAndPlenary, "purple"),
    kpiButton("Structured abstracts", structured, "cyan"),
    kpiButton("MRD / ctDNA", recordsForTerms(termGroups.mrd), "green"),
    kpiButton("Cellular + immune therapy", recordsForTerms([...termGroups.cellular, ...termGroups.immunotherapy]), "amber"),
    kpiButton(`Top family: ${displayLabel(topFamily.label)}`, topFamily.records, "red"),
  );
}

function renderInsights(topicFamilies) {
  const plenary = app.records.filter((record) => record.marker === "Plenary Abstract Session");
  const topTwoFamilies = topicFamilies.slice(0, 2).map((point) => displayLabel(point.label)).join(" and ");
  const insights = [
    [`Plenary abstracts concentrate late-stage practice-changing records`, plenary],
    [`${topTwoFamilies || "Top topic families"} lead the EHA topic landscape`, topicFamilies.slice(0, 2).flatMap((point) => point.records)],
    ["MRD and ctDNA appear as cross-cutting measurement themes", recordsForTerms(termGroups.mrd)],
    ["Cellular and bispecific immune strategies span leukemias, lymphomas, and myeloma", recordsForTerms([...termGroups.cellular, ...termGroups.immunotherapy])],
    ["Genomics and molecular profiling remain central to classification and therapy selection", recordsForTerms(termGroups.genomics)],
    ["Supportive care, QoL, infections, and access topics remain visible across the archive", recordsForTerms([...termGroups.supportive, ...termGroups.equity])],
  ];
  document.querySelector("#insight-list").innerHTML = insights
    .map(
      ([label, records], index) => `
        <li><button type="button" data-insight="${index}"><strong>${escapeHtml(label)}</strong>: ${numberFormat(records.length)} matching records</button></li>
      `,
    )
    .join("");
  document.querySelector("#insight-list").addEventListener("click", (event) => {
    const button = event.target.closest("[data-insight]");
    if (!button) return;
    const [label, records] = insights[Number(button.dataset.insight)];
    openRecords("Insight", label, records);
  }, { once: true });
}

function renderBarList(id, points, kind) {
  const max = Math.max(...points.map((point) => point.records.length), 1);
  const container = document.querySelector(`#${id}`);
  container.innerHTML = "";
  points.forEach((point, index) => {
    const button = document.createElement("button");
    const label = displayLabel(point.label);
    button.className = "bar-item";
    button.type = "button";
    button.setAttribute("aria-label", `${label}: ${numberFormat(point.records.length)} matching records`);
    button.innerHTML = `
      <span class="name" data-full-label="${escapeHtml(label)}">${escapeHtml(label)}</span>
      <span class="bar-track"><span class="bar-fill" style="width:${Math.max(2, (point.records.length / max) * 100).toFixed(1)}%; background:${palette[index % palette.length]}"></span></span>
      <span class="val">${numberFormat(point.records.length)}</span>
    `;
    const name = button.querySelector(".name");
    name.addEventListener("mouseenter", () => showLabelTooltip(name));
    name.addEventListener("mouseleave", hideLabelTooltip);
    button.addEventListener("focus", () => showLabelTooltip(name));
    button.addEventListener("blur", hideLabelTooltip);
    button.addEventListener("click", () => openRecords(kind, point.label, point.records));
    container.append(button);
  });
}

function chartClickHandler(points, kind) {
  return (_event, elements) => {
    if (!elements.length) return;
    const point = points[elements[0].index];
    openRecords(kind, point.label, point.records);
  };
}

function renderChart(canvasId, type, points, kind, extra = {}) {
  const ctx = document.getElementById(canvasId);
  const chart = new Chart(ctx, {
    type,
    data: {
      labels: points.map((point) => displayLabel(point.label)),
      datasets: [
        {
          label: "Matching records",
          data: points.map((point) => point.records.length),
          backgroundColor: points.map((_, index) => palette[index % palette.length]),
          borderColor: type === "polarArea" || type === "doughnut" ? "#eadfca" : "transparent",
          borderWidth: type === "polarArea" || type === "doughnut" ? 1 : 0,
          borderRadius: type === "bar" ? 4 : 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: extra.indexAxis || "x",
      interaction: { mode: "nearest", intersect: false },
      onClick: chartClickHandler(points, kind),
      plugins: {
        legend: { display: type !== "bar", position: "bottom", labels: { color: "#67717a", boxWidth: 10, font: { size: 10 } } },
        tooltip: {
          callbacks: {
            label: (context) => `${context.label}: ${numberFormat(context.parsed.y ?? context.parsed.x ?? context.parsed)} records`,
          },
        },
      },
      scales: type === "doughnut" || type === "polarArea" ? undefined : {
        x: { grid: { color: extra.indexAxis === "y" ? "#eadfca" : "transparent" }, ticks: { color: "#67717a", font: { size: 10 } } },
        y: { grid: { color: extra.indexAxis === "y" ? "transparent" : "#eadfca" }, ticks: { color: "#67717a", font: { size: 10 } } },
      },
    },
  });
  app.charts.push(chart);
  attachPointButtons(canvasId, points, kind);
}

function attachPointButtons(canvasId, points, kind) {
  const card = document.getElementById(canvasId).closest(".card");
  const pills = document.createElement("div");
  pills.className = "point-pills";
  pills.setAttribute("aria-label", `${kind} data point record links`);
  points.forEach((point) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = `${displayLabel(point.label)} (${numberFormat(point.records.length)})`;
    button.addEventListener("click", () => openRecords(kind, point.label, point.records));
    pills.append(button);
  });
  card.append(pills);
}

function renderPlenary() {
  const colorsForItems = [colors.amber, colors.purple, colors.blue, colors.cyan, colors.green];
  const container = document.querySelector("#plenary-list");
  const plenary = app.records
    .filter((record) => record.marker === "Plenary Abstract Session")
    .sort((a, b) => String(a.display_code).localeCompare(String(b.display_code), undefined, { numeric: true }));
  container.innerHTML = "";
  plenary.forEach((record, index) => {
    const button = document.createElement("button");
    button.className = "plenary-item";
    button.type = "button";
    button.style.borderLeftColor = colorsForItems[index % colorsForItems.length];
    button.innerHTML = `
      <h3>${escapeHtml(record.display_code ? `${record.display_code}: ${displayTitle(record.title)}` : displayTitle(record.title))}</h3>
      <div class="tag-row">
        <span class="tag">${escapeHtml(record.eha_abstract_id || "EHA abstract")}</span>
        <span class="tag">${escapeHtml(record.keywords || record.presentation_type || "Plenary")}</span>
      </div>
    `;
    button.addEventListener("click", () => openRecords("Plenary", record.display_code || record.title, [record]));
    container.append(button);
  });
}

function renderThemeCards() {
  const cards = [
    ["AI / digital hematology", recordsForTerms(termGroups.ai), "Algorithms, machine learning, digital analytical tools, and predictive models."],
    ["MRD / ctDNA", recordsForTerms(termGroups.mrd), "Minimal residual disease, molecular monitoring, and liquid biopsy methods."],
    ["Access / health economics", recordsForTerms(termGroups.equity), "Access, disparities, cost-effectiveness, health economics, and care delivery."],
  ];
  const container = document.querySelector("#theme-cards");
  container.innerHTML = "";
  cards.forEach(([label, records, description]) => {
    const button = document.createElement("button");
    button.className = "theme-card";
    button.type = "button";
    button.innerHTML = `<h3>${escapeHtml(label)}</h3><div class="big">${numberFormat(records.length)}</div><p>${escapeHtml(description)}</p>`;
    button.addEventListener("click", () => openRecords("Theme", label, records));
    container.append(button);
  });
}

function wireDialog() {
  document.querySelector(".dialog-close").addEventListener("click", () => document.querySelector("#records-dialog").close());
  document.querySelector("#records-dialog").addEventListener("click", (event) => {
    if (event.target.id === "records-dialog") event.target.close();
  });
  document.querySelector("#dialog-search").addEventListener("input", () => renderRecords(true));
  document.querySelector("#load-more-records").addEventListener("click", () => renderRecords());
  document.querySelector("#copy-urls").addEventListener("click", async () => {
    const urls = filteredSelectedRecords().map((record) => record.source_url).filter(Boolean).join("\n");
    try {
      await navigator.clipboard.writeText(urls);
      document.querySelector("#copy-urls").textContent = "Copied";
    } catch {
      document.querySelector("#copy-urls").textContent = "Copy failed";
    }
    setTimeout(() => {
      document.querySelector("#copy-urls").textContent = "Copy URLs";
    }, 1200);
  });
}

function renderAll() {
  app.charts.forEach((chart) => chart.destroy());
  app.charts = [];
  document.querySelectorAll(".point-pills").forEach((node) => node.remove());

  const topics = groupRecords(app.records.filter((record) => record.topic && record.topic !== "Unspecified"), (record) => record.topic)
    .sort((a, b) => b.records.length - a.records.length);
  const topicFamilies = groupRecords(app.records.filter((record) => record.topic && record.topic !== "Unspecified"), (record) => topicFamily(record.topic))
    .sort((a, b) => b.records.length - a.records.length);
  const categories = groupRecords(app.records, (record) => record.marker)
    .sort((a, b) => b.records.length - a.records.length);

  renderKpis(topicFamilies);
  renderInsights(topicFamilies);
  renderChart("categoryChart", "doughnut", categories, "Presentation category");
  renderBarList("topicBars", topics.slice(0, 12), "Topic");
  renderPlenary();
  renderChart("diseaseChart", "bar", sortedCountData(chartDefinitions.diseaseAreas), "Disease area", { indexAxis: "y" });
  renderBarList("familyBars", topicFamilies.slice(0, 12), "Topic family");
  renderChart("paradigmChart", "bar", sortedCountData(chartDefinitions.paradigm), "Paradigm", { indexAxis: "y" });
  renderChart("modalityChart", "bar", sortedCountData(chartDefinitions.modalities), "Modality", { indexAxis: "y" });
  renderBarList("drugBars", sortedCountData(chartDefinitions.drugs).slice(0, 15), "Therapy");
  renderBarList("immuneBars", sortedCountData(chartDefinitions.immuneSignals), "Immune therapy signal");
  renderChart("geneChart", "polarArea", sortedCountData(chartDefinitions.genes).slice(0, 12), "Gene / biomarker");
  renderBarList("targetBars", sortedCountData(chartDefinitions.targets), "Target");
  renderChart("phaseChart", "doughnut", countData(chartDefinitions.phase), "Trial phase");
  renderChart("endpointChart", "bar", sortedCountData(chartDefinitions.endpoints), "Endpoint");
  renderChart("comboChart", "bar", sortedCountData(chartDefinitions.combos), "Combination strategy");
  renderThemeCards();
  renderChart("topicIntensityChart", "bar", topicFamilies.slice(0, 18), "Topic family", { indexAxis: "y" });
}

function markLoaded() {
  document.querySelector("#dashboard-loading")?.setAttribute("hidden", "");
  document.body.classList.remove("is-loading");
  document.body.classList.add("is-loaded");
}

async function start() {
  wireDialog();
  const response = await fetch(DATA_URL);
  if (!response.ok) throw new Error(`Failed to load ${DATA_URL}`);
  const data = await response.json();
  app.records = data.presentations || [];
  renderAll();
  requestAnimationFrame(markLoaded);
}

start().catch((error) => {
  document.body.classList.remove("is-loading");
  document.body.classList.add("has-load-error");
  document.querySelector("#dashboard-loading")?.setAttribute("hidden", "");
  document.querySelector(".dashboard-shell").insertAdjacentHTML(
    "afterbegin",
    `<section class="insight-box"><h2>Unable to load dashboard data</h2><p>${escapeHtml(error.message)}</p></section>`,
  );
});
