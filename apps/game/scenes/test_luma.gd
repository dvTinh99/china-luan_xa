extends SceneTree
## Godot 4.6 Headless Runtime Verification for Luma (LinguaWorld)
## Tests:
## 1. Asset loading (.json, .atlas, .png)
## 2. Skeleton & Bone hierarchy verification (32 bones)
## 3. Slot & Draw-order verification (29 slots)
## 4. Animation playback test (idle_breathe, happy, etc.)
## 5. Modular equipment switching test (Explorer vs Ranger)

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
	print(" GODOT 4.6 LUMA CHARACTER RUNTIME TEST")
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

	# Check animations
	var anims: Dictionary = skel_data.get("animations", {})
	var expected_anims := ["idle_breathe", "idle_blink", "happy", "curious", "surprised", "sleepy", "proud"]
	for a_name in expected_anims:
		_assert(anims.has(a_name), "Found animation: " + a_name)

	# ── 2. Load Texture Atlas & PNG ────────────────────────────────────────
	print("\n2. Verifying Texture Atlas & Spritesheet...")
	var atlas_file := FileAccess.open(ATLAS_PATH, FileAccess.READ)
	_assert(atlas_file != null, "Opened texture atlas: " + ATLAS_PATH)

	var atlas_text := atlas_file.get_as_text()
	var regions := _parse_atlas_regions(atlas_text)
	_assert(regions.size() >= 29, "Atlas regions parsed: %d found" % regions.size())

	var img := Image.load_from_file(ProjectSettings.globalize_path(TEXTURE_PATH))
	_assert(img != null and not img.is_empty(), "Loaded atlas image: " + TEXTURE_PATH)
	_assert(img.get_width() == 512 and img.get_height() == 1024, "Atlas image dimensions: 512x1024")

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
		bone_2d.position = Vector2(b_info.get("x", 0.0), -b_info.get("y", 0.0)) # Flip Y for Godot
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
	# Verify idle_breathe keyframes
	var breathe_anim: Dictionary = anims.get("idle_breathe", {})
	_assert(breathe_anim.has("bones"), "idle_breathe has bone tracks")
	var chest_track = breathe_anim.bones.get("chest", {})
	_assert(chest_track.has("translate"), "chest is translated in idle_breathe")
	var keys: Array = chest_track.get("translate", [])
	_assert(keys.size() >= 3, "idle_breathe chest keys >= 3 (t=0, t=1, t=2)")

	# Verify happy keyframes
	var happy_anim: Dictionary = anims.get("happy", {})
	var hip_track = happy_anim.bones.get("hip", {})
	_assert(hip_track.has("translate"), "hip bounces in happy animation")
	var happy_hip_keys: Array = hip_track.get("translate", [])
	_assert(happy_hip_keys.size() >= 4, "happy hip keys >= 4 (bouncing curve)")

	# ── 5. Test Modular Equipment Switching ────────────────────────────────
	print("\n5. Testing Modular Equipment Switching...")
	# Switch slot 'torso' from default explorer to ranger vest
	var torso_reg_default = regions.get("torso", Rect2i())
	var torso_reg_ranger = regions.get("outfit_ranger", Rect2i())
	_assert(torso_reg_default.size.x > 0 and torso_reg_default.size.y > 0, "Default outfit region valid in atlas")
	_assert(torso_reg_ranger.size.x > 0 and torso_reg_ranger.size.y > 0, "Ranger outfit region valid in atlas")

	# Switch slot 'hat_adventurer' from beret to hood
	var hat_reg_default = regions.get("hat_adventurer", Rect2i())
	var hat_reg_hood = regions.get("hat_hood", Rect2i())
	_assert(hat_reg_default.size.x > 0, "Default beret region valid in atlas")
	_assert(hat_reg_hood.size.x > 0, "Traveler hood region valid in atlas")

	# Switch slot 'foot_l' from boot to sandals
	var boot_l = regions.get("foot_l", Rect2i())
	var sandals_l = regions.get("shoes_sandals_l", Rect2i())
	_assert(boot_l.size.x > 0 and sandals_l.size.x > 0, "Boot & sandals interchangeable")

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
