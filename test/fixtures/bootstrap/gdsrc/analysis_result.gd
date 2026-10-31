class Analysis:
	var owner = ""
	var diagnostics = []
	var source = "none"

	func pos_read_label(e):
		return null

	func bound_face(e):
		return null

	func is_dict_int_read(e):
		return false

	func is_global_value_read(e):
		return false

	func is_native_class_value_read(e):
		return false

	func is_host_method_value_read(e):
		return false

	func is_engine_prop_read(e):
		return false

	func lambda_capture_names(e):
		return []


static func no_analysis():
	return Analysis.new()
