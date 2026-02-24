---
name: article-formatter
description: Ensures every new or updated .md file in src/content/articles/ strictly adheres to the project's required frontmatter and structure. Use when a new article is created, an existing one is updated, or the user asks to "format this article" or "fix the frontmatter".
---

# Article Formatter

This skill ensures consistent formatting for all articles in the `src/content/articles/` directory.

## Instructions

When an article file in `src/content/articles/` is created or modified, or when requested:

1.  **Read Template:** Always read `src/content/articles/article-template.md` first to identify the current required keys and format.
2.  **Analyze Target:** Read the target article file.
3.  **Reformat Frontmatter:**
    -   Ensure the file starts with `---` and ends the frontmatter block with `---`.
    -   **Required Keys & Defaults:**
        -   `title`: String. If missing, use the first H1 (`# ...`) from the body.
        -   `excerpt`: String. A short summary sentence.
        -   `category`: Must be one of: `automation`, `marketing`, `my-workflow`, `my-tools`.
        -   `publishedAt`: ISO date string (`YYYY-MM-DD`).
        -   `readMinutes`: Integer. If missing, estimate based on 200 words per minute.
        -   `author`: Default to "William".
        -   `draft`: Boolean. Default `true` for new files.
        -   `trending`: Boolean. Default `false`.
4.  **Clean Body:** Ensure exactly one newline exists after the closing `---` before the article body starts.
5.  **Apply Changes:** Update the file with the corrected format.

## Examples

### Missing Title and ReadMinutes
**Input:**
```markdown
---
category: "automation"
excerpt: "A guide to Zapier."
---
# My Zapier Guide
This is the body...
```

**Output:**
```markdown
---
title: "My Zapier Guide"
excerpt: "A guide to Zapier."
category: "automation"
publishedAt: "2026-02-23"
readMinutes: 1
author: "William"
draft: true
trending: false
---

# My Zapier Guide
This is the body...
```
