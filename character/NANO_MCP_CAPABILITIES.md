# NANO MCP CAPABILITIES SPECIFICATION
## AI Asset Production & Image Conditioning Engine

**Engine Path:** `/Users/dvtinh99/Documents/work/nano-banana-mcp/server.mjs`  
**Protocol:** Model Context Protocol (MCP) over stdio / Direct Node Execution via Chrome DevTools Protocol (CDP)  
**Target Service:** Google Gemini Web (`gemini.google.com`) authenticated session in local Google Chrome  

---

## 1. Engine Architecture & Discovery

Nano MCP bridges Claude Opus / Antigravity with the user's active Google Gemini session in Chrome via CDP (Chrome DevTools Protocol). This enables unlimited high-fidelity multimodal image generation using Google's latest Imagen 3 models without third-party API keys or cloud billing meters.

```
┌─────────────────────────────────┐
│     Antigravity / Claude        │
│    Asset Production Pipeline    │
└───────────────┬─────────────────┘
                │ JSON-RPC / CLI invocation
                ▼
┌─────────────────────────────────┐
│       nano-banana-mcp           │
│         (server.mjs)            │
└───────────────┬─────────────────┘
                │ Chrome DevTools Protocol (CDP :9222)
                ▼
┌─────────────────────────────────┐
│      Google Chrome Session      │
│     (gemini.google.com Web)     │
└───────────────┬─────────────────┘
                │ Imagen 3 Generation Pipeline
                ▼
┌─────────────────────────────────┐
│    Local PNG/JPG Deliverable    │
│  (Normalized via Pillow Script) │
└─────────────────────────────────┘
```

---

## 2. Tool Catalog & Exposed Schema

### 2.1. `generate_image`

Generates high-resolution 2D illustrations with multi-reference image conditioning.

```json
{
  "name": "generate_image",
  "description": "Generate an image with Nano Banana (Gemini) via the user's logged-in Gemini web in Chrome. Returns the saved file path and base64 image data.",
  "parameters": {
    "type": "object",
    "required": ["prompt"],
    "properties": {
      "prompt": {
        "type": "string",
        "description": "Detailed visual description of character, asset, pose, and style."
      },
      "reference_images": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Absolute paths of reference images to attach in order (first is 'Image 1' in prompt). Accepts local file paths, HTTPS URLs, or data:image base64 strings."
      },
      "output_dir": {
        "type": "string",
        "description": "Target folder on local disk to save the resulting image file."
      },
      "provider": {
        "type": "string",
        "enum": ["auto", "gemini", "dola", "dreamina", "flow"],
        "default": "auto",
        "description": "Generation provider chain. Defaults to Gemini with automatic failover."
      }
    }
  }
}
```

### 2.2. `generate_tts`

Converts script or dialogue into neural speech via Microsoft Edge TTS.

```json
{
  "name": "generate_tts",
  "description": "Convert text to speech using Microsoft Edge TTS neural voices.",
  "parameters": {
    "type": "object",
    "required": ["text"],
    "properties": {
      "text": { "type": "string" },
      "voice": { "type": "string", "default": "vi-VN-HoaiMyNeural" },
      "rate": { "type": "string", "default": "+0%" },
      "pitch": { "type": "string", "default": "+0Hz" },
      "output_dir": { "type": "string" }
    }
  }
}
```

---

## 3. Capability Matrix & Technical Constraints

| Capability | Nano MCP Support | Operational Workflow / Mitigation |
| :--- | :---: | :--- |
| **Text-to-Image** | ✅ Yes | Direct prompt submission to Gemini Imagen 3 interface. |
| **Image-to-Image (1 ref)** | ✅ Yes | Uploads master reference (e.g. `main-removebg-preview.png`) as "Image 1". |
| **Multi-Reference Input** | ✅ Yes | Attaches multiple images sequentially; referenced in prompt as "Image 1, Image 2". |
| **Output Image Format** | ⚠️ JPG / PNG | Gemini outputs opaque images with solid backgrounds (white or gradient). |
| **Direct Alpha / Transparent PNG** | ❌ No | **Must run local image processing:** Python/Pillow script strips background, extracts alpha channel, and applies edge anti-aliasing. |
| **Layered PSD Export** | ❌ No | Generates flattened images. Modular rigging slices must be segmented or generated independently. |
| **Pixel-Perfect Rig Alignment** | ❌ No | AI images vary slightly in bounding geometry. Coordinate normalization and pivot offsetting must occur in Rigby2D / Spine. |
| **Aspect Ratio Control** | ⚠️ Limited | Default is square 1:1 or 16:9 widescreen depending on prompt keywords. |
| **Batch Concurrency** | ⚠️ Serial | CDP operations must run serially to prevent race conditions on the browser DOM. |
| **Execution Latency** | ~8–15s per image | Fast turnaround for single generations; controlled batch queues recommended. |

---

## 4. Prompt Engineering Strategy for Luma 2.0

To ensure strict visual consistency with the approved Art Direction, every prompt sent to Nano MCP must follow this structured template:

```markdown
[SUBJECT]:
A cute 2D game asset for a Super Deformed anime chibi fantasy game.
[CATEGORY]: {Hair / Hat / Outfit / Shoes / Accessory / Icon}
[STYLE & PROPORTIONS]:
Super Deformed Anime Chibi style, 2 to 2.3 heads tall proportions.
Soft dark-plum (#493747) clean outlines, NEVER pure black outlines.
Cozy fantasy cel-shading, vibrant warm palette with pastel accents.
Clean isolated artwork on a pure solid white background (#FFFFFF) for easy alpha extraction.
[COLOR PALETTE]:
Mystic Lavender (#B9A0D9), Fantasy Blue (#78A9D9), Warm Gold (#E8B76B), Soft Cream (#F8EBD5), Dark Plum (#493747).
[CONDITIONING]:
Maintain 100% stylistic and proportional continuity with Image 1 (Luma character reference).
```

---

## 5. Post-Processing Pipeline (Phase 6 Integration)

Because Gemini returns solid-background artwork, our automated Python pipeline performs the following transformation on every raw Nano MCP output:

1. **Background Detection & Segmentation:** Sample 4-corner pixels to detect background color (`#FFFFFF` or light ambient).
2. **Alpha Keying:** Convert background pixels to `(0, 0, 0, 0)` with a soft 3-pixel luminance feathering to eliminate fringing halos.
3. **Bounding Box Auto-Crop:** Trim empty transparent padding.
4. **Canvas Standardization:** Center asset within standard dimensions (128×128 for icons, 512×512 for equipment sheets).
5. **Optimization:** Export as 32-bit RGBA PNG with PNGCRUSH compression.
