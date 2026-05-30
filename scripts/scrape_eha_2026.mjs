import fs from "node:fs/promises";
import path from "node:path";

const BASE = "https://library.ehaweb.org";
const G_CODE = "eha";
const CE_ID = "2934";
const EVENT_NAME = "EHA 2026";
const START_URL = `${BASE}/${G_CODE}/#!*menu=6*browseby=3*sortby=2*ce_id=${CE_ID}`;
const OUT_DIR = path.resolve("data");
const RAW_DIR = path.join(OUT_DIR, "raw");

const HEADERS = {
  "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
  "x-requested-with": "XMLHttpRequest",
  referer: START_URL,
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36",
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function formBody(params) {
  return new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null),
  ).toString();
}

async function postJson(route, params, attempt = 1) {
  const response = await fetch(`${BASE}/${G_CODE}${route}`, {
    method: "POST",
    headers: HEADERS,
    body: formBody(params),
  });
  if (!response.ok) {
    if (attempt < 4) {
      await sleep(500 * attempt);
      return postJson(route, params, attempt + 1);
    }
    throw new Error(`POST ${route} failed: ${response.status} ${response.statusText}`);
  }
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`POST ${route} returned non-JSON: ${text.slice(0, 200)}`);
  }
}

async function getText(url, attempt = 1) {
  const response = await fetch(url, { headers: { ...HEADERS, "content-type": undefined } });
  if (!response.ok) {
    if (attempt < 4) {
      await sleep(500 * attempt);
      return getText(url, attempt + 1);
    }
    throw new Error(`GET ${url} failed: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

function decodeEntities(value = "") {
  const named = {
    amp: "&",
    apos: "'",
    copy: "(c)",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
    reg: "(R)",
  };
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity) => {
    if (entity[0] === "#") {
      const base = entity[1]?.toLowerCase() === "x" ? 16 : 10;
      const code = Number.parseInt(entity.replace(/^#x?/i, ""), base);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    return named[entity.toLowerCase()] ?? match;
  });
}

function stripTags(html = "") {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<(?:br|\/p|\/div|\/h\d|hr)\b[^>]*>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/[ \t\r\f\v]+/g, " ")
      .replace(/\n[ \t]+/g, "\n")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim(),
  );
}

function attr(tag, name) {
  const match = tag.match(new RegExp(`${name}=["']([^"']*)["']`, "i"));
  return match ? decodeEntities(match[1]) : "";
}

function textBetween(html, startRe, endRe = /$/) {
  const start = html.search(startRe);
  if (start === -1) return "";
  const after = html.slice(start).replace(startRe, "");
  const end = after.search(endRe);
  return stripTags(end === -1 ? after : after.slice(0, end));
}

function extractLinkedCards(html, linkClass) {
  const cards = [];
  const re = new RegExp(`<a\\b([^>]*class=["'][^"']*${linkClass}[^"']*["'][^>]*)>([\\s\\S]*?)<\\/a>`, "gi");
  for (const match of html.matchAll(re)) {
    const openTag = match[1];
    const body = match[2];
    cards.push({
      href: attr(openTag, "href"),
      title: textBetween(body, /<div[^>]*class=["'][^"']*(?:long-name name|list-title)[^"']*["'][^>]*>/i, /<\/div>/i),
      text: stripTags(body),
    });
  }
  return cards;
}

function contentIdFromUrl(url) {
  const match = url.match(/\/(\d+)\/[^/]+\.html/i);
  return match ? Number(match[1]) : null;
}

function markerIdFromUrl(url) {
  const match = url.match(/[?*]marker=(\d+)/i);
  return match ? Number(match[1]) : null;
}

function authorNameFromHref(url = "") {
  const match = url.match(/\/\d+\/([^/]+)\.html/i);
  if (!match) return "";
  const parts = decodeEntities(match[1]).split(".");
  if (parts.length < 2) return "";
  const words = parts.slice(0, 2).join(" ").split(/[-\s]+/);
  return words.map((word) => (word ? word[0].toUpperCase() + word.slice(1) : "")).join(" ");
}

function topicIdFromUrl(url) {
  const match = url.match(/[?*]ot_id=(\d+)/i);
  return match ? Number(match[1]) : null;
}

function parseReference(reference = "") {
  const cleaned = stripTags(reference).replace(/\s+/g, " ").trim();
  const match = cleaned.match(/^(.*?)(?:\. )?([A-Z]{1,4}\d{2,5})?\s*$/);
  return {
    reference: cleaned,
    abstract_number: match?.[2] ?? "",
  };
}

function extractConferenceItems(html, context) {
  const re =
    /<a\b([^>]*class=["'][^"']*list-conf[^"']*["'][^>]*)>([\s\S]*?)<\/a>\s*<\/div>/gi;
  const items = [];
  for (const match of html.matchAll(re)) {
    const href = attr(match[1], "href");
    const body = match[2];
    const title = textBetween(body, /<div[^>]*class=["'][^"']*list-title[^"']*["'][^>]*>/i, /<\/div>/i);
    const referenceText = textBetween(
      body,
      /<div[^>]*class=["'][^"']*list-reference[^"']*["'][^>]*>/i,
      /<\/div>/i,
    );
    const parsedReference = parseReference(referenceText);
    items.push({
      ...context,
      content_id: contentIdFromUrl(href),
      title,
      href,
      listing_reference: parsedReference.reference,
      abstract_number: parsedReference.abstract_number,
    });
  }
  return items;
}

function findBalancedJson(text, key) {
  const keyIndex = text.indexOf(key);
  if (keyIndex === -1) return null;
  const start = text.indexOf("{", keyIndex);
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < text.length; i += 1) {
    const char = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') inString = true;
    else if (char === "{") depth += 1;
    else if (char === "}") {
      depth -= 1;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

function extractDescriptionFields(descriptionHtml = "") {
  const text = stripTags(descriptionHtml);
  const labels = [
    "Abstract",
    "Title",
    "Type",
    "Session title",
    "Background",
    "Aims",
    "Methods",
    "Results",
    "Summary/Conclusion",
    "Keyword(s)",
  ];
  const fields = {};
  for (const label of labels) {
    const labelRe = label.replace(/[()/]/g, "\\$&");
    const nextLabels = labels.filter((item) => item !== label).map((item) => item.replace(/[()/]/g, "\\$&"));
    const re = new RegExp(`${labelRe}:\\s*([\\s\\S]*?)(?=\\n?\\s*(?:${nextLabels.join("|")}):|$)`, "i");
    const match = text.match(re);
    if (match) {
      const key = label
        .toLowerCase()
        .replace("(s)", "s")
        .replace(/\//g, "_")
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "");
      fields[key] = match[1].trim();
    }
  }
  fields.description_text = text;
  return fields;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function extractLegacyAuthors(html = "") {
  const authorMap = new Map();
  const tooltipRe = /<div id="co-\d+" class="mwc-tooltip">([\s\S]*?)<\/div>\s*<\/div>/gi;
  for (const match of html.matchAll(tooltipRe)) {
    const block = match[1];
    const name = textBetween(block, /<b>/i, /<\/b>/i);
    const affiliation = textBetween(block, /<div[^>]*class=["'][^"']*co-affiliation[^"']*["'][^>]*>/i, /<\/div>/i)
      .replace(/^Affiliations:\s*/i, "")
      .trim();
    if (name) authorMap.set(name, affiliation);
  }
  return {
    authors: [...authorMap.keys()],
    affiliations: unique([...authorMap.values()]),
  };
}

function extractLegacyDescription(html = "") {
  const fullMatch = html.match(/<div class="desc-text-all">([\s\S]*?)<\/div>\s*<\/div>\s*<script>/i);
  if (fullMatch) return fullMatch[1];
  const initMatch = html.match(/<div class="text-init">([\s\S]*?)<\/div>\s*<div class="read-more-btn">/i);
  return initMatch?.[1] ?? "";
}

function extractLegacyDetail(html, item) {
  const descriptionHtml = extractLegacyDescription(html);
  if (!descriptionHtml) {
    return { ...item, detail_error: "conf object and legacy abstract block not found" };
  }
  const descriptionFields = extractDescriptionFields(descriptionHtml);
  const authorData = extractLegacyAuthors(html);
  const pageTitle = textBetween(html, /<div[^>]*class=["'][^"']*title[^"']*["'][^>]*>/i, /<\/div>/i);
  const title = descriptionFields.title || pageTitle || item.title;
  const dateMatch = stripTags(html).match(/\b(\d{2}\/\d{2}\/\d{2});\s*\d+;/);
  return {
    ...item,
    title,
    default_title: title,
    date: dateMatch ? `20${dateMatch[1].slice(6, 8)}-${dateMatch[1].slice(0, 2)}-${dateMatch[1].slice(3, 5)}` : "",
    created: "",
    abstract_number: descriptionFields.abstract?.match(/(?:Short:\s*)?([A-Z]{1,4}\d{2,5})\b/)?.[1] ?? item.abstract_number,
    eha_abstract_id: descriptionFields.abstract?.match(/\bEHA-\d+\b/)?.[0] ?? "",
    presentation_type: descriptionFields.type ?? "",
    session_title: descriptionFields.session_title ?? "",
    background: descriptionFields.background ?? "",
    aims: descriptionFields.aims ?? "",
    methods: descriptionFields.methods ?? "",
    results: descriptionFields.results ?? "",
    summary_conclusion: descriptionFields.summary_conclusion ?? "",
    keywords: descriptionFields.keywords ?? "",
    abstract_text: [
      descriptionFields.background,
      descriptionFields.aims,
      descriptionFields.methods,
      descriptionFields.results,
      descriptionFields.summary_conclusion,
    ]
      .filter(Boolean)
      .join("\n\n"),
    description_text: descriptionFields.description_text,
    authors: authorData.authors.length ? authorData.authors : [authorNameFromHref(item.href)].filter(Boolean),
    affiliations: authorData.affiliations,
    source_conf: {
      c_id: item.content_id,
      tab_id: item.content_id,
      owner: null,
    },
  };
}

async function extractDetail(item) {
  const html = await getText(item.href);
  const confJson = findBalancedJson(html, "conf:");
  if (!confJson) {
    return extractLegacyDetail(html, item);
  }
  const conf = JSON.parse(confJson);
  const coAuthors = Object.values(conf.co_authors ?? {});
  const authors = coAuthors.map((author) => `${author.firstname ?? ""} ${author.lastname ?? ""}`.trim()).filter(Boolean);
  const descriptionFields = extractDescriptionFields(conf.description ?? "");
  return {
    ...item,
    title: conf.name || item.title,
    default_title: conf.default_name ?? "",
    date: conf.c_date ?? "",
    created: conf.c_created ?? "",
    abstract_number: descriptionFields.abstract?.match(/(?:Short:\s*)?([A-Z]{1,4}\d{2,5})\b/)?.[1] ?? item.abstract_number,
    eha_abstract_id: descriptionFields.abstract?.match(/\bEHA-\d+\b/)?.[0] ?? "",
    presentation_type: descriptionFields.type ?? "",
    session_title: descriptionFields.session_title ?? "",
    background: descriptionFields.background ?? "",
    aims: descriptionFields.aims ?? "",
    methods: descriptionFields.methods ?? "",
    results: descriptionFields.results ?? "",
    summary_conclusion: descriptionFields.summary_conclusion ?? "",
    keywords: descriptionFields.keywords ?? "",
    abstract_text: [
      descriptionFields.background,
      descriptionFields.aims,
      descriptionFields.methods,
      descriptionFields.results,
      descriptionFields.summary_conclusion,
    ]
      .filter(Boolean)
      .join("\n\n"),
    description_text: descriptionFields.description_text,
    authors: authors.length ? authors : [authorNameFromHref(item.href)].filter(Boolean),
    affiliations: [...new Set(coAuthors.map((author) => stripTags(author.affiliation ?? "")).filter(Boolean))],
    source_conf: {
      c_id: conf.c_id,
      tab_id: conf.tab_id,
      owner: conf.c_owner,
    },
  };
}

async function getAllPages(route, params) {
  const first = await postJson(route, { ...params, getpage: 1 });
  const pages = [first];
  for (let page = 2; page <= Number(first.total_pages ?? 1); page += 1) {
    pages.push(await postJson(route, { ...params, getpage: page }));
  }
  return pages;
}

async function getMarkers() {
  const pages = await getAllPages("/listing/markers", {
    menu: 6,
    browseby: 3,
    sortby: 2,
    ce_id: CE_ID,
  });
  return pages
    .flatMap((page) => extractLinkedCards(page.html, "banner"))
    .map((card) => ({
      marker_id: markerIdFromUrl(card.href),
      marker_name: card.title || card.text,
      marker_href: card.href,
    }))
    .filter((marker) => marker.marker_id);
}

async function getTopics(marker) {
  if (marker.marker_name === "Plenary Abstract Session") return [];
  const pages = await getAllPages("/listing/events/banners", {
    menu: 6,
    browseby: 7,
    sortby: 6,
    media: 3,
    ce_id: CE_ID,
    marker: marker.marker_id,
  });
  return pages
    .flatMap((page) => extractLinkedCards(page.html, "banner"))
    .map((card) => ({
      topic_id: topicIdFromUrl(card.href),
      topic_name: card.title || card.text,
      topic_href: card.href,
    }))
    .filter((topic) => topic.topic_id);
}

async function getListingForContext(marker, topic = null) {
  const params = {
    menu: 6,
    browseby: 8,
    sortby: 6,
    media: 3,
    ce_id: CE_ID,
    marker: marker.marker_id,
    ot_id: topic?.topic_id,
  };
  const pages = await getAllPages("/listing/conferences", params);
  const context = {
    event: EVENT_NAME,
    ce_id: Number(CE_ID),
    marker_id: marker.marker_id,
    marker_name: marker.marker_name,
    topic_id: topic?.topic_id ?? null,
    topic_name: topic?.topic_name ?? "",
  };
  return pages.flatMap((page) => extractConferenceItems(page.html, context));
}

function toCsv(rows) {
  const columns = [
    "content_id",
    "event",
    "marker_name",
    "topic_name",
    "abstract_number",
    "eha_abstract_id",
    "title",
    "date",
    "presentation_type",
    "session_title",
    "authors",
    "affiliations",
    "keywords",
    "background",
    "aims",
    "methods",
    "results",
    "summary_conclusion",
    "href",
  ];
  const escape = (value) => {
    const normalized = Array.isArray(value) ? value.join("; ") : value ?? "";
    return `"${String(normalized).replace(/"/g, '""')}"`;
  };
  return [columns.join(","), ...rows.map((row) => columns.map((column) => escape(row[column])).join(","))].join("\n");
}

async function mapLimited(items, limit, mapper) {
  const results = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: limit }, async () => {
    while (next < items.length) {
      const index = next;
      next += 1;
      try {
        results[index] = await mapper(items[index], index);
      } catch (error) {
        results[index] = { ...items[index], detail_error: error.message };
      }
      if ((index + 1) % 100 === 0) {
        console.log(`Fetched details for ${index + 1}/${items.length}`);
      }
    }
  });
  await Promise.all(workers);
  return results;
}

async function main() {
  await fs.mkdir(RAW_DIR, { recursive: true });

  const markers = await getMarkers();
  await fs.writeFile(path.join(RAW_DIR, "markers.json"), JSON.stringify(markers, null, 2));
  console.log(`Markers: ${markers.length}`);

  const topicRows = [];
  const listings = [];
  for (const marker of markers) {
    if (/late-breaking/i.test(marker.marker_name)) {
      console.log(`Skipping ${marker.marker_name}: listed as coming soon`);
      continue;
    }

    const topics = await getTopics(marker);
    topicRows.push(...topics.map((topic) => ({ ...marker, ...topic })));

    if (topics.length === 0) {
      const rows = await getListingForContext(marker);
      listings.push(...rows);
      console.log(`${marker.marker_name}: ${rows.length} items`);
      continue;
    }

    let markerCount = 0;
    for (const topic of topics) {
      const rows = await getListingForContext(marker, topic);
      listings.push(...rows);
      markerCount += rows.length;
    }
    console.log(`${marker.marker_name}: ${markerCount} items across ${topics.length} topics`);
  }

  const uniqueListings = Array.from(
    new Map(listings.filter((item) => item.content_id).map((item) => [`${item.content_id}:${item.marker_id}`, item])).values(),
  );
  await fs.writeFile(path.join(RAW_DIR, "topics.json"), JSON.stringify(topicRows, null, 2));
  await fs.writeFile(path.join(OUT_DIR, "eha_2026_listings.json"), JSON.stringify(uniqueListings, null, 2));

  console.log(`Unique listing rows: ${uniqueListings.length}`);
  const detailed = await mapLimited(uniqueListings, 6, extractDetail);
  await fs.writeFile(path.join(OUT_DIR, "eha_2026_abstracts.json"), JSON.stringify(detailed, null, 2));
  await fs.writeFile(path.join(OUT_DIR, "eha_2026_abstracts.jsonl"), detailed.map((row) => JSON.stringify(row)).join("\n") + "\n");
  await fs.writeFile(path.join(OUT_DIR, "eha_2026_abstracts.csv"), toCsv(detailed));

  const errors = detailed.filter((row) => row.detail_error);
  const summary = {
    source_url: START_URL,
    scraped_at: new Date().toISOString(),
    markers,
    topics: topicRows.length,
    listing_rows: uniqueListings.length,
    detail_rows: detailed.length,
    detail_errors: errors.length,
  };
  await fs.writeFile(path.join(OUT_DIR, "summary.json"), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
