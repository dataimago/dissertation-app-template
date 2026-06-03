# raw/ — your source materials

This directory holds the original documents you provided at dissertation.ai
onboarding (Section 5 + Q21 uploads), plus anything you add later as your
dissertation evolves.

**The AI agent in this repo treats `raw/` as READ-ONLY.** It will summarize,
analyze, cite, and link to these files — but it never modifies them. That
guarantee is what lets you put load-bearing source material here (PDFs you
need to keep verbatim, advisor writings, institutional formatting guidelines)
without worrying that an AI session might rewrite history.

The companion directory is `wiki/` (when present). The AI agent **owns**
`wiki/` — its analyses, annotations, indexing, glossary, and bibliography
all live there, derived from the raw/ contents.

## Categories

Subdirectories correspond to the dissertation onboarding interview's
document-bundle categories. Each was chosen because the AI tools weight
documents differently based on role.

| Subdirectory | What it holds | Onboarding source |
|---|---|---|
| `research/` | Papers + materials your dissertation engages with — sources you cite, methodologies you extend, prior empirical work you compare to | Q17 (researchDocuments) |
| `advisor/` | Writings by your advisor + committee members. Influences prose-style modeling so your AI assistant matches what your committee expects | Q18 (advisorWritings) |
| `style/` | Exemplar dissertations or papers whose structure, voice, or formatting you want to emulate. Voice-modeling source | Q19 (styleExemplars) |
| `background/` | Department style guides, course readings, methodological references that shape your thinking but aren't directly cited | Q20 (backgroundDocuments) |
| `thesis-formatting/` | Your institution's grad-school formatting guidelines. Used by AI to refine `ui/www/thesis.cls` in the user's R-package submodule when `classFile.type = generated` | Q21 (thesisFormatGuidelines) |

## Adding more materials over time

The five categories aren't a fixed schema — they're the seed set the
interview captured at onboarding. You can:

- Add more files to any existing subdirectory (the AI agent will pick them
  up on its next read-pass)
- Add new subdirectories for new categories your dissertation acquires
  (`raw/datasets/`, `raw/interviews/`, `raw/regulatory-filings/`, …)
- Add a brief `README.md` inside any subdirectory explaining what it holds
  if the category isn't self-evident

If you add new categories, update `dataimago-spec.yaml` so the spec's
`vertical.dissertation.context` block reflects them. Your AI assistant can
help with that — ask it to read the new subdirectory + extend the spec.

## File-type recommendations

- **PDFs** are preferred for academic papers + institutional documents.
  Searchable + universally readable. Convert Word docs to PDF first.
- **Markdown + plain text** are fine for notes, transcripts, etc.
- **Images** (PNG / JPEG / WebP) for scanned signature pages, figure
  source materials, etc.
- **Avoid `.docx`, `.pptx`, proprietary formats** — they're opaque to the
  AI's reading tools.

## File-size considerations

- Per-file: ~100MB is the practical upper bound (GitHub Contents API
  imposes hard limits; large PDFs slow git operations).
- For repos with >100MB of cumulative raw/ content, consider Git LFS for
  `*.pdf` (the template's `.gitattributes` can be extended; D.2.2.a §11
  has the recommended pattern).
