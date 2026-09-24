class_name C038
extends B038

var extra

func _init(t, e):
	super(t)
	extra = e

func show():
	return super.show() + "|C:" + extra
