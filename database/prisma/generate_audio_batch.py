#!/usr/bin/env python3
"""
LinguaWorld — Batch Audio Generator for Learning Vocabulary
Generates authentic, high-clarity Mandarin Chinese MP3s using edge-tts
"""

import sys
import os
import json
import asyncio
import hashlib
import edge_tts

VOICE = "zh-CN-XiaoxiaoNeural"
RATE = "-10%" # Slightly slower for clear tone perception in learners

async def generate_item(item, output_dir, semaphore):
    vocab_id = item["id"]
    text = item["simplified"]
    item_dir = os.path.join(output_dir, f"vocab_{vocab_id}", "vp_learning_standard")
    os.makedirs(item_dir, exist_ok=True)
    out_file = os.path.join(item_dir, "v1.mp3")

    async with semaphore:
        for attempt in range(3):
            try:
                communicate = edge_tts.Communicate(text, VOICE, rate=RATE)
                await communicate.save(out_file)
                size = os.path.getsize(out_file)
                if size > 0:
                    with open(out_file, "rb") as f:
                        md5 = hashlib.md5(f.read()).hexdigest()
                    return {
                        "id": vocab_id,
                        "simplified": text,
                        "url": f"/audio/learning/hsk-3.0/band-1/vocab_{vocab_id}/vp_learning_standard/v1.mp3",
                        "storageKey": f"learning/hsk-3.0/band-1/vocab_{vocab_id}/vp_learning_standard/v1.mp3",
                        "size": size,
                        "checksum": md5,
                        "status": "success"
                    }
            except Exception as e:
                if attempt == 2:
                    return {"id": vocab_id, "simplified": text, "status": "error", "error": str(e)}
                await asyncio.sleep(0.5)

async def main():
    if len(sys.argv) < 3:
        print("Usage: generate_audio_batch.py <items_json_path> <output_dir>")
        sys.exit(1)

    items_json_path = sys.argv[1]
    output_dir = sys.argv[2]

    with open(items_json_path, "r", encoding="utf-8") as f:
        items = json.load(f)

    semaphore = asyncio.Semaphore(10) # 10 concurrent requests
    tasks = [generate_item(item, output_dir, semaphore) for item in items]
    results = await asyncio.gather(*tasks)

    print(json.dumps(results, ensure_ascii=False))

if __name__ == "__main__":
    asyncio.run(main())

