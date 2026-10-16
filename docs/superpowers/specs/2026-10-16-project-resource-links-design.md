# BlenderWorld Project Resource Links Design

## Goal

Add prominent, visually restrained links to the BlenderWorld paper and its official project resources without crowding the primary site navigation or weakening the existing calls to explore the benchmark.

## Placement and hierarchy

Add a dedicated resource-link row in the homepage hero, immediately after the affiliations and before the existing hero action buttons. This keeps the four official resources close to the paper title and authors while preserving the current internal actions—introduction video, leaderboard, and 3D showcase—as a separate group.

The resource row contains, in this order:

1. Paper
2. GitHub
3. Hugging Face
4. ModelScope

## Visual design

Each resource is a compact, low-emphasis outlined pill that follows the site's existing warm neutral palette, typography, border color, and rust hover accent. Every label includes a small external-link arrow. The links are intentionally quieter than the dark primary “Watch the introduction” button so the existing exploration flow remains the visual priority.

On wide screens the four links sit on one centered row. On narrow screens they wrap naturally, remain centered, and keep a comfortable touch target without requiring a separate mobile layout.

## Interaction and accessibility

All four links open in a new tab and use `rel="noopener noreferrer"`. Each link has an accessible label that names the destination and states that it opens in a new tab. Keyboard focus uses the site's existing focus-visible treatment, and the visible external-link arrow is hidden from assistive technology.

No JavaScript is required. The change is limited to semantic anchors in `index.html` and focused styling in `style.css`.

## URLs

- Paper: `https://github.com/QwenLM/BlenderWorld/blob/main/docs/BlenderWorld__Benchmarking_Visual_Agents_for_3D_Creation_from_Real_World_References.pdf`
- GitHub: `https://github.com/QwenLM/BlenderWorld`
- Hugging Face: `https://huggingface.co/datasets/Qwen/BlenderWorld`
- ModelScope: `https://modelscope.cn/datasets/Qwen/BlenderWorld`

## Data and integrity updates

Because `index.html` and `style.css` are tracked by the site's integrity files, update their byte sizes and SHA-256 values in `data/site-manifest.json`, then update the affected entries in `SHA256SUMS`. Refresh the stylesheet cache-busting query in `index.html` so the new styles appear immediately after deployment.

## Verification

- Assert that all four exact URLs appear once in the hero resource row.
- Assert that every external link has `target="_blank"` and `rel="noopener noreferrer"`.
- Validate HTML structure and ensure CSS has no syntax or whitespace errors.
- Verify the full SHA-256 checksum list and the resource manifest metadata.
- Inspect the rendered page at desktop and mobile widths, including wrapping, spacing, hover/focus behavior, and the existing hero layout.
- After deployment, confirm the Pages build succeeds and the live HTML contains all four URLs.
