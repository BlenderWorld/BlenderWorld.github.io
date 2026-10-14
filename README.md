# BlenderWorld project website

Serve this directory with any static HTTP server:

```sh
python serve.py 8768
```

Open http://localhost:8768. The included Python server supports byte-range requests for video seeking and needs only the Python standard library. Upload this entire directory to a static host to deploy it. All viewer code, fonts, Draco decoders and media are included locally. No API keys or backend are required. Use HTTP(S), not `file://`, for interactive GLB viewing.

The site contains all 13 paper models, 9 category profiles, 26 selected tasks and 181 paper-matched artifacts from 7 models. The showcase balances 10 large scenes, 10 video/animation tasks, and 6 focused object or detail tasks. It includes 66 original submitted videos, with in-page playback; hover over a video card for a lightweight preview. The first nine showcase cards feature all seven represented models. Use the model filter to view its own renders, videos and scores, and compare up to seven submissions on a task. Model-specific detail links preserve the selected model when shared or reloaded. Model icons are SVG conversions of the exact PDFs used in the paper table, documented in `assets/model-icons/sources.json`.

A 71-second English introduction is embedded below the hero examples, using the original 1080p video, a local poster and optional English captions. The video loads on demand, supports inline mobile playback and fullscreen, and pauses when a showcase task opens.

Only the Overall column has bars in the leaderboard; the other columns show numbers. Overall and category chart bars reveal as they scroll into view, against pale 100-point tracks. Values stay right-aligned; Full pass percentages are bold. Reduced-motion settings show the final bars immediately.

This is a display-only website: scores, rendered images, videos, task context and interactive 3D previews. Navigation stays focused on exploring results and examples. There are no paper, code, dataset, CSV, artifact or attachment download controls; attachment names remain visible as task context.

GLBs are derived, compressed static previews of the original Blender projects. Procedural shading, hair, lighting and simulation can differ from the original submitted media. The lounge uses an architectural cutaway; the wind-turbine preview omits distant environment and dense grass. New previews may omit atmospheric volumes and distant ground or open ceilings for an interior cutaway; the interface and each `scene.preview.json` record those choices. Initial cameras focus on moving subjects. Original videos, renders and scores remain the paper evidence.

Fonts: DM Sans and DM Serif Display (SIL Open Font License). 3D viewer: model-viewer 4.0.0; geometry decoder: Draco 1.5.7 (Apache-2.0). See `vendor/licenses/`. Selected examples are illustrative and are not a random performance sample.

Six showcase models cover all 26 tasks; Opus-5 covers 25, with its snowboarder example omitted from the showcase. The three hero examples feature GPT-6-Astra’s goldfish aquarium, Qwen3.8-Max’s skyline, and Opus-5’s mechanical lettering animation. Three original submissions did not include an encoded video (GLM rally car and snowboarder; Opus-5 backrooms). The GLM snowboarder submission contains only a Blender project; its images are the frozen paper evaluation renders, clearly labeled in the interface. Task navigation retains the selected model.

# BlenderWorld.github.io
