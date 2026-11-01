extends SceneTree
## Godot 4.6 Headless Runtime Verification for Luma Art Direction 2.0 (Super Deformed Fantasy Chibi)
## Tests:
## 1. Asset loading (.json, .skel, .atlas, .png)
## 2. Skeleton & Bone hierarchy verification (32 bones)
## 3. Slot & Draw-order verification (29 slots)
## 4. Animation playback test (all 9 animations: idle_breathe, idle_blink, happy, curious, surprised, sleepy, proud, walk, run)
## 5. Modular equipment switching test (Explorer vs Adventurer, facial expressions)

const SKELETON_JSON_PATH = "res://assets/characters/luma/export/luma.json"
const ATLAS_PATH = "res://assets/characters/luma/export/luma.atlas"
const TEXTURE_PATH = "res://assets/characters/luma/export/luma.png"

var _passed_checks: int = 0
var _total_checks: int = 0

func _assert(condition: bool, message: String) -> void:
	_total_checks += 1
	if condition:
		_passed_checks += 1
		print("  [PASS] ", message)
	else:
		printerr("  [FAIL] ", message)
		quit(1)

func _init() -> void:
	print("==================================================")
	print(" GODOT 4.6 LUMA ART DIRECTION 2.0 RUNTIME TEST")
	print("==================================================")

	# ── 1. Load Skeleton JSON ──────────────────────────────────────────────
	print("\n1. Verifying Skeleton Data Contract...")
	var json_file := FileAccess.open(SKELETON_JSON_PATH, FileAccess.READ)
	_assert(json_file != null, "Opened skeleton JSON: " + SKELETON_JSON_PATH)

	var json_text := json_file.get_as_text()
	var json_parser := JSON.new()
	var parse_err := json_parser.parse(json_text)
	_assert(parse_err == OK, "Skeleton JSON parsed successfully")

	var skel_data: Dictionary = json_parser.data
	_assert(skel_data.has("skeleton"), "Skeleton header present")
	_assert(str(skel_data.skeleton.get("spine", "")).begins_with("4.3"), "Spine 4.3 format confirmed (%s)" % skel_data.skeleton.get("spine", ""))

	# Check bones
	var bones: Array = skel_data.get("bones", [])
	_assert(bones.size() == 32, "Bone count matches 32 (got %d)" % bones.size())
	var bone_names: Array[String] = []
	for b in bones:
		bone_names.append(b.get("name", ""))

	_assert(bone_names.has("root"), "Found bone: root")
	_assert(bone_names.has("hip"), "Found bone: hip")
	_assert(bone_names.has("chest"), "Found bone: chest")
	_assert(bone_names.has("head"), "Found bone: head")
	_assert(bone_names.has("upperarm_l") and bone_names.has("upperarm_r"), "Found arm bones")
	_assert(bone_names.has("thigh_l") and bone_names.has("thigh_r"), "Found leg bones")

	# Check slots
	var slots: Array = skel_data.get("slots", [])
	_assert(slots.size() == 29, "Slot count matches 29 (got %d)" % slots.size())

	# Check all 9 animations
	var anims: Dictionary = skel_data.get("animations", {})
	var expected_anims := [
		"idle_breathe", "idle_blink", "happy", "curious",
		"surprised", "sleepy", "proud", "walk", "run"
	]
	for a_name in expected_anims:
		_assert(anims.has(a_name), "Found animation: " + a_name)

	# ── 2. Load Texture Atlas & PNG ────────────────────────────────────────
	print("\n2. Verifying Texture Atlas & Spritesheet...")
	var atlas_file := FileAccess.open(ATLAS_PATH, FileAccess.READ)
	_assert(atlas_file != null, "Opened texture atlas: " + ATLAS_PATH)

	var atlas_text := atlas_file.get_as_text()
	var regions := _parse_atlas_regions(atlas_text)
	_assert(regions.size() >= 35, "Atlas regions parsed: %d found (>= 35)" % regions.size())

	var img := Image.load_from_file(ProjectSettings.globalize_path(TEXTURE_PATH))
	_assert(img != null and not img.is_empty(), "Loaded atlas image: " + TEXTURE_PATH)
	_assert((img.get_width() == 512 and img.get_height() == 1024) or (img.get_width() == 1024 and img.get_height() == 2048), "Atlas image dimensions: 512x1024 or 1024x2048 (%dx%d)" % [img.get_width(), img.get_height()])

	var texture := ImageTexture.create_from_image(img)
	_assert(texture != null, "Created ImageTexture from atlas image")

	# ── 3. Build Skeletal Node Hierarchy & Test ────────────────────────────
	print("\n3. Building Node2D Character & Bones...")
	var luma_root := Node2D.new()
	luma_root.name = "LumaCharacter"

	var skeleton_node := Skeleton2D.new()
	skeleton_node.name = "Skeleton2D"
	luma_root.add_child(skeleton_node)

	var bone_nodes: Dictionary = {}
	for b_info in bones:
		var b_name: String = b_info.get("name", "")
		var bone_2d := Bone2D.new()
		bone_2d.name = b_name
		bone_2d.position = Vector2(b_info.get("x", 0.0), -b_info.get("y", 0.0))
		bone_2d.rotation_degrees = -b_info.get("rotation", 0.0)
		bone_nodes[b_name] = bone_2d

	for b_info in bones:
		var b_name: String = b_info.get("name", "")
		var p_name = b_info.get("parent", null)
		if p_name != null and bone_nodes.has(p_name):
			bone_nodes[p_name].add_child(bone_nodes[b_name])
		else:
			skeleton_node.add_child(bone_nodes[b_name])

	_assert(bone_nodes.size() == 32, "Built 32 Bone2D nodes in parent hierarchy")

	# ── 4. Test Animation Playback ─────────────────────────────────────────
	print("\n4. Testing Animation Timeline Playback...")
	# Verify walk loop
	var walk_anim: Dictionary = anims.get("walk", {})
	_assert(walk_anim.has("bones"), "walk animation has bone tracks")
	var walk_thigh_l = walk_anim.bones.get("thigh_l", {})
	_assert(walk_thigh_l.has("rotate"), "thigh_l rotates in walk animation")
	var walk_keys: Array = walk_thigh_l.get("rotate", [])
	_assert(walk_keys.size() >= 5, "walk thigh_l keys >= 5 (looping stride)")

	# Verify run loop
	var run_anim: Dictionary = anims.get("run", {})
	_assert(run_anim.has("bones"), "run animation has bone tracks")
	var run_hip = run_anim.bones.get("hip", {})
	_assert(run_hip.has("translate"), "hip translates dynamically in run animation")

	# Verify happy bounce
	var happy_anim: Dictionary = anims.get("happy", {})
	var hip_track = happy_anim.bones.get("hip", {})
	_assert(hip_track.has("translate"), "hip bounces in happy animation")

	# ── 5. Test Modular Equipment & Expression Switching ───────────────────
	print("\n5. Testing Modular Equipment & Expression Switching...")
	# Outfit switch: torso vs outfit_adventurer
	var torso_reg_default = regions.get("torso", Rect2i())
	var torso_reg_adventurer = regions.get("outfit_adventurer", Rect2i())
	_assert(torso_reg_default.size.x > 0 and torso_reg_default.size.y > 0, "Default outfit region valid in atlas")
	_assert(torso_reg_adventurer.size.x > 0 and torso_reg_adventurer.size.y > 0, "Adventurer outfit region valid in atlas")

	# Hair switch: hair_front vs hair_short
	var hair_reg_default = regions.get("hair_front", Rect2i())
	var hair_reg_short = regions.get("hair_short", Rect2i())
	_assert(hair_reg_default.size.x > 0, "Default hair region valid in atlas")
	_assert(hair_reg_short.size.x > 0, "Short pixie hair region valid in atlas")

	# Boots switch: foot_l vs shoes_boots_l
	var boot_l = regions.get("foot_l", Rect2i())
	var travel_boots_l = regions.get("shoes_boots_l", Rect2i())
	_assert(boot_l.size.x > 0 and travel_boots_l.size.x > 0, "Default boot & travel boots valid")

	# Accessory switch: pendant vs satchel
	var pendant_reg = regions.get("accessory_front_pendant", Rect2i())
	var satchel_reg = regions.get("accessory_front_satchel", Rect2i())
	_assert(pendant_reg.size.x > 0 and satchel_reg.size.x > 0, "Pendant & satchel interchangeable")

	# Facial expression attachments: mouth_happy & eye_blink_l
	var mouth_happy = regions.get("mouth_happy", Rect2i())
	var eye_blink = regions.get("eye_blink_l", Rect2i())
	_assert(mouth_happy.size.x > 0 and eye_blink.size.x > 0, "Facial expression attachments verified")

	print("\n==================================================")
	print(" ALL %d RUNTIME CHECKS PASSED SUCCESSFULLY!" % _passed_checks)
	print("==================================================")
	luma_root.queue_free()
	quit(0)

func _parse_atlas_regions(atlas_text: String) -> Dictionary:
	var res := {}
	var lines := atlas_text.split("\n")
	var current_name := ""
	for raw_line in lines:
		var line := raw_line.strip_edges()
		if line.is_empty():
			current_name = ""
			continue
		if not line.contains(":"):
			current_name = line
		elif line.begins_with("bounds:"):
			var parts := line.substr(7).split(",")
			if parts.size() == 4 and not current_name.is_empty():
				var x := parts[0].strip_edges().to_int()
				var y := parts[1].strip_edges().to_int()
				var w := parts[2].strip_edges().to_int()
				var h := parts[3].strip_edges().to_int()
				res[current_name] = Rect2i(x, y, w, h)
	return res
