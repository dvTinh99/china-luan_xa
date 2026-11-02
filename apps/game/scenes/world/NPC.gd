extends StaticBody2D
## NPC — Interactable non-player character.
##
## Detects when the player enters the interaction area, shows a prompt,
## and sends INTERACT_NPC through the Bridge when the player presses interact.

@export var npc_id: String = "npc_001"
@export var npc_name: String = "Villager"

@onready var label: Label = $Label
@onready var interaction_area: Area2D = $InteractionArea
@onready var body_polygon: Polygon2D = $Body

var _player_in_range := false
var _base_color := Color(0.9, 0.4, 0.2, 1.0)
var _highlight_color := Color(1.0, 0.65, 0.35, 1.0)
var _original_y := 0.0


func _ready() -> void:
	_original_y = position.y
	if label:
		label.text = npc_name
	if interaction_area:
		interaction_area.body_entered.connect(_on_body_entered)
		interaction_area.body_exited.connect(_on_body_exited)


func _process(_delta: float) -> void:
	if _player_in_range and body_polygon:
		# Pulsing highlight when player is nearby
		var pulse := (sin(Time.get_ticks_msec() * 0.005) + 1.0) * 0.5
		body_polygon.color = _base_color.lerp(_highlight_color, pulse)
	elif body_polygon:
		body_polygon.color = _base_color


func _unhandled_input(event: InputEvent) -> void:
	if _player_in_range and event.is_action_pressed("interact"):
		_interact()
		get_viewport().set_input_as_handled()


func _on_body_entered(body: Node2D) -> void:
	if body is CharacterBody2D:
		_player_in_range = true
		_show_prompt(true)


func _on_body_exited(body: Node2D) -> void:
	if body is CharacterBody2D:
		_player_in_range = false
		_show_prompt(false)


func _interact() -> void:
	print("NPC: Player interacted with '%s' (%s)" % [npc_name, npc_id])

	# Check player's Chakra milestone status for region story NPC
	var active_tier: int = Bridge.get_active_chakra_tier()
	var is_village_unlocked: bool = Bridge.is_region_unlocked("region_novice_village")
	print("NPC: Story check — Active Chakra Tier: %d | Novice Village Unlocked: %s" % [active_tier, str(is_village_unlocked)])

	Bridge.send_interact_npc(npc_id)

	# Bounce feedback
	var tween := create_tween()
	tween.tween_property(self, "position:y", _original_y - 8.0, 0.1).set_ease(Tween.EASE_OUT)
	tween.tween_property(self, "position:y", _original_y, 0.15).set_ease(Tween.EASE_IN).set_trans(Tween.TRANS_BOUNCE)


func _show_prompt(show: bool) -> void:
	var ui := get_tree().get_first_node_in_group("game_ui")
	if ui and ui.has_method("show_interact_prompt"):
		ui.show_interact_prompt(show)

