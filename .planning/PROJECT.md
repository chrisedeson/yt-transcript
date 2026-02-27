# YouTube Transcript Tool

## What This Is

A free web application that generates clean, formatted transcripts from YouTube videos. Users paste a URL, configure output options (timestamps, language, translation), and get instant transcripts with optional AI-powered cleanup. Built with a Linear-inspired minimalist UI.

## Core Value

Anyone can get clean, professional YouTube transcripts instantly and completely free - no accounts, no payments, no limits.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] User can paste YouTube URL and generate transcript
- [ ] User can toggle timestamp inclusion before generating
- [ ] User can select transcript language if video has multiple tracks
- [ ] User can request translation to another language before generating
- [ ] Generated transcript displays with collapsible video metadata (title, channel, description)
- [ ] User can view transcript in both Plain Text and Markdown formats (tabs)
- [ ] User can copy transcript with one click
- [ ] User can apply basic spell check (dictionary-based typo fixes) with side-by-side comparison
- [ ] User can apply AI cleanup (punctuation, paragraphs, grammar) with side-by-side comparison
- [ ] User can undo cleanup to restore original transcript
- [ ] AI cleanup uses Gemini API first (free tier), falls back to OpenAI when limit reached
- [ ] Linear-inspired dark theme UI with purple/blue accents, smooth animations, minimalist design

### Out of Scope

- User accounts or authentication — just a tool, stays simple and anonymous
- Storing transcripts in database — generate on-demand only, no backend storage
- Paid features or subscriptions — must remain 100% free forever
- Video downloading or modification — transcripts only, not video manipulation
- Batch processing multiple videos — one video at a time keeps UX focused
- Support for non-YouTube platforms — YouTube only for v1

## Context

**Existing Work:**
- User has working Python script that calls youtube-transcript.io API
- Script extracts video ID, fetches transcript, formats as markdown with metadata
- API key already provisioned: youtube-transcript.io

**API Resources:**
- YouTube Transcript API: youtube-transcript.io (paid API, already have key)
- Google Gemini: Free tier for AI cleanup (primary, rate-limited)
- OpenAI GPT: Backup when Gemini hits limits (also rate-limited but different pool)

**Design Inspiration:**
- Linear.app aesthetic: dark theme, subtle borders, clean typography, purple/blue accents
- Reference images provided showing Linear's project views, timelines, and minimal UI patterns
- Focus on content-first, distraction-free experience

**Technical Environment:**
- Next.js with API routes (frontend and backend in one app)
- Vercel free tier deployment
- No separate backend server needed
- Environment variables for API keys

## Constraints

- **Hosting**: Vercel free tier only — no paid hosting costs allowed
- **APIs**: Must use free tiers — Gemini primary, OpenAI backup to maximize free usage
- **Tech stack**: Next.js (TypeScript) for modularity and type safety
- **Performance**: Must handle API rate limits gracefully without breaking UX
- **Design**: Must match Linear aesthetic — no generic Bootstrap/Material UI looks
- **Code quality**: Modular architecture, separation of concerns, DRY principle, no files over 200 lines
- **Scalability**: Serverless architecture, stateless API routes, no sessions or databases

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js over FastAPI + React | User's Python script works but web app needs full-stack. Next.js API routes = one deploy, free on Vercel, no cold starts. FastAPI on Render = cold starts, split deploys, more complexity. | — Pending |
| Gemini-first with OpenAI fallback | Gemini free tier is generous for cleanup use case. OpenAI as backup ensures service never fully breaks. Maximize free tier usage. | — Pending |
| Side-by-side comparison for cleanup | Showing original vs cleaned side-by-side (instead of in-place replacement) gives user confidence and choice. Undo is clearer. | — Pending |
| No user accounts | Keeping app anonymous and stateless = simpler architecture, faster to build, no GDPR concerns, perfectly aligned with "just paste and get" UX. | — Pending |
| Collapsible metadata | Video title/channel/description is useful context but shouldn't clutter the transcript view. Collapsible section keeps focus on content. | — Pending |

---
*Last updated: 2025-01-30 after initialization*
