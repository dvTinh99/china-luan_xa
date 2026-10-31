extends Node
## Bridge — Autoload singleton for all Nuxt ↔ Godot communication.
##
## In web builds, registers a JS callback and uses postMessage.
## In desktop/editor builds, auto-initializes with mock data so the game is
## playable without the Nuxt host.

# ── Signals ──────────────────────────────────────────────────────────────────
signal game_init_received(data: Dictionary)
signal player_data_received(data: Dictionary)
signal world_data_received(data: Dictionary)
signal audio_setting_received(data: Dictionary)
signal game_paused
signal game_resumed
signal bridge_error(message: String)

# ── Constants ────────────────────────────────────────────────────────────────
const BRIDGE_VERSION := 1

# ── State ────────────────────────────────────────────────────────────────────
var _initialized := false
var _js_bridge_available := false
var _js_callback: JavaScriptObject  # prevent GC of the callback ref

# ── Lifecycle ────────────────────────────────────────────────────────────────
func _ready() -> void:
	if OS.has_feature("web"):
		_setup_web_bridge()
	else:
		# Desktop / editor mode — auto-init with mock data
		push_warning("Bridge: Not running in web mode, using mock data")
		call_deferred("_mock_init")


# ── Web bridge setup ─────────────────────────────────────────────────────────
func _setup_web_bridge() -> void:
	# Register a callback that Nuxt can call
	_js_callback = JavaScriptBridge.create_callback(_on_message_from_nuxt)
	JavaScriptBridge.get_interface("window").set("godotBridgeCallback", _js_callback)
	# Signal that game is ready
	_send_to_nuxt("GAME_READY", {})
	_js_bridge_available = true
	print("Bridge: Web bridge initialized, GAME_READY sent")


# ── Inbound message handler ─────────────────────────────────────────────────
func _on_message_from_nuxt(args: Array) -> void:
	if args.size() == 0:
		return

	var raw = args[0]
	var data: Dictionary

	if raw is String:
		var json := JSON.new()
		var err := json.parse(raw)
		if err != OK:
			push_error("Bridge: Failed to parse message: " + json.get_error_message())
			bridge_error.emit("Failed to parse message from host")
			return
		data = json.data
	elif raw is Dictionary:
		data = raw
	else:
		push_warning("Bridge: Unexpected argument type")
		return

	# Validate version
	if not data.has("version") or data["version"] != BRIDGE_VERSION:
		push_warning("Bridge: Version mismatch — expected %d, got %s" % [BRIDGE_VERSION, str(data.get("version", "none"))])
		return

	var msg_type: String = data.get("type", "")
	var payload: Dictionary = data.get("payload", {})
	var request_id: String = data.get("requestId", "")

	match msg_type:
		"GAME_INIT":
			_initialized = true
			game_init_received.emit(payload)
			print("Bridge: GAME_INIT received")
		"PLAYER_DATA":
			player_data_received.emit(payload)
		"WORLD_DATA":
			world_data_received.emit(payload)
		"SET_AUDIO":
			audio_setting_received.emit(payload)
		"PAUSE_GAME":
			get_tree().paused = true
			game_paused.emit()
			print("Bridge: Game paused")
		"RESUME_GAME":
			get_tree().paused = false
			game_resumed.emit()
			print("Bridge: Game resumed")
		_:
			push_warning("Bridge: Unknown message type: " + msg_type)


# ── Outbound helpers ─────────────────────────────────────────────────────────
func _send_to_nuxt(type: String, payload: Dictionary, request_id: String = "") -> void:
	var message := {
		"version": BRIDGE_VERSION,
		"type": type,
		"payload": payload,
	}
	if request_id != "":
		message["requestId"] = request_id

	if OS.has_feature("web") and _js_bridge_available:
		var json_str := JSON.stringify(message)
		JavaScriptBridge.eval("window.parent.postMessage(" + json_str + ", '*')")
	else:
		print("Bridge (mock): → %s  %s" % [type, str(payload)])


func send_game_ready() -> void:
	_send_to_nuxt("GAME_READY", {})


func send_game_error(error_message: String) -> void:
	_send_to_nuxt("GAME_ERROR", {"message": error_message})


func send_interact_npc(npc_id: String) -> void:
	var request_id := "req_" + str(Time.get_unix_time_from_system())
	_send_to_nuxt("INTERACT_NPC", {"npcId": npc_id}, request_id)


func send_enter_region(region_id: String) -> void:
	_send_to_nuxt("ENTER_REGION", {"regionId": region_id})


func send_open_app_route(route: String) -> void:
	# Only allow approved routes
	var allowed_routes := ["/learn", "/inventory", "/shop", "/quests", "/character", "/profile"]
	if route in allowed_routes:
		_send_to_nuxt("OPEN_APP_ROUTE", {"route": route})
	else:
		push_warning("Bridge: Route not in allowlist: " + route)


# ── Mock init for desktop / editor ──────────────────────────────────────────
func _mock_init() -> void:
	var mock_data := {
		"player": {
			"id": "demo_user",
			"username": "DemoPlayer",
			"character": {
				"name": "Hero",
				"level": 1,
			},
		},
		"world": {
			"regions": [
				{"id": "beginner_village", "name": "Beginner Village", "unlocked": true},
			],
		},
		"config": {
			"bridgeVersion": BRIDGE_VERSION,
		},
	}
	_initialized = true
	game_init_received.emit(mock_data)
	print("Bridge: Mock init complete")


# ── Public queries ───────────────────────────────────────────────────────────
func is_initialized() -> bool:
	return _initialized

