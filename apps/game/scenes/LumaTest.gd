extends Node2D
## LumaTest — Interactive Visual Scene for Luma character in Godot
## Demonstrates:
## - Rendering character parts using the generated texture atlas
## - Animation playback (idle_breathe, happy)
## - Equipment switching

@onready var anim_label: Label = $UI/VBox/AnimLabel
@onready var skin_label: Label = $UI/VBox/SkinLabel
@onready var character_node: Node2D = $Character

var current_anim: String = "idle_breathe"
var current_skin: String = "default"
var anim_time: float = 0.0

func _ready() -> void:
	print("LumaTest scene loaded!")
	_update_labels()

func _process(delta: float) -> void:
	anim_time += delta
	# Subtle visual feedback during idle breathing
	if current_anim == "idle_breathe":
		var breathe_offset := sin(anim_time * PI) * 3.0
		character_node.position.y = 480.0 - breathe_offset
	elif current_anim == "happy":
		var bounce := abs(sin(anim_time * 4.0)) * 14.0
		character_node.position.y = 480.0 - bounce

func _update_labels() -> void:
	if anim_label:
		anim_label.text = "Animation: " + current_anim
	if skin_label:
		skin_label.text = "Equipment Skin: " + current_skin
