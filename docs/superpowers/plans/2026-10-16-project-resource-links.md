# Project Resource Links Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add accessible links to the paper, GitHub repository, Hugging Face dataset, and ModelScope dataset in the homepage hero.

**Architecture:** Keep the feature static and dependency-free. Add one semantic link group to `index.html`, style it with a focused component block in `style.css`, and verify the contract with Node's built-in test runner before refreshing the site's existing integrity metadata.

**Tech Stack:** HTML5, CSS, Node.js built-in test runner, GitHub Pages

---

### Task 1: Define and implement the hero resource links

**Files:**
- Create: `tests/project-resource-links.test.mjs`
- Modify: `index.html`
- Modify: `style.css`

- [x] **Step 1: Write the failing contract test**

Create `tests/project-resource-links.test.mjs` with Node's built-in test runner. Read `index.html`, isolate `<nav class="project-links" ...>`, and assert that the four exact links occur once, in order, with `target="_blank"`, `rel="noopener noreferrer"`, descriptive `aria-label` values, and a hidden external-link arrow.

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const resources = [
  ['Paper', 'https://github.com/QwenLM/BlenderWorld/blob/main/docs/BlenderWorld__Benchmarking_Visual_Agents_for_3D_Creation_from_Real_World_References.pdf'],
  ['GitHub', 'https://github.com/QwenLM/BlenderWorld'],
  ['Hugging Face', 'https://huggingface.co/datasets/Qwen/BlenderWorld'],
  ['ModelScope', 'https://modelscope.cn/datasets/Qwen/BlenderWorld'],
];

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

test('hero exposes the four official project resources safely and in order', () => {
  const navMatch = html.match(/<nav class="project-links"[^>]*>[\s\S]*?<\/nav>/);
  assert.ok(navMatch, 'missing nav.project-links');
  const nav = navMatch[0];
  const anchors = [...nav.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)].map((match) => match[0]);
  assert.equal(anchors.length, resources.length);

  let previousPosition = -1;
  resources.forEach(([label, url], index) => {
    const anchor = anchors[index];
    assert.match(anchor, new RegExp(`href="${escapeRegex(url)}"`));
    assert.match(anchor, /target="_blank"/);
    assert.match(anchor, /rel="noopener noreferrer"/);
    assert.match(anchor, /aria-label="[^"]+\(opens in a new tab\)"/);
    assert.match(anchor, new RegExp(`>${escapeRegex(label)} <span aria-hidden="true">↗<\\/span>`));
    assert.equal((nav.match(new RegExp(`href="${escapeRegex(url)}"`, 'g')) ?? []).length, 1);
    const position = nav.indexOf(`href="${url}"`);
    assert.ok(position > previousPosition, `${label} is out of order`);
    previousPosition = position;
  });
});
```

- [x] **Step 2: Run the test and verify it fails**

Run: `node --test tests/project-resource-links.test.mjs`

Expected: FAIL because `nav.project-links` does not exist.

- [x] **Step 3: Add the semantic link group**

Insert this block after `.affiliations` and before `.hero-actions` in `index.html`:

```html
<nav class="project-links" aria-label="Project resources">
  <a href="https://github.com/QwenLM/BlenderWorld/blob/main/docs/BlenderWorld__Benchmarking_Visual_Agents_for_3D_Creation_from_Real_World_References.pdf" target="_blank" rel="noopener noreferrer" aria-label="Read the BlenderWorld paper (opens in a new tab)">Paper <span aria-hidden="true">↗</span></a>
  <a href="https://github.com/QwenLM/BlenderWorld" target="_blank" rel="noopener noreferrer" aria-label="Open the BlenderWorld GitHub repository (opens in a new tab)">GitHub <span aria-hidden="true">↗</span></a>
  <a href="https://huggingface.co/datasets/Qwen/BlenderWorld" target="_blank" rel="noopener noreferrer" aria-label="Open the BlenderWorld dataset on Hugging Face (opens in a new tab)">Hugging Face <span aria-hidden="true">↗</span></a>
  <a href="https://modelscope.cn/datasets/Qwen/BlenderWorld" target="_blank" rel="noopener noreferrer" aria-label="Open the BlenderWorld dataset on ModelScope (opens in a new tab)">ModelScope <span aria-hidden="true">↗</span></a>
</nav>
```

Change the stylesheet query to `style.css?v=20261016-project-links`.

- [x] **Step 4: Add the focused component styles**

Add the following rules after `.affiliations` in `style.css`:

```css
.project-links{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin:20px auto 0}
.project-links a{display:inline-flex;align-items:center;gap:7px;min-height:38px;padding:7px 13px;border:1px solid var(--line);border-radius:999px;background:#f7f3ec;color:#5f574e;font-size:.9375rem;font-weight:500;transition:color .15s,border-color .15s,background .15s,transform .15s}
.project-links a:hover{color:var(--rust);border-color:#c6a78f;background:var(--white);transform:translateY(-1px)}
.project-links a span{font-size:.875rem}
```

Update `.hero-actions` margin from `26px 0 38px` to `18px 0 38px` so the two action groups read as a single hero control area.

- [x] **Step 5: Run the contract test and formatting check**

Run: `node --test tests/project-resource-links.test.mjs && git diff --check`

Expected: all tests pass and `git diff --check` prints no errors.

### Task 2: Refresh integrity metadata and visually verify

**Files:**
- Modify: `data/site-manifest.json`
- Modify: `SHA256SUMS`

- [x] **Step 1: Calculate fresh metadata**

Calculate byte sizes and SHA-256 hashes for `index.html` and `style.css`, update those records in `data/site-manifest.json`, then calculate the new hash for `data/site-manifest.json`. Update the three corresponding entries in `SHA256SUMS`.

- [x] **Step 2: Verify all integrity records**

Run the full checksum list and compare the manifest's recorded sizes and hashes with the three modified site files.

Expected: 0 checksum failures and exact manifest matches.

- [x] **Step 3: Inspect desktop and mobile layouts**

Serve the site locally, capture the hero at 1440×1100 and 390×844, and confirm that the four links are centered, legible, visually secondary to the primary action, keyboard focusable, and wrapped without overflow on mobile.

- [ ] **Step 4: Commit and push**

Commit the plan, test, HTML, CSS, manifest, and checksum changes with message `Add project resource links`, then push `main` to `origin`.

- [ ] **Step 5: Verify production**

Wait for the GitHub Pages workflow to complete successfully. Fetch the live homepage and assert that all four exact resource URLs and the `project-links` group are present.
