import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Rigby2D Core imports
const { Skeleton, makeAttachment, makeBone, makeSlot } = await import('/Users/dvtinh99/.gemini/mcp-servers/rigby2d/server/src/core/model.js');
const { Pose } = await import('/Users/dvtinh99/.gemini/mcp-servers/rigby2d/server/src/core/pose.js');
const { Animation, makeKey } = await import('/Users/dvtinh99/.gemini/mcp-servers/rigby2d/server/src/core/animation.js');
const { LINEAR, EASE_IN_OUT, EASE_IN, EASE_OUT } = await import('/Users/dvtinh99/.gemini/mcp-servers/rigby2d/server/src/core/curve.js');
const { transform } = await import('/Users/dvtinh99/.gemini/mcp-servers/rigby2d/server/src/core/math.js');
const { unzip, zip } = await import('/Users/dvtinh99/.gemini/mcp-servers/rigby2d/server/src/editor/zip.js');
const { pack } = await import('/Users/dvtinh99/.gemini/mcp-servers/rigby2d/server/src/editor/pack.js');
const { writeAtlas } = await import('/Users/dvtinh99/.gemini/mcp-servers/rigby2d/server/src/core/atlas.js');
const { decodePng, encodePng } = await import('/Users/dvtinh99/.gemini/mcp-servers/rigby2d/server/src/mcp/png.js');

const sourceRigbyPath = path.resolve('apps/game/assets/characters/luma/source/luma.rigby');
const exportDir = path.resolve('apps/game/assets/characters/luma/export');
await fs.mkdir(exportDir, { recursive: true });

// 1. Read existing autorig output
const rigbyBytes = await fs.readFile(sourceRigbyPath);
const entries = unzip(rigbyBytes);
const projectJsonRaw = new TextDecoder().decode(entries.get('project.json'));
const doc = Skeleton.fromObject(JSON.parse(projectJsonRaw));
doc.name = 'luma';

// Read manifest for cropped layer coordinates
const manifestRaw = await fs.readFile(path.join(__dirname, 'luna_real_manifest.json'), 'utf8');
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

// 2. Add modular gear and expressions to images list
// Also create pendant accessory matching test_luma contract
const pendantMeta = layerMap.get('satchel');
// Create a separate accessory_front_pendant image and accessory_front_satchel image
await fs.copyFile(path.join(__dirname, 'luna_real_layers/satchel.png'), path.join(__dirname, 'luna_real_layers/accessory_front_satchel.png'));
await fs.copyFile(path.join(__dirname, 'luna_real_layers/satchel.png'), path.join(__dirname, 'luna_real_layers/accessory_front_pendant.png'));
layerMap.set('accessory_front_satchel', { ...pendantMeta, name: 'accessory_front_satchel', file: path.join(__dirname, 'luna_real_layers/accessory_front_satchel.png') });
layerMap.set('accessory_front_pendant', { ...pendantMeta, name: 'accessory_front_pendant', file: path.join(__dirname, 'luna_real_layers/accessory_front_pendant.png') });

const MODULAR_IMAGES = [
  'hat_explorer',
  'hair_short',
  'outfit_adventurer',
  'shoes_boots_l',
  'shoes_boots_r',
  'accessory_front_pendant',
  'accessory_front_satchel',
  'eye_blink_l',
  'eye_blink_r',
  'eye_happy_l',
  'eye_happy_r',
  'eye_star_l',
  'eye_star_r',
  'eye_smug_l',
  'eye_smug_r',
  'eye_surprised_l',
  'eye_surprised_r',
  'mouth_happy',
  'mouth_yawn',
  'mouth_smirk',
  'mouth_surprised',
  'hand_open_l',
  'hand_open_r',
  'hand_point',
  'hand_fist',
];

for (const name of MODULAR_IMAGES) {
  await addImage(name);
}

// 3. Ensure Bone Count = 32
// Add 'hat' bone as child of 'head'
if (!doc.bones.some((b) => b.name === 'hat')) {
  const headIdx = doc.boneIndex('head');
  const hatBone = makeBone('hat', headIdx, transform(0, 110, 0), 45, 0, '#e8b76b');
  doc.bones.push(hatBone);
}
console.log(`Total bones: ${doc.bones.length}`);

// 4. Setup Pose for bone inverse transforms
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

// 5. Ensure Slot Count = 29
// Fix satchel bone: assign to hip instead of shin_r
const satchelSlotIdx = doc.slotIndex('satchel');
if (satchelSlotIdx !== null) {
  const hipIdx = doc.boneIndex('hip');
  doc.slots[satchelSlotIdx].bone = hipIdx;
  const newSatchelAtt = createAttachmentForSlot('satchel', 'satchel', 'satchel');
  doc.slots[satchelSlotIdx].attachments = [newSatchelAtt];
  doc.slots[satchelSlotIdx].attachment = 'satchel';
}

// Fix cape_back bone: assign to chest
const capeSlotIdx = doc.slotIndex('cape_back');
if (capeSlotIdx !== null) {
  const chestIdx = doc.boneIndex('chest');
  doc.slots[capeSlotIdx].bone = chestIdx;
  const newCapeAtt = createAttachmentForSlot('cape_back', 'cape_back', 'cape_back');
  doc.slots[capeSlotIdx].attachments = [newCapeAtt];
  doc.slots[capeSlotIdx].attachment = 'cape_back';
}

// Add slot 'hat_explorer' on 'hat' bone
if (doc.slotIndex('hat_explorer') === null) {
  const hatBoneIdx = doc.boneIndex('hat');
  const hatSlot = makeSlot('hat_explorer', hatBoneIdx, null);
  hatSlot.attachment = null; // invisible by default unless skin enables
  doc.slots.push(hatSlot);
  const hatAtt = createAttachmentForSlot('hat_explorer', 'hat_explorer', 'hat_explorer');
  hatSlot.attachments.push(hatAtt);
}

// Add slot 'accessory_front_pendant' on 'chest' bone
if (doc.slotIndex('accessory_front_pendant') === null) {
  const chestBoneIdx = doc.boneIndex('chest');
  const pendantSlot = makeSlot('accessory_front_pendant', chestBoneIdx, null);
  pendantSlot.attachment = 'accessory_front_pendant';
  doc.slots.push(pendantSlot);
  const pendAtt = createAttachmentForSlot('accessory_front_pendant', 'accessory_front_pendant', 'accessory_front_pendant');
  const satchAtt = createAttachmentForSlot('accessory_front_pendant', 'accessory_front_satchel', 'accessory_front_satchel');
  pendantSlot.attachments.push(pendAtt, satchAtt);
}
console.log(`Total slots: ${doc.slots.length}`);

// 6. Attach Modular Gear & Expressions to Slots
const slotAttachments = [
  { slot: 'hair_front', att: 'hair_short', img: 'hair_short' },
  { slot: 'torso', att: 'outfit_adventurer', img: 'outfit_adventurer' },
  { slot: 'foot_l', att: 'shoes_boots_l', img: 'shoes_boots_l' },
  { slot: 'foot_r', att: 'shoes_boots_r', img: 'shoes_boots_r' },
  { slot: 'eye_l', att: 'eye_blink_l', img: 'eye_blink_l' },
  { slot: 'eye_r', att: 'eye_blink_r', img: 'eye_blink_r' },
  { slot: 'eye_l', att: 'eye_happy_l', img: 'eye_happy_l' },
  { slot: 'eye_r', att: 'eye_happy_r', img: 'eye_happy_r' },
  { slot: 'eye_l', att: 'eye_star_l', img: 'eye_star_l' },
  { slot: 'eye_r', att: 'eye_star_r', img: 'eye_star_r' },
  { slot: 'eye_l', att: 'eye_smug_l', img: 'eye_smug_l' },
  { slot: 'eye_r', att: 'eye_smug_r', img: 'eye_smug_r' },
  { slot: 'eye_l', att: 'eye_surprised_l', img: 'eye_surprised_l' },
  { slot: 'eye_r', att: 'eye_surprised_r', img: 'eye_surprised_r' },
  { slot: 'mouth', att: 'mouth_happy', img: 'mouth_happy' },
  { slot: 'mouth', att: 'mouth_yawn', img: 'mouth_yawn' },
  { slot: 'mouth', att: 'mouth_smirk', img: 'mouth_smirk' },
  { slot: 'mouth', att: 'mouth_surprised', img: 'mouth_surprised' },
  { slot: 'hand_l', att: 'hand_open_l', img: 'hand_open_l' },
  { slot: 'hand_r', att: 'hand_open_r', img: 'hand_open_r' },
  { slot: 'hand_l', att: 'hand_fist', img: 'hand_fist' },
  { slot: 'hand_r', att: 'hand_point', img: 'hand_point' },
];

for (const { slot, att, img } of slotAttachments) {
  const slotIdx = doc.slotIndex(slot);
  const s = doc.slots[slotIdx];
  const newAtt = createAttachmentForSlot(slot, att, img);
  if (!s.attachments.some((a) => a.name === att)) {
    s.attachments.push(newAtt);
  }
}

// 7. Configure Skins: default, skin_explorer, skin_adventurer
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

// Helper to key bone channels
function addKey(anim, boneName, channel, time, val, curve = EASE_IN_OUT) {
  const bIdx = doc.boneIndex(boneName);
  if (bIdx === null) return;
  const tl = anim.boneTimelineMut(bIdx);
  tl[channel].push(makeKey(time, val, curve));
}

// Helper to key slot attachments
function addSlotAttachmentKey(anim, slotName, time, attName) {
  const sIdx = doc.slotIndex(slotName);
  if (sIdx === null) return;
  const tl = anim.slotTimelineMut(sIdx);
  tl.attachment.push(makeKey(time, attName, LINEAR));
}

// 8. Keyframe All 9 Required Animations
doc.animations = [];

// ── 8.1 idle_breathe (2.5s loop) ──────────────────────────────────────────────
{
  const anim = new Animation('idle_breathe', 2.5);
  addKey(anim, 'chest', 'translate', 0.0, [0, 0]);
  addKey(anim, 'chest', 'translate', 1.25, [0, 3.5]);
  addKey(anim, 'chest', 'translate', 2.5, [0, 0]);

  addKey(anim, 'head', 'rotate', 0.0, 0);
  addKey(anim, 'head', 'rotate', 1.25, 1.2);
  addKey(anim, 'head', 'rotate', 2.5, 0);

  addKey(anim, 'upperarm_l', 'rotate', 0.0, 0);
  addKey(anim, 'upperarm_l', 'rotate', 1.25, 2.5);
  addKey(anim, 'upperarm_l', 'rotate', 2.5, 0);

  addKey(anim, 'upperarm_r', 'rotate', 0.0, 0);
  addKey(anim, 'upperarm_r', 'rotate', 1.25, -2.5);
  addKey(anim, 'upperarm_r', 'rotate', 2.5, 0);

  addKey(anim, 'hair', 'rotate', 0.0, 0);
  addKey(anim, 'hair', 'rotate', 1.4, -2.0);
  addKey(anim, 'hair', 'rotate', 2.5, 0);

  addKey(anim, 'hair_l1', 'rotate', 0.0, 0);
  addKey(anim, 'hair_l1', 'rotate', 1.3, 1.8);
  addKey(anim, 'hair_l1', 'rotate', 2.5, 0);

  addKey(anim, 'hair_r1', 'rotate', 0.0, 0);
  addKey(anim, 'hair_r1', 'rotate', 1.3, -1.8);
  addKey(anim, 'hair_r1', 'rotate', 2.5, 0);

  doc.animations.push(anim);
}

// ── 8.2 idle_blink (1.8s natural blink loop) ──────────────────────────────────
{
  const anim = new Animation('idle_blink', 1.8);
  // Natural eyelid closing & opening via scale and attachment
  addKey(anim, 'eye_l', 'scale', 0.0, [1, 1]);
  addKey(anim, 'eye_l', 'scale', 0.6, [1, 1]);
  addKey(anim, 'eye_l', 'scale', 0.7, [1, 0.1]);
  addKey(anim, 'eye_l', 'scale', 0.8, [1, 1]);
  addKey(anim, 'eye_l', 'scale', 1.8, [1, 1]);

  addKey(anim, 'eye_r', 'scale', 0.0, [1, 1]);
  addKey(anim, 'eye_r', 'scale', 0.6, [1, 1]);
  addKey(anim, 'eye_r', 'scale', 0.7, [1, 0.1]);
  addKey(anim, 'eye_r', 'scale', 0.8, [1, 1]);
  addKey(anim, 'eye_r', 'scale', 1.8, [1, 1]);

  addKey(anim, 'brow_l', 'translate', 0.6, [0, 0]);
  addKey(anim, 'brow_l', 'translate', 0.7, [0, -2.0]);
  addKey(anim, 'brow_l', 'translate', 0.8, [0, 0]);

  addKey(anim, 'brow_r', 'translate', 0.6, [0, 0]);
  addKey(anim, 'brow_r', 'translate', 0.7, [0, -2.0]);
  addKey(anim, 'brow_r', 'translate', 0.8, [0, 0]);

  addSlotAttachmentKey(anim, 'eye_l', 0.0, 'eye_l');
  addSlotAttachmentKey(anim, 'eye_l', 0.68, 'eye_blink_l');
  addSlotAttachmentKey(anim, 'eye_l', 0.75, 'eye_l');

  addSlotAttachmentKey(anim, 'eye_r', 0.0, 'eye_r');
  addSlotAttachmentKey(anim, 'eye_r', 0.68, 'eye_blink_r');
  addSlotAttachmentKey(anim, 'eye_r', 0.75, 'eye_r');

  doc.animations.push(anim);
}

// ── 8.3 happy (1.4s joyful bounce) ────────────────────────────────────────────
{
  const anim = new Animation('happy', 1.4);
  addKey(anim, 'hip', 'translate', 0.0, [0, 0]);
  addKey(anim, 'hip', 'translate', 0.3, [0, 18]);
  addKey(anim, 'hip', 'translate', 0.65, [0, -3]);
  addKey(anim, 'hip', 'translate', 0.95, [0, 14]);
  addKey(anim, 'hip', 'translate', 1.4, [0, 0]);

  addKey(anim, 'head', 'rotate', 0.0, 0);
  addKey(anim, 'head', 'rotate', 0.35, 7.0);
  addKey(anim, 'head', 'rotate', 0.85, -6.0);
  addKey(anim, 'head', 'rotate', 1.4, 0);

  addKey(anim, 'upperarm_l', 'rotate', 0.0, 0);
  addKey(anim, 'upperarm_l', 'rotate', 0.35, 32);
  addKey(anim, 'upperarm_l', 'rotate', 0.95, 20);
  addKey(anim, 'upperarm_l', 'rotate', 1.4, 0);

  addKey(anim, 'upperarm_r', 'rotate', 0.0, 0);
  addKey(anim, 'upperarm_r', 'rotate', 0.35, -32);
  addKey(anim, 'upperarm_r', 'rotate', 0.95, -20);
  addKey(anim, 'upperarm_r', 'rotate', 1.4, 0);

  addKey(anim, 'hair', 'rotate', 0.0, 0);
  addKey(anim, 'hair', 'rotate', 0.4, 8);
  addKey(anim, 'hair', 'rotate', 0.9, -6);
  addKey(anim, 'hair', 'rotate', 1.4, 0);

  addSlotAttachmentKey(anim, 'eye_l', 0.0, 'eye_happy_l');
  addSlotAttachmentKey(anim, 'eye_r', 0.0, 'eye_happy_r');
  addSlotAttachmentKey(anim, 'mouth', 0.0, 'mouth_happy');

  doc.animations.push(anim);
}

// ── 8.4 curious (1.8s head tilt & gaze) ───────────────────────────────────────
{
  const anim = new Animation('curious', 1.8);
  addKey(anim, 'head', 'rotate', 0.0, 0);
  addKey(anim, 'head', 'rotate', 0.5, 14.0);
  addKey(anim, 'head', 'rotate', 1.3, 14.0);
  addKey(anim, 'head', 'rotate', 1.8, 0);

  addKey(anim, 'chest', 'rotate', 0.0, 0);
  addKey(anim, 'chest', 'rotate', 0.5, -3.5);
  addKey(anim, 'chest', 'rotate', 1.3, -3.5);
  addKey(anim, 'chest', 'rotate', 1.8, 0);

  addKey(anim, 'brow_r', 'translate', 0.0, [0, 0]);
  addKey(anim, 'brow_r', 'translate', 0.5, [0, 4.0]);
  addKey(anim, 'brow_r', 'translate', 1.3, [0, 4.0]);
  addKey(anim, 'brow_r', 'translate', 1.8, [0, 0]);

  addKey(anim, 'upperarm_r', 'rotate', 0.0, 0);
  addKey(anim, 'upperarm_r', 'rotate', 0.5, -45);
  addKey(anim, 'upperarm_r', 'rotate', 1.3, -45);
  addKey(anim, 'upperarm_r', 'rotate', 1.8, 0);

  addSlotAttachmentKey(anim, 'hand_r', 0.0, 'hand_point');
  addSlotAttachmentKey(anim, 'mouth', 0.0, 'mouth_yawn');

  doc.animations.push(anim);
}

// ── 8.5 surprised (1.5s startled recoil) ───────────────────────────────────────
{
  const anim = new Animation('surprised', 1.5);
  addKey(anim, 'hip', 'translate', 0.0, [0, 0]);
  addKey(anim, 'hip', 'translate', 0.15, [0, 20]);
  addKey(anim, 'hip', 'translate', 0.35, [0, -6]);
  addKey(anim, 'hip', 'translate', 0.8, [0, 4]);
  addKey(anim, 'hip', 'translate', 1.5, [0, 0]);

  addKey(anim, 'chest', 'rotate', 0.0, 0);
  addKey(anim, 'chest', 'rotate', 0.15, -9.0);
  addKey(anim, 'chest', 'rotate', 0.6, 2.0);
  addKey(anim, 'chest', 'rotate', 1.5, 0);

  addKey(anim, 'head', 'rotate', 0.0, 0);
  addKey(anim, 'head', 'rotate', 0.15, 8.0);
  addKey(anim, 'head', 'rotate', 0.6, -2.0);
  addKey(anim, 'head', 'rotate', 1.5, 0);

  addKey(anim, 'upperarm_l', 'rotate', 0.0, 0);
  addKey(anim, 'upperarm_l', 'rotate', 0.15, 42);
  addKey(anim, 'upperarm_l', 'rotate', 0.7, 10);
  addKey(anim, 'upperarm_l', 'rotate', 1.5, 0);

  addKey(anim, 'upperarm_r', 'rotate', 0.0, 0);
  addKey(anim, 'upperarm_r', 'rotate', 0.15, -42);
  addKey(anim, 'upperarm_r', 'rotate', 0.7, -10);
  addKey(anim, 'upperarm_r', 'rotate', 1.5, 0);

  addSlotAttachmentKey(anim, 'eye_l', 0.0, 'eye_surprised_l');
  addSlotAttachmentKey(anim, 'eye_r', 0.0, 'eye_surprised_r');
  addSlotAttachmentKey(anim, 'mouth', 0.0, 'mouth_surprised');

  doc.animations.push(anim);
}

// ── 8.6 sleepy (2.8s slow yawn & droop) ───────────────────────────────────────
{
  const anim = new Animation('sleepy', 2.8);
  addKey(anim, 'chest', 'translate', 0.0, [0, 0]);
  addKey(anim, 'chest', 'translate', 1.4, [0, -4.5]);
  addKey(anim, 'chest', 'translate', 2.8, [0, 0]);

  addKey(anim, 'head', 'rotate', 0.0, 0);
  addKey(anim, 'head', 'rotate', 1.2, -7.5);
  addKey(anim, 'head', 'rotate', 2.8, 0);

  addKey(anim, 'upperarm_l', 'rotate', 0.0, 0);
  addKey(anim, 'upperarm_l', 'rotate', 1.0, 38);
  addKey(anim, 'upperarm_l', 'rotate', 1.8, 38);
  addKey(anim, 'upperarm_l', 'rotate', 2.8, 0);

  addSlotAttachmentKey(anim, 'eye_l', 0.0, 'eye_smug_l');
  addSlotAttachmentKey(anim, 'eye_r', 0.0, 'eye_blink_r');
  addSlotAttachmentKey(anim, 'mouth', 0.8, 'mouth_yawn');
  addSlotAttachmentKey(anim, 'hand_l', 0.8, 'hand_fist');

  doc.animations.push(anim);
}

// ── 8.7 proud (2.0s confident stance) ─────────────────────────────────────────
{
  const anim = new Animation('proud', 2.0);
  addKey(anim, 'chest', 'translate', 0.0, [0, 0]);
  addKey(anim, 'chest', 'translate', 0.6, [0, 5.0]);
  addKey(anim, 'chest', 'translate', 1.4, [0, 5.0]);
  addKey(anim, 'chest', 'translate', 2.0, [0, 0]);

  addKey(anim, 'chest', 'rotate', 0.0, 0);
  addKey(anim, 'chest', 'rotate', 0.6, 6.0);
  addKey(anim, 'chest', 'rotate', 1.4, 6.0);
  addKey(anim, 'chest', 'rotate', 2.0, 0);

  addKey(anim, 'head', 'rotate', 0.0, 0);
  addKey(anim, 'head', 'rotate', 0.6, 5.0);
  addKey(anim, 'head', 'rotate', 1.4, 5.0);
  addKey(anim, 'head', 'rotate', 2.0, 0);

  addKey(anim, 'upperarm_l', 'rotate', 0.0, 0);
  addKey(anim, 'upperarm_l', 'rotate', 0.5, 26);
  addKey(anim, 'upperarm_l', 'rotate', 1.5, 26);
  addKey(anim, 'upperarm_l', 'rotate', 2.0, 0);

  addKey(anim, 'upperarm_r', 'rotate', 0.0, 0);
  addKey(anim, 'upperarm_r', 'rotate', 0.5, -26);
  addKey(anim, 'upperarm_r', 'rotate', 1.5, -26);
  addKey(anim, 'upperarm_r', 'rotate', 2.0, 0);

  addSlotAttachmentKey(anim, 'eye_l', 0.0, 'eye_smug_l');
  addSlotAttachmentKey(anim, 'eye_r', 0.0, 'eye_smug_r');
  addSlotAttachmentKey(anim, 'mouth', 0.0, 'mouth_smirk');

  doc.animations.push(anim);
}

// ── 8.8 walk (1.0s complete stride cycle) ─────────────────────────────────────
{
  const anim = new Animation('walk', 1.0);
  // Pelvis bobbing (two dips per stride cycle)
  addKey(anim, 'hip', 'translate', 0.0, [0, 0]);
  addKey(anim, 'hip', 'translate', 0.25, [0, -4]);
  addKey(anim, 'hip', 'translate', 0.5, [0, 0]);
  addKey(anim, 'hip', 'translate', 0.75, [0, -4]);
  addKey(anim, 'hip', 'translate', 1.0, [0, 0]);

  // Left leg stride
  addKey(anim, 'thigh_l', 'rotate', 0.0, 24);
  addKey(anim, 'thigh_l', 'rotate', 0.25, 0);
  addKey(anim, 'thigh_l', 'rotate', 0.5, -22);
  addKey(anim, 'thigh_l', 'rotate', 0.75, 8);
  addKey(anim, 'thigh_l', 'rotate', 1.0, 24);

  addKey(anim, 'shin_l', 'rotate', 0.0, -8);
  addKey(anim, 'shin_l', 'rotate', 0.25, 28);
  addKey(anim, 'shin_l', 'rotate', 0.5, 4);
  addKey(anim, 'shin_l', 'rotate', 0.75, 16);
  addKey(anim, 'shin_l', 'rotate', 1.0, -8);

  // Right leg stride (phase-shifted 180 deg)
  addKey(anim, 'thigh_r', 'rotate', 0.0, -22);
  addKey(anim, 'thigh_r', 'rotate', 0.25, 8);
  addKey(anim, 'thigh_r', 'rotate', 0.5, 24);
  addKey(anim, 'thigh_r', 'rotate', 0.75, 0);
  addKey(anim, 'thigh_r', 'rotate', 1.0, -22);

  addKey(anim, 'shin_r', 'rotate', 0.0, 4);
  addKey(anim, 'shin_r', 'rotate', 0.25, 16);
  addKey(anim, 'shin_r', 'rotate', 0.5, -8);
  addKey(anim, 'shin_r', 'rotate', 0.75, 28);
  addKey(anim, 'shin_r', 'rotate', 1.0, 4);

  // Opposing arm swings
  addKey(anim, 'upperarm_l', 'rotate', 0.0, -22);
  addKey(anim, 'upperarm_l', 'rotate', 0.5, 22);
  addKey(anim, 'upperarm_l', 'rotate', 1.0, -22);

  addKey(anim, 'upperarm_r', 'rotate', 0.0, 22);
  addKey(anim, 'upperarm_r', 'rotate', 0.5, -22);
  addKey(anim, 'upperarm_r', 'rotate', 1.0, 22);

  // Hair & cape bounce
  addKey(anim, 'hair', 'rotate', 0.0, 0);
  addKey(anim, 'hair', 'rotate', 0.25, 4);
  addKey(anim, 'hair', 'rotate', 0.5, 0);
  addKey(anim, 'hair', 'rotate', 0.75, -4);
  addKey(anim, 'hair', 'rotate', 1.0, 0);

  doc.animations.push(anim);
}

// ── 8.9 run (0.65s dynamic sprint cycle) ──────────────────────────────────────
{
  const anim = new Animation('run', 0.65);
  // Forward lean & dynamic hip drop
  addKey(anim, 'chest', 'rotate', 0.0, -12);
  addKey(anim, 'chest', 'rotate', 0.32, -10);
  addKey(anim, 'chest', 'rotate', 0.65, -12);

  addKey(anim, 'hip', 'translate', 0.0, [0, 4]);
  addKey(anim, 'hip', 'translate', 0.16, [0, -10]);
  addKey(anim, 'hip', 'translate', 0.32, [0, 6]);
  addKey(anim, 'hip', 'translate', 0.48, [0, -10]);
  addKey(anim, 'hip', 'translate', 0.65, [0, 4]);

  // High knee drive left
  addKey(anim, 'thigh_l', 'rotate', 0.0, 48);
  addKey(anim, 'thigh_l', 'rotate', 0.32, -42);
  addKey(anim, 'thigh_l', 'rotate', 0.65, 48);

  addKey(anim, 'shin_l', 'rotate', 0.0, 24);
  addKey(anim, 'shin_l', 'rotate', 0.32, 60);
  addKey(anim, 'shin_l', 'rotate', 0.65, 24);

  // High knee drive right
  addKey(anim, 'thigh_r', 'rotate', 0.0, -42);
  addKey(anim, 'thigh_r', 'rotate', 0.32, 48);
  addKey(anim, 'thigh_r', 'rotate', 0.65, -42);

  addKey(anim, 'shin_r', 'rotate', 0.0, 60);
  addKey(anim, 'shin_r', 'rotate', 0.32, 24);
  addKey(anim, 'shin_r', 'rotate', 0.65, 60);

  // Pumping arm swings
  addKey(anim, 'upperarm_l', 'rotate', 0.0, -46);
  addKey(anim, 'upperarm_l', 'rotate', 0.32, 46);
  addKey(anim, 'upperarm_l', 'rotate', 0.65, -46);

  addKey(anim, 'upperarm_r', 'rotate', 0.0, 46);
  addKey(anim, 'upperarm_r', 'rotate', 0.32, -46);
  addKey(anim, 'upperarm_r', 'rotate', 0.65, 46);

  // Streaming hair flutter
  addKey(anim, 'hair', 'rotate', 0.0, 16);
  addKey(anim, 'hair', 'rotate', 0.32, 24);
  addKey(anim, 'hair', 'rotate', 0.65, 16);

  doc.animations.push(anim);
}

console.log(`Created ${doc.animations.length} animations`);

// 9. Repack and Save .rigby Project
const zipFiles = [
  { path: 'project.json', bytes: new TextEncoder().encode(JSON.stringify(doc.toObject(), null, 2)) }
];

// Retain all images
for (const [k, v] of entries) {
  if (k.startsWith('images/')) {
    zipFiles.push({ path: k, bytes: v });
  }
}
const packedRigby = zip(zipFiles);
await fs.writeFile(sourceRigbyPath, packedRigby);
console.log(`Updated ${sourceRigbyPath} (${packedRigby.byteLength} bytes)`);

// 10. Pack Texture Atlas
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

// 11. Copy to Nuxt web public assets
const webSpineDir = path.resolve('apps/web/public/assets/spine/character');
await fs.mkdir(webSpineDir, { recursive: true });
await fs.copyFile(atlasPath, path.join(webSpineDir, 'chibi_hero.atlas'));
await fs.copyFile(pngPath, path.join(webSpineDir, 'chibi_hero.png'));
console.log(`Copied atlas & png to ${webSpineDir}`);
