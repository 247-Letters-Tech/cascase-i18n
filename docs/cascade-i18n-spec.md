
# Cascade i18n System – Full Specification

*Version 1.0 – April 2025*

---

## 1 · Purpose
SkillPath (and any future product) needs a **light‑weight, fast, deeply‑customisable internationalisation stack** that can:

* support Indian pure + mixed‑coda variants (e.g. Tamil + Tanglish),
* personalise labels by **persona**, **mode/tone**, **geography**, **dialect**, **goal‑type**, **AI fine‑tuning**, and **hot‑fixes**,
* allow runtime dialect switching with visual preview (e.g. Kongu‑Tanglish), and
* be shipped as a stand‑alone library + CLI + CI/CD toolkit that any LLM coding agent can introspect and extend.

---

## 2 · Patch Layer Model (Merge Order)
```
module → persona → mode → geography → dialect → goal → AI patch → hot‑fix
```
1. **Module** – Base labels per functional area (`roadmap`, `mindmap`, `auth`, `ai`).  
2. **Persona** – User‑type specifics (student / professional / manager …).  
3. **Mode** – Tone or vibe (zen / roast / bro …).  
4. **Geography** – Regional localisation (IN‑en, US‑en, `ta‑tg`).  
5. **Dialect overlay** – Hyper‑local slang override (`ta‑tg_kongu`, `ta‑tg_madurai`). Switchable at runtime via preview dialog.  
6. **Goal** – Context of the roadmap (web‑dev, startup, art‑therapy …).  
7. **AI Patch** – Cascade micro‑tuning from usage signals or LLM suggestions.  
8. **Hot‑fix** – Ops/A‑B/urgent overrides; always wins.

> Dialect overlays are intentionally **separate** from geography patches so they can be toggled or previewed without reloading the entire regional bundle.

---

## 3 · File & URL Organisation
```
locales/
  en/roadmap.json
  en/roadmap_student.json
  en/_tones/zen/roadmap.json
  ta/roadmap.json                 # Pure Tamil
  ta-tg/roadmap.json              # Tanglish
  ta-tg_kongu/roadmap.json        # Kongu Tanglish dialect
  manifest.json                   # auto‑generated
```
CDN path template: `https://cdn.skillpath.com/i18n/{lang}/{path}.json`.

---

## 4 · Runtime Engine (`cascade-i18n-core`)
* **`initI18n(lang, config, persona?, mode?)`** – bootstraps `i18next` with `HttpBackend`, loads manifest.
* **`applyPatches(lang, persona?, mode?, extras?)`** – pulls required JSONs, deep‑merges via `deepmerge.all`, adds bundles to `i18next`.
* **`applyDialectPatch(lang, dialectKey)`** – runtime overlay for dialect switching.
* **`diffLabels(current, proposed)`** – returns `{key, oldValue, newValue}[]` for preview.
* Caches merged dictionaries in memory; respects `fallbackLng` chain (`ta‑tg` → `ta` → `en`).

---

## 5 · CLI Tool (`cascade-i18n-cli`)
| Command | Description |
|---------|-------------|
| `init` | Scaffold locale folders, sample JSONs, TS config. |
| `add-language <code>` | Create new pure/mixed language skeleton. |
| `add-module <name>` | Add module JSON templates under each language. |
| `add-persona <persona>` | Create persona patch templates. |
| `add-mode <mode>` | Create mode tone templates. |
| `build-manifest` | Scan `locales/` → emit `manifest.json`. |
| `translate <lang>` | Auto‑translate missing keys via chosen LLM/MT API. |
| `generate-combinations` | Produce persona+mode permutations with LLM. |
| `patch-ai` | Generate/refresh AI fine‑tune layer for select users. |

---

## 6 · CI/CD Workflow & Artifact Publishing

A GitHub Actions template validates locales, translates gaps, and *either* stores the bundle as a build artifact, commits back to Git, **or** uploads to a storage/CDN (Supabase, S3, Cloudflare R2 etc.). The upload target is selected via the `STORAGE_TARGET` env var.

---

## 13 · Enterprise‑Readiness Checklist (Highlights)

### Security & Compliance
* **Secrets hygiene** – ENV/Vault only; leak scan in CI  
* **Audit trail** – Signed JSON logs  
* **PII linting** – Build fails if personal data detected  

### Translation Governance
* Glossary, Translation Memory, branch‑per‑locale previews, multi‑step review, in‑context screenshots, Slack approvals  

### Delivery Resilience
* Bundle version pinning (`/v1/…` paths)  
* Edge variant negotiation (Cloudflare Worker merge)  
* Offline bundles for PWA  
* Rollback toggle via feature flag  

### Observability
* Hit counts → PostHog/Segment  
* Acceptance % for dialect switch  
* Patch load latency via `performance.measure`  
* 404 miss detection → Prometheus  

### Cost Controls
* LLM quota guard  
* Diff‑aware uploads  
* Smart prefetch  
* Tree‑shakable ESM export  

### Multi‑Tenant SaaS
* Tenant namespace in path or header  
* Per‑tenant manifest & quotas  

---

## 13.11 LLM Integration & Managed API

| Mode | How it works |
|------|--------------|
| **BYOK** | Developer supplies their own LLM key/model; CLI uses it directly. |
| **Managed API** | Call `POST /api/i18n/translate`; our service batches, caches, QA checks and returns patch. Traffic stats auto‑trigger new language/dialect generation. |

CDN hosting is provided at `https://i18n-cdn.skillpath.com/...` backed by Cloudflare R2 + Workers.

---

## 13.12 Managed API Reference (v1)

### POST `/api/i18n/translate`
```json
{ "lang": "ta-tg", "keys": { "create_goal": "Create Goal" }, "tone": "zen" }
```
Returns → `{ "patchUrl": "https://…/ta-tg/_tones/zen/roadmap.json", "tokens": 823 }`

### GET `/api/i18n/usage`
Returns month‑to‑date tokens & cost.

### POST `/api/i18n/hotfix` & `/api/i18n/deploy`
Queue emergency overrides & promote staged bundles.

Webhook `/webhook/cdn-invalidate` notifies clients when new bundles are live.

---

## 13.13 Plans & SLAs

| Tier | Tokens | Edge SLA | Support | Price |
|------|--------|----------|---------|-------|
| Free | 20 k | Best‑effort | Community | \$0 |
| Startup | 300 k | 120 s | E‑mail 24 h | \$49 |
| Growth | 2 M | 60 s | Slack 4 h | \$249 |
| Enterprise | Unlimited\* | 30 s | TAM + SSO | Custom |

---

## 13.10 Admin & Collaboration Apps
* **Admin UI** – Non‑dev staff upload CSV, approve AI translations, trigger deploy.  
* **Crowd portal** – Invite volunteers to suggest dialect fixes (gamified).

---

© 2025 SkillPath Inc.
