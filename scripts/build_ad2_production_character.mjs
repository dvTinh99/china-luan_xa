import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Rigby2D Core imports
const { Skeleton, makeAttachment } = await import('/Users/dvtinh99/.gemini/mcp-servers/rigby2d/server/src/core/model.js');
const { Pose } = await import('/Users/dvtinh99/.gemini/mcp-servers/rigby2d/server/src/core/pose.js');
const { Animation, makeKey } = await import('/Users/dvtinh99/.gemini/mcp-servers/rigby2d/server/src/core/animation.js');
const { LINEAR, EASE_IN_OUT, EASE_IN, EASE_OUT } = await import('/Users/dvtinh99/.gemini/mcp-servers/rigby2d/server/src/core/curve.js');
const { transform } = await import('/Users/dvtinh99/.gemini/mcp-servers/rigby2d/server/src/core/math.js');
const { unzip, zip } = await import('/Users/dvtinh99/.gemini/mcp-servers/rigby2d/server/src/editor/zip.js');
const { pack } = await import('/Users/dvtinh99/.gemini/mcp-servers/rigby2d/server/src/editor/pack.js');
const { writeAtlas } = await import('/Users/dvtinh99/.gemini/mcp-servers/rigby2d/server/src/core/atlas.js');
const { decodePng, encodePng } = await import('/Users/dvtinh99/.gemini/mcp-servers/rigby2d/server/src/mcp/png.js');

const sourceRigbyPath = path.resolve('apps/game/assets/characters/luma/source/Luma_ArtDirection_2.rigby');
const exportDir = path.resolve('apps/game/assets/characters/luma/export');
await fs.mkdir(exportDir, { recursive: true });

// 1. Read existing autorig output
const rigbyBytes = await fs.readFile(sourceRigbyPath);
const entries = unzip(rigbyBytes);
const projectJsonRaw = new TextDecoder().decode(entries.get('project.json'));
const doc = Skeleton.fromObject(JSON.parse(projectJsonRaw));
doc.name = 'luma';

// Read manifest for cropped layer coordinates
const manifestRaw = await fs.readFile(path.join(__dirname, 'luma_ad2_manifest.json'), 'utf8');
const manifest = JSON.parse(manifestRaw);
const layerMap = new Map(manifest.map((m) => [m.name, m]));

// Helper: add image to entries and doc.images
async function addImage(name) {
  const meta = layerMap.get(name);
  if (!meta) throw new Error(`Missing metadata for ${name}`);
  const bytes = await fs.readFile(meta.file);
  entries.set(`images/${name}.png`, bytes);
  if (!doc.images.some((img) => img.name === name)) {
    doc.images.push({ name, path: null, width: meta.width, height: meta.height });
  }
  return { meta, bytes };
}

// 2. Add alternate modular equipment images and expression layers
const MODULAR_IMAGES = [
  'hair_short',
  'outfit_adventurer',
  'shoes_boots_l',
  'shoes_boots_r',
  'accessory_front_satchel',
  'eye_blink_l',
  'eye_blink_r',
  'mouth_happy',
  'mouth_surprised',
];

for (const name of MODULAR_IMAGES) {
  await addImage(name);
}

// 3. Setup Pose for bone inverse transforms
const pose = new Pose(doc);
pose.setToSetup(doc);

// Helper: calculate local attachment transform relative to a slot's bone
function createAttachmentForSlot(slotName, attName, imgName) {
  const slotIdx = doc.slotIndex(slotName);
  if (slotIdx === null) throw new Error(`Slot '${slotName}' not found`);
  const slot = doc.slots[slotIdx];
  const boneIdx = slot.bone;
  const boneWorld = pose.world[boneIdx];
  const meta = layerMap.get(imgName);
  if (!meta) throw new Error(`Meta for image ${imgName} not found`);

  // World center of the layer in skeleton units (Y up, origin bottom center 300, 800)
  const worldX = (meta.left + meta.left + meta.width) / 2 - 300;
  const worldY = 800 - (meta.top + meta.top + meta.height) / 2;

  // Transform into local bone space
  const inv = boneWorld.inverse();
  const [localX, localY] = inv.apply([worldX, worldY]);

  // World rotation of the bone
  const boneRotDeg = (Math.atan2(boneWorld.b, boneWorld.a) * 180) / Math.PI;
  const localRot = -boneRotDeg;

  return makeAttachment(attName, imgName, transform(localX, localY, localRot), meta.width, meta.height);
}

// Attach modular gear and expressions to slots
const slotGear = [
  { slot: 'hair_front', att: 'hair_short', img: 'hair_short' },
  { slot: 'torso', att: 'outfit_adventurer', img: 'outfit_adventurer' },
  { slot: 'foot_l', att: 'shoes_boots_l', img: 'shoes_boots_l' },
  { slot: 'foot_r', att: 'shoes_boots_r', img: 'shoes_boots_r' },
  { slot: 'accessory_front_pendant', att: 'accessory_front_satchel', img: 'accessory_front_satchel' },
  { slot: 'eye_l', att: 'eye_blink_l', img: 'eye_blink_l' },
  { slot: 'eye_r', att: 'eye_blink_r', img: 'eye_blink_r' },
  { slot: 'mouth', att: 'mouth_happy', img: 'mouth_happy' },
  { slot: 'mouth', att: 'mouth_surprised', img: 'mouth_surprised' },
];

for (const { slot, att, img } of slotGear) {
  const slotIdx = doc.slotIndex(slot);
  const s = doc.slots[slotIdx];
  const newAtt = createAttachmentForSlot(slot, att, img);
  if (!s.attachments.some((a) => a.name === att)) {
    s.attachments.push(newAtt);
  }
}

// 4. Create Skins: default, skin_explorer, skin_adventurer
doc.skins = [
  {
    name: 'skin_explorer',
    slots: [
      { slot: doc.slotIndex('hair_front'), attachments: [doc.attachment(doc.slotIndex('hair_front'), 'hair_front')] },
      { slot: doc.slotIndex('hat_explorer'), attachments: [doc.attachment(doc.slotIndex('hat_explorer'), 'hat_explorer')] },
      { slot: doc.slotIndex('torso'), attachments: [doc.attachment(doc.slotIndex('torso'), 'torso')] },
      { slot: doc.slotIndex('foot_l'), attachments: [doc.attachment(doc.slotIndex('foot_l'), 'foot_l')] },
      { slot: doc.slotIndex('foot_r'), attachments: [doc.attachment(doc.slotIndex('foot_r'), 'foot_r')] },
      { slot: doc.slotIndex('accessory_front_pendant'), attachments: [doc.attachment(doc.slotIndex('accessory_front_pendant'), 'accessory_front_pendant')] },
      { slot: doc.slotIndex('cape_back'), attachments: [doc.attachment(doc.slotIndex('cape_back'), 'cape_back')] },
    ],
    bones: [],
    ik: [],
  },
  {
    name: 'skin_adventurer',
    slots: [
      { slot: doc.slotIndex('hair_front'), attachments: [doc.attachment(doc.slotIndex('hair_front'), 'hair_short')] },
      { slot: doc.slotIndex('hat_explorer'), attachments: [] },
      { slot: doc.slotIndex('torso'), attachments: [doc.attachment(doc.slotIndex('torso'), 'outfit_adventurer')] },
      { slot: doc.slotIndex('foot_l'), attachments: [doc.attachment(doc.slotIndex('foot_l'), 'shoes_boots_l')] },
      { slot: doc.slotIndex('foot_r'), attachments: [doc.attachment(doc.slotIndex('foot_r'), 'shoes_boots_r')] },
      { slot: doc.slotIndex('accessory_front_pendant'), attachments: [doc.attachment(doc.slotIndex('accessory_front_pendant'), 'accessory_front_satchel')] },
      { slot: doc.slotIndex('cape_back'), attachments: [] },
    ],
    bones: [],
    ik: [],
  },
];

// Helper to easily key bones in animations
function addKey(anim, boneName, channel, time, val, curve = EASE_IN_OUT) {
  const bIdx = doc.boneIndex(boneName);
  if (bIdx === null) return;
  const tl = anim.boneTimelineMut(bIdx);
  tl[channel].push(makeKey(time, val, curve));
}

// 5. Author All 9 Required Animations
doc.animations = [];

// ── 5.1 idle_breathe (2.0s loop) ──────────────────────────────────────────────
{
  const anim = new Animation('idle_breathe', 2.0);
  addKey(anim, 'chest', 'translate', 0.0, [0, 0]);
  addKey(anim, 'chest', 'translate', 1.0, [0, 3.0]);
  addKey(anim, 'chest', 'translate', 2.0, [0, 0]);

  addKey(anim, 'head', 'rotate', 0.0, 0);
  addKey(anim, 'head', 'rotate', 1.0, 1.2);
  addKey(anim, 'head', 'rotate', 2.0, 0);

  addKey(anim, 'upperarm_l', 'rotate', 0.0, 0);
  addKey(anim, 'upperarm_l', 'rotate', 1.0, 2.0);
  addKey(anim, 'upperarm_l', 'rotate', 2.0, 0);

  addKey(anim, 'upperarm_r', 'rotate', 0.0, 0);
  addKey(anim, 'upperarm_r', 'rotate', 1.0, -2.0);
  addKey(anim, 'upperarm_r', 'rotate', 2.0, 0);

  addKey(anim, 'hair', 'rotate', 0.0, 0);
  addKey(anim, 'hair', 'rotate', 1.15, -1.8);
  addKey(anim, 'hair', 'rotate', 2.0, 0);

  doc.animations.push(anim);
}

// ── 5.2 idle_blink (1.5s loop) ────────────────────────────────────────────────
{
  const anim = new Animation('idle_blink', 1.5);
  addKey(anim, 'eye_l', 'scale', 0.0, [1, 1]);
  addKey(anim, 'eye_l', 'scale', 0.48, [1, 1]);
  addKey(anim, 'eye_l', 'scale', 0.56, [1, 0.1]);
  addKey(anim, 'eye_l', 'scale', 0.64, [1, 1]);
  addKey(anim, 'eye_l', 'scale', 1.5, [1, 1]);

  addKey(anim, 'eye_r', 'scale', 0.0, [1, 1]);
  addKey(anim, 'eye_r', 'scale', 0.48, [1, 1]);
  addKey(anim, 'eye_r', 'scale', 0.56, [1, 0.1]);
  addKey(anim, 'eye_r', 'scale', 0.64, [1, 1]);
  addKey(anim, 'eye_r', 'scale', 1.5, [1, 1]);

  addKey(anim, 'brow_l', 'translate', 0.48, [0, 0]);
  addKey(anim, 'brow_l', 'translate', 0.56, [0, -1.8]);
  addKey(anim, 'brow_l', 'translate', 0.64, [0, 0]);

  addKey(anim, 'brow_r', 'translate', 0.48, [0, 0]);
  addKey(anim, 'brow_r', 'translate', 0.56, [0, -1.8]);
  addKey(anim, 'brow_r', 'translate', 0.64, [0, 0]);

  addKey(anim, 'hair', 'rotate', 0.55, 0);
  addKey(anim, 'hair', 'rotate', 0.72, 3.5);
  addKey(anim, 'hair', 'rotate', 0.9, -1.2);
  addKey(anim, 'hair', 'rotate', 1.1, 0);

  doc.animations.push(anim);
}

// ── 5.3 happy (1.2s cheerful bounce) ──────────────────────────────────────────
{
  const anim = new Animation('happy', 1.2);
  addKey(anim, 'hip', 'translate', 0.0, [0, 0]);
  addKey(anim, 'hip', 'translate', 0.25, [0, 16]);
  addKey(anim, 'hip', 'translate', 0.55, [0, -4]);
  addKey(anim, 'hip', 'translate', 0.8, [0, 12]);
  addKey(anim, 'hip', 'translate', 1.2, [0, 0]);

  addKey(anim, 'head', 'rotate', 0.0, 0);
  addKey(anim, 'head', 'rotate', 0.3, 6);
  addKey(anim, 'head', 'rotate', 0.75, -5);
  addKey(anim, 'head', 'rotate', 1.2, 0);

  addKey(anim, 'upperarm_l', 'rotate', 0.0, 0);
  addKey(anim, 'upperarm_l', 'rotate', 0.3, 28);
  addKey(anim, 'upperarm_l', 'rotate', 0.8, 18);
  addKey(anim, 'upperarm_l', 'rotate', 1.2, 0);

  addKey(anim, 'upperarm_r', 'rotate', 0.0, 0);
  addKey(anim, 'upperarm_r', 'rotate', 0.3, -28);
  addKey(anim, 'upperarm_r', 'rotate', 0.8, -18);
  addKey(anim, 'upperarm_r', 'rotate', 1.2, 0);

  addKey(anim, 'mouth', 'scale', 0.0, [1, 1]);
  addKey(anim, 'mouth', 'scale', 0.3, [1.3, 1.3]);
  addKey(anim, 'mouth', 'scale', 0.8, [1.2, 1.2]);
  addKey(anim, 'mouth', 'scale', 1.2, [1, 1]);

  doc.animations.push(anim);
}

// ── 5.4 curious (1.6s head tilt & lean) ────────────────────────────────────────
{
  const anim = new Animation('curious', 1.6);
  addKey(anim, 'head', 'rotate', 0.0, 0);
  addKey(anim, 'head', 'rotate', 0.45, 13.5);
  addKey(anim, 'head', 'rotate', 1.15, 12.0);
  addKey(anim, 'head', 'rotate', 1.6, 0);

  addKey(anim, 'chest', 'translate', 0.0, [0, 0]);
  addKey(anim, 'chest', 'translate', 0.45, [4.0, 2.0]);
  addKey(anim, 'chest', 'translate', 1.15, [3.5, 1.5]);
  addKey(anim, 'chest', 'translate', 1.6, [0, 0]);

  addKey(anim, 'brow_l', 'translate', 0.0, [0, 0]);
  addKey(anim, 'brow_l', 'translate', 0.45, [0, 4.5]);
  addKey(anim, 'brow_l', 'translate', 1.15, [0, 4.0]);
  addKey(anim, 'brow_l', 'translate', 1.6, [0, 0]);

  addKey(anim, 'hair', 'rotate', 0.0, 0);
  addKey(anim, 'hair', 'rotate', 0.45, 7.5);
  addKey(anim, 'hair', 'rotate', 1.15, 6.0);
  addKey(anim, 'hair', 'rotate', 1.6, 0);

  doc.animations.push(anim);
}

// ── 5.5 surprised (1.0s startled reaction) ────────────────────────────────────
{
  const anim = new Animation('surprised', 1.0);
  addKey(anim, 'hip', 'translate', 0.0, [0, 0]);
  addKey(anim, 'hip', 'translate', 0.15, [0, 10.0]);
  addKey(anim, 'hip', 'translate', 0.4, [0, -3.0]);
  addKey(anim, 'hip', 'translate', 1.0, [0, 0]);

  addKey(anim, 'eye_l', 'scale', 0.0, [1, 1]);
  addKey(anim, 'eye_l', 'scale', 0.15, [1.25, 1.25]);
  addKey(anim, 'eye_l', 'scale', 0.6, [1.15, 1.15]);
  addKey(anim, 'eye_l', 'scale', 1.0, [1, 1]);

  addKey(anim, 'eye_r', 'scale', 0.0, [1, 1]);
  addKey(anim, 'eye_r', 'scale', 0.15, [1.25, 1.25]);
  addKey(anim, 'eye_r', 'scale', 0.6, [1.15, 1.15]);
  addKey(anim, 'eye_r', 'scale', 1.0, [1, 1]);

  addKey(anim, 'brow_l', 'translate', 0.0, [0, 0]);
  addKey(anim, 'brow_l', 'translate', 0.15, [0, 6.0]);
  addKey(anim, 'brow_l', 'translate', 0.5, [0, 3.0]);
  addKey(anim, 'brow_l', 'translate', 1.0, [0, 0]);

  addKey(anim, 'brow_r', 'translate', 0.0, [0, 0]);
  addKey(anim, 'brow_r', 'translate', 0.15, [0, 6.0]);
  addKey(anim, 'brow_r', 'translate', 0.5, [0, 3.0]);
  addKey(anim, 'brow_r', 'translate', 1.0, [0, 0]);

  addKey(anim, 'mouth', 'scale', 0.0, [1, 1]);
  addKey(anim, 'mouth', 'scale', 0.15, [1.4, 1.5]);
  addKey(anim, 'mouth', 'scale', 0.5, [1.2, 1.2]);
  addKey(anim, 'mouth', 'scale', 1.0, [1, 1]);

  doc.animations.push(anim);
}

// ── 5.6 sleepy (2.4s gentle relaxed drift) ────────────────────────────────────
{
  const anim = new Animation('sleepy', 2.4);
  addKey(anim, 'chest', 'translate', 0.0, [0, 0]);
  addKey(anim, 'chest', 'translate', 1.2, [0, 2.0]);
  addKey(anim, 'chest', 'translate', 2.4, [0, 0]);

  addKey(anim, 'head', 'rotate', 0.0, 0);
  addKey(anim, 'head', 'rotate', 1.2, -6.5);
  addKey(anim, 'head', 'rotate', 2.4, 0);

  addKey(anim, 'eye_l', 'scale', 0.0, [1, 0.8]);
  addKey(anim, 'eye_l', 'scale', 1.2, [1, 0.35]);
  addKey(anim, 'eye_l', 'scale', 2.4, [1, 0.8]);

  addKey(anim, 'eye_r', 'scale', 0.0, [1, 0.8]);
  addKey(anim, 'eye_r', 'scale', 1.2, [1, 0.35]);
  addKey(anim, 'eye_r', 'scale', 2.4, [1, 0.8]);

  addKey(anim, 'upperarm_l', 'rotate', 0.0, 0);
  addKey(anim, 'upperarm_l', 'rotate', 1.2, -3.0);
  addKey(anim, 'upperarm_l', 'rotate', 2.4, 0);

  addKey(anim, 'upperarm_r', 'rotate', 0.0, 0);
  addKey(anim, 'upperarm_r', 'rotate', 1.2, 3.0);
  addKey(anim, 'upperarm_r', 'rotate', 2.4, 0);

  doc.animations.push(anim);
}

// ── 5.7 proud (1.8s confident posture) ────────────────────────────────────────
{
  const anim = new Animation('proud', 1.8);
  addKey(anim, 'chest', 'translate', 0.0, [0, 0]);
  addKey(anim, 'chest', 'translate', 0.5, [0, 6.0]);
  addKey(anim, 'chest', 'translate', 1.3, [0, 5.0]);
  addKey(anim, 'chest', 'translate', 1.8, [0, 0]);

  addKey(anim, 'head', 'rotate', 0.0, 0);
  addKey(anim, 'head', 'rotate', 0.5, -4.5);
  addKey(anim, 'head', 'rotate', 1.3, -4.0);
  addKey(anim, 'head', 'rotate', 1.8, 0);

  addKey(anim, 'upperarm_l', 'rotate', 0.0, 0);
  addKey(anim, 'upperarm_l', 'rotate', 0.55, 24.0);
  addKey(anim, 'upperarm_l', 'rotate', 1.3, 22.0);
  addKey(anim, 'upperarm_l', 'rotate', 1.8, 0);

  addKey(anim, 'upperarm_r', 'rotate', 0.0, 0);
  addKey(anim, 'upperarm_r', 'rotate', 0.55, -24.0);
  addKey(anim, 'upperarm_r', 'rotate', 1.3, -22.0);
  addKey(anim, 'upperarm_r', 'rotate', 1.8, 0);

  doc.animations.push(anim);
}

// ── 5.8 walk (1.2s chibi walking loop) ────────────────────────────────────────
{
  const anim = new Animation('walk', 1.2);

  // Hip bounce
  addKey(anim, 'hip', 'translate', 0.0, [0, 0]);
  addKey(anim, 'hip', 'translate', 0.3, [0, 3.5]);
  addKey(anim, 'hip', 'translate', 0.6, [0, 0]);
  addKey(anim, 'hip', 'translate', 0.9, [0, 3.5]);
  addKey(anim, 'hip', 'translate', 1.2, [0, 0]);

  // Leg Left
  addKey(anim, 'thigh_l', 'rotate', 0.0, 22);
  addKey(anim, 'thigh_l', 'rotate', 0.3, 8);
  addKey(anim, 'thigh_l', 'rotate', 0.6, -18);
  addKey(anim, 'thigh_l', 'rotate', 0.9, -4);
  addKey(anim, 'thigh_l', 'rotate', 1.2, 22);

  addKey(anim, 'shin_l', 'rotate', 0.0, -5);
  addKey(anim, 'shin_l', 'rotate', 0.3, 18);
  addKey(anim, 'shin_l', 'rotate', 0.6, 0);
  addKey(anim, 'shin_l', 'rotate', 0.9, 0);
  addKey(anim, 'shin_l', 'rotate', 1.2, -5);

  // Leg Right (shifted by half-cycle 0.6s)
  addKey(anim, 'thigh_r', 'rotate', 0.0, -18);
  addKey(anim, 'thigh_r', 'rotate', 0.3, -4);
  addKey(anim, 'thigh_r', 'rotate', 0.6, 22);
  addKey(anim, 'thigh_r', 'rotate', 0.9, 8);
  addKey(anim, 'thigh_r', 'rotate', 1.2, -18);

  addKey(anim, 'shin_r', 'rotate', 0.0, 0);
  addKey(anim, 'shin_r', 'rotate', 0.3, 0);
  addKey(anim, 'shin_r', 'rotate', 0.6, -5);
  addKey(anim, 'shin_r', 'rotate', 0.9, 18);
  addKey(anim, 'shin_r', 'rotate', 1.2, 0);

  // Arms alternating swing
  addKey(anim, 'upperarm_l', 'rotate', 0.0, -20);
  addKey(anim, 'upperarm_l', 'rotate', 0.6, 20);
  addKey(anim, 'upperarm_l', 'rotate', 1.2, -20);

  addKey(anim, 'upperarm_r', 'rotate', 0.0, 20);
  addKey(anim, 'upperarm_r', 'rotate', 0.6, -20);
  addKey(anim, 'upperarm_r', 'rotate', 1.2, 20);

  // Head slight counterbalance
  addKey(anim, 'head', 'rotate', 0.0, -1.0);
  addKey(anim, 'head', 'rotate', 0.3, 1.0);
  addKey(anim, 'head', 'rotate', 0.6, -1.0);
  addKey(anim, 'head', 'rotate', 0.9, 1.0);
  addKey(anim, 'head', 'rotate', 1.2, -1.0);

  // Ahoge & hair follow-through
  addKey(anim, 'hair', 'rotate', 0.0, 2.0);
  addKey(anim, 'hair', 'rotate', 0.3, -2.0);
  addKey(anim, 'hair', 'rotate', 0.6, 2.0);
  addKey(anim, 'hair', 'rotate', 0.9, -2.0);
  addKey(anim, 'hair', 'rotate', 1.2, 2.0);

  doc.animations.push(anim);
}

// ── 5.9 run (0.8s energetic chibi run) ────────────────────────────────────────
{
  const anim = new Animation('run', 0.8);

  // Energetic vertical bounce & forward lean
  addKey(anim, 'hip', 'translate', 0.0, [0, -2]);
  addKey(anim, 'hip', 'translate', 0.2, [0, 8]);
  addKey(anim, 'hip', 'translate', 0.4, [0, -2]);
  addKey(anim, 'hip', 'translate', 0.6, [0, 8]);
  addKey(anim, 'hip', 'translate', 0.8, [0, -2]);

  addKey(anim, 'chest', 'rotate', 0.0, -6);
  addKey(anim, 'chest', 'rotate', 0.4, -6);
  addKey(anim, 'chest', 'rotate', 0.8, -6);

  // High knee stride legs
  addKey(anim, 'thigh_l', 'rotate', 0.0, 36);
  addKey(anim, 'thigh_l', 'rotate', 0.2, 15);
  addKey(anim, 'thigh_l', 'rotate', 0.4, -32);
  addKey(anim, 'thigh_l', 'rotate', 0.6, -10);
  addKey(anim, 'thigh_l', 'rotate', 0.8, 36);

  addKey(anim, 'shin_l', 'rotate', 0.0, -8);
  addKey(anim, 'shin_l', 'rotate', 0.2, 38);
  addKey(anim, 'shin_l', 'rotate', 0.4, 6);
  addKey(anim, 'shin_l', 'rotate', 0.6, 2);
  addKey(anim, 'shin_l', 'rotate', 0.8, -8);

  addKey(anim, 'thigh_r', 'rotate', 0.0, -32);
  addKey(anim, 'thigh_r', 'rotate', 0.2, -10);
  addKey(anim, 'thigh_r', 'rotate', 0.4, 36);
  addKey(anim, 'thigh_r', 'rotate', 0.6, 15);
  addKey(anim, 'thigh_r', 'rotate', 0.8, -32);

  addKey(anim, 'shin_r', 'rotate', 0.0, 6);
  addKey(anim, 'shin_r', 'rotate', 0.2, 2);
  addKey(anim, 'shin_r', 'rotate', 0.4, -8);
  addKey(anim, 'shin_r', 'rotate', 0.6, 38);
  addKey(anim, 'shin_r', 'rotate', 0.8, 6);

  // Dynamic running arm swing
  addKey(anim, 'upperarm_l', 'rotate', 0.0, -42);
  addKey(anim, 'upperarm_l', 'rotate', 0.4, 42);
  addKey(anim, 'upperarm_l', 'rotate', 0.8, -42);

  addKey(anim, 'forearm_l', 'rotate', 0.0, -25);
  addKey(anim, 'forearm_l', 'rotate', 0.4, -15);
  addKey(anim, 'forearm_l', 'rotate', 0.8, -25);

  addKey(anim, 'upperarm_r', 'rotate', 0.0, 42);
  addKey(anim, 'upperarm_r', 'rotate', 0.4, -42);
  addKey(anim, 'upperarm_r', 'rotate', 0.8, 42);

  addKey(anim, 'forearm_r', 'rotate', 0.0, -15);
  addKey(anim, 'forearm_r', 'rotate', 0.4, -25);
  addKey(anim, 'forearm_r', 'rotate', 0.8, -15);

  // Hair trailing dynamic bounce
  addKey(anim, 'hair', 'rotate', 0.0, -4);
  addKey(anim, 'hair', 'rotate', 0.2, 6);
  addKey(anim, 'hair', 'rotate', 0.4, -4);
  addKey(anim, 'hair', 'rotate', 0.6, 6);
  addKey(anim, 'hair', 'rotate', 0.8, -4);

  doc.animations.push(anim);
}

// 6. Save updated .rigby workfile
const enc = new TextEncoder();
const newZipFiles = [{ path: 'project.json', bytes: enc.encode(doc.toJson()) }];
for (const [k, v] of entries) {
  if (k !== 'project.json') {
    newZipFiles.push({ path: k, bytes: v });
  }
}
const packedRigby = zip(newZipFiles);
await fs.writeFile(sourceRigbyPath, packedRigby);
console.log(`Updated ${sourceRigbyPath} successfully (${packedRigby.byteLength} bytes)`);

// Also save to godot/assets/characters/luma/source/luma.rigby
const defaultRigbyPath = path.resolve('apps/game/assets/characters/luma/source/luma.rigby');
await fs.writeFile(defaultRigbyPath, packedRigby);
console.log(`Updated ${defaultRigbyPath} successfully`);

// 7. Pack Texture Atlas
const packItems = [];
const imageBytesMap = new Map();

for (const img of doc.images) {
  const fileBytes = entries.get(`images/${img.name}.png`);
  if (!fileBytes) throw new Error(`Missing image bytes for ${img.name}`);
  const decoded = decodePng(fileBytes);
  packItems.push({ name: img.name, width: decoded.width, height: decoded.height });
  imageBytesMap.set(img.name, decoded);
}

const packedSheet = pack(packItems);
console.log(`Atlas sheet dimensions: ${packedSheet.width}x${packedSheet.height}, regions: ${packedSheet.regions.length}`);

// Write .atlas text
const atlasText = writeAtlas([
  {
    name: 'luma.png',
    width: packedSheet.width,
    height: packedSheet.height,
    format: 'RGBA8888',
    filter: ['Linear', 'Linear'],
    repeat: 'none',
    pma: false,
    scale: null,
    regions: packedSheet.regions,
  },
]);
const atlasPath = path.join(exportDir, 'luma.atlas');
await fs.writeFile(atlasPath, atlasText, 'utf8');
console.log(`Wrote atlas text to ${atlasPath}`);

// Composite RGBA sheet image
const sheetData = new Uint8Array(packedSheet.width * packedSheet.height * 4);
for (const reg of packedSheet.regions) {
  const src = imageBytesMap.get(reg.name);
  for (let row = 0; row < reg.height; row++) {
    const srcOffset = row * reg.width * 4;
    const dstOffset = ((reg.y + row) * packedSheet.width + reg.x) * 4;
    sheetData.set(src.data.subarray(srcOffset, srcOffset + reg.width * 4), dstOffset);
  }
}

const sheetPng = encodePng({
  width: packedSheet.width,
  height: packedSheet.height,
  data: sheetData,
});
const pngPath = path.join(exportDir, 'luma.png');
await fs.writeFile(pngPath, sheetPng);
console.log(`Wrote atlas PNG to ${pngPath} (${sheetPng.byteLength} bytes)`);

// 8. Copy to Nuxt web public assets
const webSpineDir = path.resolve('apps/web/public/assets/spine/character');
await fs.mkdir(webSpineDir, { recursive: true });
await fs.copyFile(atlasPath, path.join(webSpineDir, 'chibi_hero.atlas'));
await fs.copyFile(pngPath, path.join(webSpineDir, 'chibi_hero.png'));
console.log(`Copied atlas & png to ${webSpineDir}`);
