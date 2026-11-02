extends CharacterBody2D
## Player — 8-directional movement with simple walk animation.
##
## Uses WASD / Arrow keys (via input map actions).
## Flips sprite based on facing direction.
## Bobs up/down while walking.

@export var speed: float = 200.0

@onready var body: Polygon2D = $Body
@onready var head: Polygon2D = $Head

var _facing_right := true
var _is_moving := false

# ── Chakra Aura Visuals ──────────────────────────────────────────────────────
var _aura_node: Polygon2D
var _aura_base_color := Color(0.94, 0.27, 0.27, 0.5)


func _ready() -> void:
	_setup_chakra_aura()
	if Bridge.has_signal("chakra_data_received"):
		Bridge.chakra_data_received.connect(_on_chakra_data_received)
	if Bridge.is_initialized():
		_update_aura_color(Bridge.get_aura_color_hex())


func _setup_chakra_aura() -> void:
	_aura_node = Polygon2D.new()
	_aura_node.name = "ChakraAura"
	_aura_node.z_index = -1
	_aura_node.position = Vector2(0, 14) # Under feet

	# Create smooth 24-point ellipse for ground aura
	var points := PackedVector2Array()
	var num_points := 24
	var rx := 22.0
	var ry := 9.0
	for i in range(num_points):
		var angle := (float(i) / float(num_points)) * TAU
		points.append(Vector2(cos(angle) * rx, sin(angle) * ry))

	_aura_node.polygon = points
	_aura_node.color = _aura_base_color
	add_child(_aura_node)


func _on_chakra_data_received(data: Dictionary) -> void:
	var hex_str: String = data.get("aura_color_hex", "#EF4444")
	_update_aura_color(hex_str)


func _update_aura_color(hex_str: String) -> void:
	var parsed_color := Color.from_string(hex_str, Color(0.94, 0.27, 0.27, 1.0))
	_aura_base_color = Color(parsed_color.r, parsed_color.g, parsed_color.b, 0.55)
	if _aura_node:
		_aura_node.color = _aura_base_color


func _physics_process(_delta: float) -> void:
	# Read input
	var input_dir := Vector2.ZERO
	input_dir.x = Input.get_axis("move_left", "move_right")
	input_dir.y = Input.get_axis("move_up", "move_down")

	# Normalize diagonal movement
	if input_dir.length() > 1.0:
		input_dir = input_dir.normalized()

	velocity = input_dir * speed

	# Track facing direction (only update on meaningful horizontal input)
	if input_dir.x > 0.1:
		_facing_right = true
	elif input_dir.x < -0.1:
		_facing_right = false

	_is_moving = input_dir.length() > 0.01

	_update_visual()
	move_and_slide()


func _update_visual() -> void:
	# Flip character based on facing direction
	var sx := 1.0 if _facing_right else -1.0
	if body:
		body.scale.x = sx
	if head:
		head.scale.x = sx

	# Walk bob animation
	if _is_moving:
		var bob := sin(Time.get_ticks_msec() * 0.012) * 2.5
		if body:
			body.position.y = bob
		if head:
			head.position.y = -28.0 + bob
	else:
		# Idle — subtle breathing
		var breathe := sin(Time.get_ticks_msec() * 0.003) * 0.5
		if body:
			body.position.y = breathe
		if head:
			head.position.y = -28.0 + breathe

	# Pulse & animate Chakra ground aura
	if _aura_node:
		var pulse := 1.0 + sin(Time.get_ticks_msec() * 0.004) * 0.12
		_aura_node.scale = Vector2(pulse, pulse)
		var alpha := 0.45 + sin(Time.get_ticks_msec() * 0.004) * 0.15
		_aura_node.color.a = alpha

