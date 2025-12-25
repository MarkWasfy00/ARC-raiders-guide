#!/usr/bin/env python3
"""
Fetch workbench data from ARC Raiders Wiki using Playwright
This script extracts all workbench stations, their levels, requirements, and craftable items
"""

import json
import sys
import os
from datetime import datetime

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print("Error: Playwright is not installed.")
    print("Install it with: pip install playwright")
    print("Then run: playwright install")
    sys.exit(1)


def fetch_workbenches():
    """Fetch workbench data from the ARC Raiders Wiki"""

    url = "https://arcraiders.wiki/wiki/Workshop"

    # JavaScript to extract workbench data from the page
    extract_script = """
(() => {
  const workbenches = [];
  const tabberPanels = document.querySelectorAll('.tabber__panel');

  tabberPanels.forEach(panel => {
    const title = panel.getAttribute('id').replace('tabber-', '').replace(/_/g, ' ');
    const rows = panel.querySelectorAll('table.wikitable tbody tr');

    const levels = [];
    rows.forEach((row, index) => {
      if (index === 0) return; // Skip header row

      const cells = row.querySelectorAll('td');
      if (cells.length < 3) return;

      const level = cells[0].textContent.trim();
      const requirementsList = cells[1].querySelectorAll('li');
      const craftsList = cells[2].querySelectorAll('li');

      const requirements = Array.from(requirementsList).map(li => {
        const text = li.textContent.trim();
        const link = li.querySelector('a');
        const itemName = link ? link.getAttribute('title') : null;

        // Parse quantity and item name from text like "20x Metal Parts"
        const match = text.match(/^(\\d+)x\\s+(.+)$/);
        if (match) {
          return {
            quantity: parseInt(match[1]),
            item: itemName || match[2]
          };
        }
        return { text, itemName };
      });

      const crafts = Array.from(craftsList).map(li => {
        const link = li.querySelector('a');
        return link ? link.getAttribute('title') : li.textContent.trim();
      });

      levels.push({
        level: parseInt(level),
        requirements,
        crafts
      });
    });

    workbenches.push({
      name: title,
      levels
    });
  });

  // Extract Scrappy data
  const scrappyRows = document.querySelectorAll('#citizen-section-2 table.wikitable tbody tr');
  const scrappyLevels = [];

  scrappyRows.forEach((row, index) => {
    if (index === 0) return; // Skip header

    const cells = row.querySelectorAll('td');
    if (cells.length < 3) return;

    const levelText = cells[0].textContent.trim();
    const requirementsList = cells[1].querySelectorAll('li');
    const rates = cells[2].textContent.trim();

    const requirements = Array.from(requirementsList).map(li => {
      const text = li.textContent.trim();
      const link = li.querySelector('a');
      const itemName = link ? link.getAttribute('title') : null;

      const match = text.match(/^(\\d+)x\\s+(.+)$/);
      if (match) {
        return {
          quantity: parseInt(match[1]),
          item: itemName || match[2]
        };
      }
      return { text, itemName };
    });

    scrappyLevels.push({
      level: levelText,
      requirements,
      rates
    });
  });

  return {
    workbenches,
    scrappy: {
      name: "Scrappy",
      description: "This rooster has been a resident of the workshop since the day you moved in, and likely long before that. Will periodically bring back dubiously-sourced materials and share them with you.",
      passiveItems: ["Metal Parts", "Fabric", "Plastic Parts", "Chemicals", "Rubber Parts", "Assorted Seeds"],
      levels: scrappyLevels
    },
    metadata: {
      source: "https://arcraiders.wiki/wiki/Workshop",
      fetchedAt: new Date().toISOString()
    }
  };
})()
"""

    print(f"Fetching workbench data from {url}...")

    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the page
        print("Loading page...")
        page.goto(url, wait_until="networkidle")

        # Wait for the content to load
        page.wait_for_selector('.tabber__panel')

        # Execute the extraction script
        print("Extracting data...")
        data = page.evaluate(extract_script)

        # Close browser
        browser.close()

        print(f"✓ Extracted {len(data['workbenches'])} workbench stations")
        print(f"✓ Extracted Scrappy with {len(data['scrappy']['levels'])} levels")

        return data


def save_to_json(data, filename):
    """Save the extracted data to a JSON file"""

    # Ensure directory exists
    os.makedirs(os.path.dirname(filename) if os.path.dirname(filename) else '.', exist_ok=True)

    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"\n✓ Data saved to {filename}")

    # Print file size
    file_size = os.path.getsize(filename)
    print(f"✓ File size: {file_size:,} bytes ({file_size/1024:.1f} KB)")


if __name__ == "__main__":
    print("=" * 60)
    print("ARC Raiders Workshop Data Fetcher")
    print("=" * 60)
    print()

    try:
        # Fetch data
        data = fetch_workbenches()

        # Save to JSON file
        output_file = os.path.join(os.path.dirname(__file__), "workbenches.json")
        save_to_json(data, output_file)

        # Print summary
        print()
        print("Summary:")
        print(f"  - Total workbenches: {len(data['workbenches'])}")
        for wb in data['workbenches']:
            print(f"    • {wb['name']}: {len(wb['levels'])} levels")
        print(f"  - Scrappy levels: {len(data['scrappy']['levels'])}")
        print()
        print("Done! ✓")

    except Exception as e:
        print(f"\n✗ Error: {e}", file=sys.stderr)
        sys.exit(1)
