class_name Child
extends SupBase

func greet():
	return "child+" + super.greet()

func val():
	return super.val() + 10
