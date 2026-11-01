import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { writePsd } = await import('/Users/dvtinh99/.gemini/mcp-servers/rigby2d/server/node_modules/ag-psd/dist/index.js');
const { decodePng } = await import('/Users/dvtinh99/.gemini/mcp-servers/rigby2d/server/src/mcp/png.js');

const manifestRaw = await fs.readFile(path.join(__dirname, 'luma_ad2_manifest.json'), 'utf8');
const manifest = JSON.parse(manifestRaw);

// Base character layers in bottom-to-top draw order for autorig
const BASE_LAYER_NAMES = [
  'hair_back',
  'cape_back',
  'pelvis',
  'thigh_r',
  'shin_r',
  'foot_r',
  'thigh_l',
  'shin_l',
  'foot_l',
  'torso',
  'neck',
  'upperarm_r',
  'forearm_r',
  'hand_r',
  'upperarm_l',
  'forearm_l',
  'hand_l',
  'accessory_front_pendant',
  'head',
  'eye_r',
  'eye_l',
  'brow_r',
  'brow_l',
  'nose',
  'mouth',
  'hair_side_r',
  'hair_side_l',
  'hair_front',
  'hat_explorer',
];

const layerMap = new Map(manifest.map((m) => [m.name, m]));

const children = [];
for (const name of BASE_LAYER_NAMES) {
  const meta = layerMap.get(name);
  if (!meta) {
    console.warn(`Layer ${name} not found in manifest`);
    continue;
  }
  const bytes = await fs.readFile(meta.file);
  const { width, height, data } = decodePng(bytes);

  children.push({
    name,
    left: meta.left,
    top: meta.top,
    imageData: {
      width,
      height,
      data: new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength),
    },
  });
}

const psd = {
  width: 600,
  height: 800,
  children,
};

const psdBuffer = writePsd(psd);
const psdPath = path.join(__dirname, '..', 'luma_ad2_character.psd');
await fs.writeFile(psdPath, Buffer.from(psdBuffer));
console.log(`Created PSD at ${psdPath} with ${children.length} layers, size: ${psdBuffer.byteLength} bytes`);
