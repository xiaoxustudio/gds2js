extends SceneTree

func _initialize():
	var pz = 0.0
	var nz = pz * -1.0
	var one = 1.0
	print(typeof(nz), "|", nz, "|", 1.0 / (nz * one), "|", "%.1f" % (nz * one))
	print("floor|", 1.0 / (floor(nz) * one), "|", "%.1f" % (floor(nz) * one))
	print("ceil|", 1.0 / (ceil(nz) * one), "|", "%.1f" % (ceil(nz) * one))
	print("round|", 1.0 / (round(nz) * one), "|", "%.1f" % (round(nz) * one))
	print("floorf|", 1.0 / (floorf(nz) * one), "|", "%.1f" % (floorf(nz) * one))
	print("ceilf|", 1.0 / (ceilf(nz) * one), "|", "%.1f" % (ceilf(nz) * one))
	print("roundf|", 1.0 / (roundf(nz) * one), "|", "%.1f" % (roundf(nz) * one))
	print("floori|", typeof(floori(nz)), "|", 1.0 / (floori(nz) * one), "|", "%.1f" % (floori(nz) * one))
	print("ceili|", typeof(ceili(nz)), "|", 1.0 / (ceili(nz) * one), "|", "%.1f" % (ceili(nz) * one))
	print("roundi|", typeof(roundi(nz)), "|", 1.0 / (roundi(nz) * one), "|", "%.1f" % (roundi(nz) * one))
	print("clampf|", 1.0 / (clampf(nz, pz, one) * one), "|", "%.1f" % (clampf(nz, pz, one) * one))
	print("clampf2|", 1.0 / (clampf(nz, nz, one) * one), "|", "%.1f" % (clampf(nz, nz, one) * one))
	print("clamp|", 1.0 / (clamp(nz, pz, one) * one), "|", "%.1f" % (clamp(nz, pz, one) * one))
	print("deg_to_rad|", 1.0 / (deg_to_rad(nz) * one), "|", "%.1f" % (deg_to_rad(nz) * one))
	print("rad_to_deg|", 1.0 / (rad_to_deg(nz) * one), "|", "%.1f" % (rad_to_deg(nz) * one))
	print("fmod|", 1.0 / (fmod(nz, one) * one), "|", "%.1f" % (fmod(nz, one) * one))
	print("sqrt|", 1.0 / (sqrt(nz) * one), "|", "%.1f" % (sqrt(nz) * one))
	print("abs|", 1.0 / (abs(nz) * one), "|", "%.1f" % (abs(nz) * one))
	print("sign|", 1.0 / (sign(nz) * one), "|", "%.1f" % (sign(nz) * one))
	print("snapped|", 1.0 / (snapped(nz, one) * one), "|", "%.1f" % (snapped(nz, one) * one))
	print("fposmod|", 1.0 / (fposmod(nz, one) * one), "|", "%.1f" % (fposmod(nz, one) * one))
	print("lerp|", 1.0 / (lerpf(nz, one, pz) * one), "|", "%.1f" % (lerpf(nz, one, pz) * one))
	print("neg|", 1.0 / (-nz * one), "|", "%.1f" % (-nz * one))
	print("negneg|", 1.0 / (-(-nz) * one), "|", "%.1f" % (-(-nz) * one))
	print("key|", {0.0: "zero"}[nz], "|", hash(nz), "|", hash(pz))
	quit()
