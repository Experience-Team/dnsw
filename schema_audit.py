import csv
import json
import time
import sys
from pathlib import Path

import requests
from bs4 import BeautifulSoup
import anthropic

SYSTEM_PROMPT = (
    "You are a schema markup auditor for tourism websites. You will receive the page title, "
    "meta description, existing JSON-LD, and a sample of body text from a web page. First, "
    "identify the single most appropriate Schema.org type for this page. Then audit any existing "
    "markup against that type's required and recommended fields. Return only valid JSON with these "
    "keys: schema_type (string), completeness_score (integer 0-100), missing_fields (array of "
    "strings), corrected_jsonld (a complete corrected JSON-LD object with all available fields "
    "populated from the page content). Do not include any explanation or markdown formatting. "
    "Return raw JSON only."
)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    )
}

OUTPUT_CSV = "output.csv"
ERRORS_FILE = "errors.txt"
URLS_FILE = "urls.txt"
REQUEST_DELAY = 2


def fetch_page(url: str) -> bytes:
    response = requests.get(url, headers=HEADERS, timeout=15)
    response.raise_for_status()
    return response.content


def extract_page_data(html: bytes) -> dict:
    soup = BeautifulSoup(html, "html.parser")

    title = soup.title.string.strip() if soup.title and soup.title.string else ""

    meta_desc = ""
    meta_tag = soup.find("meta", attrs={"name": "description"})
    if meta_tag and meta_tag.get("content"):
        meta_desc = meta_tag["content"].strip()

    jsonld_blocks = []
    for tag in soup.find_all("script", type="application/ld+json"):
        if tag.string:
            jsonld_blocks.append(tag.string.strip())

    for tag in soup(["script", "style", "noscript", "header", "footer", "nav"]):
        tag.decompose()
    body_text = " ".join(soup.get_text(separator=" ").split())[:2000]

    return {
        "title": title,
        "meta_description": meta_desc,
        "existing_jsonld": jsonld_blocks,
        "body_text": body_text,
    }


def build_user_prompt(url: str, data: dict) -> str:
    jsonld_str = json.dumps(data["existing_jsonld"], indent=2) if data["existing_jsonld"] else "None"
    return (
        f"URL: {url}\n\n"
        f"Page Title: {data['title']}\n\n"
        f"Meta Description: {data['meta_description']}\n\n"
        f"Existing JSON-LD:\n{jsonld_str}\n\n"
        f"Body Text Sample:\n{data['body_text']}"
    )


def audit_with_claude(client: anthropic.Anthropic, user_prompt: str) -> dict:
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2048,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_prompt}],
    )
    raw = message.content[0].text.strip()
    return json.loads(raw)


def log_error(url: str, error: str) -> None:
    with open(ERRORS_FILE, "a", encoding="utf-8") as f:
        f.write(f"{url}\t{error}\n")
    print(f"  ERROR: {error}", file=sys.stderr)


def main() -> None:
    urls_path = Path(URLS_FILE)
    if not urls_path.exists():
        sys.exit(f"'{URLS_FILE}' not found in current directory.")

    urls = [line.strip() for line in urls_path.read_text().splitlines() if line.strip()]
    if not urls:
        sys.exit(f"'{URLS_FILE}' is empty.")

    client = anthropic.Anthropic()

    # Clear errors file for this run
    Path(ERRORS_FILE).write_text("")

    csv_columns = [
        "url",
        "page_title",
        "schema_type_detected",
        "schema_found",
        "completeness_score",
        "missing_fields",
        "corrected_jsonld",
    ]

    with open(OUTPUT_CSV, "w", newline="", encoding="utf-8") as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=csv_columns)
        writer.writeheader()

        for i, url in enumerate(urls):
            print(f"[{i + 1}/{len(urls)}] {url}")

            row = {
                "url": url,
                "page_title": "",
                "schema_type_detected": "",
                "schema_found": "no",
                "completeness_score": "",
                "missing_fields": "",
                "corrected_jsonld": "",
            }

            try:
                html = fetch_page(url)
            except requests.exceptions.Timeout:
                log_error(url, "Request timed out")
                writer.writerow(row)
                time.sleep(REQUEST_DELAY)
                continue
            except requests.exceptions.HTTPError as e:
                log_error(url, f"HTTP error: {e}")
                writer.writerow(row)
                time.sleep(REQUEST_DELAY)
                continue
            except requests.exceptions.RequestException as e:
                log_error(url, f"Request failed: {e}")
                writer.writerow(row)
                time.sleep(REQUEST_DELAY)
                continue

            try:
                page_data = extract_page_data(html)
            except Exception as e:
                log_error(url, f"HTML parsing failed: {e}")
                writer.writerow(row)
                time.sleep(REQUEST_DELAY)
                continue

            row["page_title"] = page_data["title"]
            row["schema_found"] = "yes" if page_data["existing_jsonld"] else "no"

            try:
                user_prompt = build_user_prompt(url, page_data)
                result = audit_with_claude(client, user_prompt)
            except json.JSONDecodeError as e:
                log_error(url, f"Claude returned invalid JSON: {e}")
                writer.writerow(row)
                time.sleep(REQUEST_DELAY)
                continue
            except anthropic.APIError as e:
                log_error(url, f"Anthropic API error: {e}")
                writer.writerow(row)
                time.sleep(REQUEST_DELAY)
                continue
            except Exception as e:
                log_error(url, f"Unexpected error during audit: {e}")
                writer.writerow(row)
                time.sleep(REQUEST_DELAY)
                continue

            row["schema_type_detected"] = result.get("schema_type", "")
            row["completeness_score"] = result.get("completeness_score", "")
            missing = result.get("missing_fields", [])
            row["missing_fields"] = "; ".join(missing) if isinstance(missing, list) else str(missing)
            corrected = result.get("corrected_jsonld", {})
            row["corrected_jsonld"] = json.dumps(corrected, ensure_ascii=False)

            writer.writerow(row)
            print(f"  Done — {row['schema_type_detected']} | score: {row['completeness_score']}")

            time.sleep(REQUEST_DELAY)

    print(f"\nFinished. Results written to '{OUTPUT_CSV}'. Errors (if any) in '{ERRORS_FILE}'.")


if __name__ == "__main__":
    main()
