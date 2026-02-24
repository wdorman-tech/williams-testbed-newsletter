---
name: newsletter-article-formatter
description: Converts pasted articles into CMS-ready markdown body for this project and keeps output compatible with react-markdown + newsletter HTML rendering.
---

# Newsletter CMS Body Formatter

## Task

When given a pasted article, return cleaned markdown for this project's CMS `Content (Markdown)` textarea.

## Output rules

- Return only the requested output contents
- No explanations, no extra text
- Output body markdown only (no frontmatter)
- Do not include YAML, metadata keys, or wrapper text

## react-markdown compatibility rules

- Use standard markdown only (CommonMark/GFM-safe)
- Start body headings at `##` (not `#`) because article title is rendered by CMS metadata
- Keep heading hierarchy valid (`##` then `###`, avoid random jumps)
- Prefer fenced code blocks with language tags when possible
- Ensure links are valid markdown: `[label](https://...)`
- Ensure images are valid markdown: `![alt](https://...)`
- Do not emit raw HTML unless explicitly requested
- No JSX, no MDX syntax, no custom component tags
- Normalize smart quotes/dashes if they break markdown parsing
- Remove YAML frontmatter if pasted
- Remove duplicated opening H1 title if present

## Body cleanup

- Preserve paragraphs, lists, quotes, code, and links
- Fix malformed list markers and broken line wraps
- Keep tone/content unchanged; only format for correctness/readability
- Keep one blank line between paragraphs/blocks

## CMS paste guidance

- Output is intended for the CMS body field only
- Metadata must be filled in CMS inputs (title, slug, excerpt, category, author, publishedAt, readMinutes, trending, draft, isPrivate, heroImage)

## Template

```markdown
## Section Heading

Body markdown only, no frontmatter.
```
