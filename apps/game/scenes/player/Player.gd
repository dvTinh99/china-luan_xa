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

