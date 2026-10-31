extends Node2D
## Main — Root scene controller.
##
## Waits for Bridge.game_init_received before enabling gameplay.
## Connects to bridge lifecycle signals (pause, resume, error).

@onready var player: CharacterBody2D = $Player
@onready var game_ui: CanvasLayer = $GameUI

var _game_started := false


func _ready() -> void:
	# Connect bridge signals
	Bridge.game_init_received.connect(_on_game_init)
	Bridge.game_paused.connect(_on_game_paused)
	Bridge.game_resumed.connect(_on_game_resumed)
	Bridge.bridge_error.connect(_on_bridge_error)

	# Disable player until bridge initializes
	if player:
		player.set_process(false)
		player.set_physics_process(false)


func _on_game_init(data: Dictionary) -> void:
	_game_started = true

	# Enable player
	if player:
		player.set_process(true)
		player.set_physics_process(true)

	# Hide loading overlay
	if game_ui and game_ui.has_method("hide_loading"):
		game_ui.hide_loading()

	print("Main: Game initialized — data keys: ", data.keys())


func _on_game_paused() -> void:
	print("Main: Game paused")


func _on_game_resumed() -> void:
	print("Main: Game resumed")


func _on_bridge_error(message: String) -> void:
	if game_ui and game_ui.has_method("show_error"):
		game_ui.show_error(message)
	push_error("Main: Bridge error — " + message)

