extends SceneTree

func _worker(x):
	return x * 2

func _initialize():
	var m := Mutex.new()
	m.lock()
	print("m1|", m.try_lock())
	m.unlock()
	print("m2|", m.try_lock())
	m.unlock()
	var s := Semaphore.new()
	print("s1|", s.try_wait())
	s.post()
	print("s2|", s.try_wait(), "|", s.try_wait())
	s.post(2)
	print("s3|", s.try_wait(), "|", s.try_wait(), "|", s.try_wait())
	var t := Thread.new()
	print("t1|", t.is_started(), "|", t.is_alive(), "|", t.is_main_thread())
	print("t2|", t.start(_worker.bind(21)))
	print("t3|", t.is_started(), "|", t.is_alive())
	print("t4|", t.wait_to_finish())
	print("t5|", t.is_started(), "|", t.is_alive(), "|", t.get_id())
	print("t6|", Thread.PRIORITY_LOW, "|", Thread.PRIORITY_NORMAL, "|", Thread.PRIORITY_HIGH)
	var t2 := Thread.new()
	print("t7|", t2.start(_worker.bind(1), Thread.PRIORITY_HIGH), "|", t2.wait_to_finish())
	quit()
