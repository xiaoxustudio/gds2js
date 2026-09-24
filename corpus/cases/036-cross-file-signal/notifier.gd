class_name Notifier

signal ping(value)

func fire(v):
	ping.emit(v)
