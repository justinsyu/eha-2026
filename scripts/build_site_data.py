import json
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data" / "eha_2026_abstracts.json"
SUMMARY = ROOT / "data" / "summary.json"
TARGET = ROOT / "assets" / "data" / "presentations-index.json"
MARKDOWN_TARGET = ROOT / "assets" / "data" / "eha_2026_abstracts.md"


def compact_text(value, limit=None):
    if isinstance(value, list):
        value = "; ".join(str(item) for item in value if item)
    text = " ".join(str(value or "").split())
    if limit and len(text) > limit:
        return text[: limit - 1].rstrip() + "..."
    return text


def section_map(record):
    labels = [
        ("Background", "background"),
        ("Aims", "aims"),
        ("Methods", "methods"),
        ("Results", "results"),
        ("Summary/Conclusion", "summary_conclusion"),
    ]
    return {label: compact_text(record.get(key)) for label, key in labels if compact_text(record.get(key))}


def structure_label(record):
    sections = section_map(record)
    if {"Methods", "Results", "Summary/Conclusion"}.issubset(sections):
        return "Structured abstract"
    if sections:
        return "Partial abstract text"
    return "Metadata and keywords"


def normalize_record(record):
    sections = section_map(record)
    authors = record.get("authors") or []
    affiliations = record.get("affiliations") or []
    summary_source = record.get("abstract_text") or record.get("description_text") or record.get("background")
    marker = record.get("marker_name") or "Unspecified"
    topic = record.get("topic_name") or "Unspecified"
    abstract_number = record.get("abstract_number") or ""
    eha_abstract_id = record.get("eha_abstract_id") or ""
    content_id = record.get("content_id")

    return {
        "uid": f"eha-{content_id}",
        "content_id": content_id,
        "abstract_number": abstract_number,
        "eha_abstract_id": eha_abstract_id,
        "display_code": abstract_number or eha_abstract_id or f"ID {content_id}",
        "title": compact_text(record.get("title")),
        "summary": compact_text(summary_source, 760),
        "authors_text": compact_text(authors),
        "affiliations_text": compact_text(affiliations),
        "authors": authors,
        "marker": marker,
        "topic": topic,
        "presentation_type": record.get("presentation_type") or marker,
        "session_title": record.get("session_title") or topic,
        "date": record.get("date") or "",
        "keywords": compact_text(record.get("keywords")),
        "structure": structure_label(record),
        "has_abstract_text": bool(compact_text(record.get("abstract_text"))),
        "has_structured_sections": bool(sections) and structure_label(record) == "Structured abstract",
        "sections": sections,
        "source_url": record.get("href") or "",
    }


def option_counts(records, key):
    counts = Counter(record[key] for record in records)
    return [{"name": name, "count": count} for name, count in counts.most_common()]


def markdown_value(value):
    return compact_text(value) or "Not available"


def markdown_record(record):
    normalized = normalize_record(record)
    sections = section_map(record)
    lines = [
        f"## {normalized['display_code']} - {normalized['title'] or 'Untitled record'}",
        "",
        f"- Content ID: {markdown_value(record.get('content_id'))}",
        f"- EHA abstract ID: {markdown_value(record.get('eha_abstract_id'))}",
        f"- Abstract number: {markdown_value(record.get('abstract_number'))}",
        f"- Record group: {markdown_value(record.get('marker_name'))}",
        f"- Topic/session: {markdown_value(record.get('topic_name') or record.get('session_title'))}",
        f"- Presentation type: {markdown_value(record.get('presentation_type'))}",
        f"- Date: {markdown_value(record.get('date'))}",
        f"- Keywords: {markdown_value(record.get('keywords'))}",
        f"- Source URL: {markdown_value(record.get('href'))}",
        "",
    ]

    if normalized["authors_text"]:
        lines.extend(["### Authors", "", normalized["authors_text"], ""])
    if normalized["affiliations_text"]:
        lines.extend(["### Affiliations", "", normalized["affiliations_text"], ""])

    if sections:
        for label, body in sections.items():
            lines.extend([f"### {label}", "", body, ""])
    elif compact_text(record.get("description_text")):
        lines.extend(["### Abstract text", "", compact_text(record.get("description_text")), ""])
    else:
        lines.extend(["### Abstract text", "", "No abstract body text was available for this record.", ""])

    return "\n".join(lines).rstrip()


def write_markdown(summary, records):
    lines = [
        "# EHA 2026 Conference Abstracts",
        "",
        "Plain-text Markdown export of the EHA 2026 conference data archive.",
        "",
        "## Dataset Summary",
        "",
        f"- Records: {len(records)}",
        f"- Source URL: {summary.get('source_url', 'Not available')}",
        f"- Scraped at: {summary.get('scraped_at', 'Not available')}",
        f"- Detail errors: {summary.get('detail_errors', 'Not available')}",
        "",
        "## Records",
        "",
    ]
    lines.extend(markdown_record(record) + "\n" for record in records)
    MARKDOWN_TARGET.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")
    print(f"Wrote {MARKDOWN_TARGET.relative_to(ROOT)} with {len(records)} records")


def main():
    source_records = json.loads(SOURCE.read_text(encoding="utf-8"))
    summary = json.loads(SUMMARY.read_text(encoding="utf-8")) if SUMMARY.exists() else {}
    records = [normalize_record(record) for record in source_records]

    out = {
        "artifact_type": "eha_2026_conference_browser_index",
        "created_at_utc": summary.get("scraped_at"),
        "source": summary.get("source_url"),
        "record_count": len(records),
        "abstract_text_count": sum(1 for record in records if record["has_abstract_text"]),
        "structured_count": sum(1 for record in records if record["has_structured_sections"]),
        "source_url_count": sum(1 for record in records if record["source_url"]),
        "markers": option_counts(records, "marker"),
        "topics": option_counts(records, "topic"),
        "presentation_types": option_counts(records, "presentation_type"),
        "structures": option_counts(records, "structure"),
        "presentations": records,
    }

    TARGET.parent.mkdir(parents=True, exist_ok=True)
    TARGET.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"Wrote {TARGET.relative_to(ROOT)} with {len(records)} records")
    write_markdown(summary, source_records)


if __name__ == "__main__":
    main()
