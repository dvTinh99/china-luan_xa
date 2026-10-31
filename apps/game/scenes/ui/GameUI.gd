extends CanvasLayer
## GameUI — HUD overlay with loading screen, prompts, errors, and FPS counter.

@onready var loading_overlay: ColorRect = $UIRoot/LoadingOverlay
@onready var error_label: Label = $UIRoot/ErrorLabel
@onready var interact_prompt: Label = $UIRoot/InteractPrompt
@onready var fps_label: Label = $UIRoot/FPSLabel
@onready var title_label: Label = $UIRoot/TitleLabel


func _ready() -> void:
	add_to_group("game_ui")
	show_loading()


func _process(_delta: float) -> void:
	if fps_label:
		fps_label.text = "FPS: %d" % Engine.get_frames_per_second()


# ── Public API ───────────────────────────────────────────────────────────────
func show_loading() -> void:
	if loading_overlay:
		loading_overlay.visible = true


func hide_loading() -> void:
	if loading_overlay:
		# Fade out
		var tween := create_tween()
		tween.tween_property(loading_overlay, "modulate:a", 0.0, 0.4)
		tween.tween_callback(func():
			loading_overlay.visible = false
			loading_overlay.modulate.a = 1.0
		)


func show_error(message: String) -> void:
	if error_label:
		error_label.text = message
		error_label.visible = true
		error_label.modulate.a = 1.0
		# Auto-hide after 5 seconds
		var tween := create_tween()
		tween.tween_interval(4.0)
		tween.tween_property(error_label, "modulate:a", 0.0, 1.0)
		tween.tween_callback(func(): error_label.visible = false)


func show_interact_prompt(show: bool) -> void:
	if interact_prompt:
		interact_prompt.visible = show

