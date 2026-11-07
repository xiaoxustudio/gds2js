// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  declare src: rt.Variant;
  declare stack: rt.Variant;
  declare pending: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      this.src = rt.V.nil();
      this.stack = rt.V.nil();
      this.pending = rt.V.nil();
      rt.frameLine(3);
      this.src = rt.V.str("");
      rt.frameLine(4);
      this.stack = rt.V.array(rt.GArray.of([]));
      rt.frameLine(5);
      this.pending = rt.V.array(rt.GArray.of([]));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  constructor() {
    super();
    this.__gd_fields__();
  }

    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(9);
      this.src = rt.V.str("var x = 1 + \"é😀\"\n");
      rt.frameLine(10);
      this.build();
      rt.frameLine(11);
      let root = this.root_finish(rt.method(this.src, "length", []));
      rt.frameLine(12);
      this.dump(root, rt.V.int(0));
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("z|"), rt.method(this.stack, "size", []), rt.V.str("|"), rt.method(this.pending, "size", [])]));
      rt.frameLine(14);
      this.dump(this.rebuild_with_lift(), rt.V.int(0));
      rt.frameLine(15);
      this.quit();
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  tok(kind: rt.Variant, start: rt.Variant, len: rt.Variant, row: rt.Variant, col: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "tok");
    try {
      rt.frameLine(19);
      return rt.dictOf([[rt.V.str("kind"), kind], [rt.V.str("start"), start], [rt.V.str("end"), rt.ops.add(start, len)], [rt.V.str("row"), row], [rt.V.str("col"), col]]);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  pos_of(t: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "pos_of");
    try {
      rt.frameLine(23);
      return rt.dictOf([[rt.V.str("index"), rt.wrapValue(rt.index(t, rt.V.str("start")))], [rt.V.str("row"), rt.wrapValue(rt.index(t, rt.V.str("row")))], [rt.V.str("col"), rt.wrapValue(rt.index(t, rt.V.str("col")))]]);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  mk(type: rt.Variant, is_named: rt.Variant, field_name: rt.Variant, start: rt.Variant, end: rt.Variant, children: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "mk");
    try {
      rt.frameLine(27);
      return rt.dictOf([[rt.V.str("type"), type], [rt.V.str("text"), rt.method(this.src, "substr", [rt.wrapValue(rt.index(start, rt.V.str("index"))), rt.ops.sub(end, rt.wrapValue(rt.index(start, rt.V.str("index"))))])], [rt.V.str("isNamed"), is_named], [rt.V.str("hasError"), rt.V.bool(false)], [rt.V.str("startIndex"), rt.wrapValue(rt.index(start, rt.V.str("index")))], [rt.V.str("endIndex"), end], [rt.V.str("startPosition"), rt.dictOf([[rt.V.str("row"), rt.wrapValue(rt.index(start, rt.V.str("row")))], [rt.V.str("column"), rt.wrapValue(rt.index(start, rt.V.str("col")))]])], [rt.V.str("fieldName"), field_name], [rt.V.str("children"), children], [rt.V.str("namedChildren"), this.named_of(children)]]);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  named_of(children: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "named_of");
    try {
      rt.frameLine(42);
      let out = rt.V.array(rt.GArray.of([]));
      rt.frameLine(43);
      for (let c of rt.iter(children)) {
        rt.frameLine(44);
        if (rt.ops.truthy(rt.wrapValue(rt.index(c, rt.V.str("isNamed"))))) {
          rt.frameLine(45);
          rt.method(out, "append", [c]);
        }
      }
      rt.frameLine(46);
      return out;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  open(type: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "open");
    try {
      rt.frameLine(50);
      rt.method(this.stack, "append", [rt.dictOf([[rt.V.str("type"), type], [rt.V.str("isNamed"), rt.V.bool(true)], [rt.V.str("children"), rt.V.array(rt.GArray.of([]))], [rt.V.str("start"), rt.V.nil()], [rt.V.str("end"), rt.V.nil()]])]);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  open_anon(type: rt.Variant, t: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "open_anon");
    try {
      rt.frameLine(54);
      rt.method(this.stack, "append", [rt.dictOf([[rt.V.str("type"), type], [rt.V.str("isNamed"), rt.V.bool(false)], [rt.V.str("children"), rt.V.array(rt.GArray.of([]))], [rt.V.str("start"), this.pos_of(t)], [rt.V.str("end"), rt.V.nil()]])]);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  close(field_name: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "close");
    try {
      rt.frameLine(58);
      let d = rt.method(this.stack, "pop_back", []);
      rt.frameLine(59);
      let kids = rt.wrapValue(rt.index(d, rt.V.str("children")));
      rt.frameLine(60);
      let start = rt.wrapValue(rt.index(d, rt.V.str("start")));
      rt.frameLine(61);
      if (rt.ops.truthy(rt.ops.eq(start, rt.V.nil()))) {
        rt.frameLine(62);
        if (rt.ops.truthy(rt.method(kids, "is_empty", []))) {
          rt.frameLine(63);
          return rt.V.nil();
        }
        rt.frameLine(64);
        start = rt.dictOf([[rt.V.str("index"), rt.wrapValue(rt.index(rt.wrapValue(rt.index(kids, rt.V.int(0))), rt.V.str("startIndex")))], [rt.V.str("row"), rt.wrapValue(rt.index(rt.wrapValue(rt.index(rt.wrapValue(rt.index(kids, rt.V.int(0))), rt.V.str("startPosition"))), rt.V.str("row")))], [rt.V.str("col"), rt.wrapValue(rt.index(rt.wrapValue(rt.index(rt.wrapValue(rt.index(kids, rt.V.int(0))), rt.V.str("startPosition"))), rt.V.str("column")))]]);
      }
      rt.frameLine(65);
      let end = rt.wrapValue(rt.index(d, rt.V.str("end")));
      rt.frameLine(66);
      if (rt.ops.truthy(rt.ops.eq(end, rt.V.nil()))) {
        rt.frameLine(67);
        end = rt.tern(rt.method(kids, "is_empty", []), () => rt.wrapValue(rt.index(start, rt.V.str("index"))), () => rt.wrapValue(rt.index(rt.wrapValue(rt.index(kids, rt.ops.sub(rt.method(kids, "size", []), rt.V.int(1)))), rt.V.str("endIndex"))));
      }
      rt.frameLine(68);
      let node = this.mk(rt.wrapValue(rt.index(d, rt.V.str("type"))), rt.wrapValue(rt.index(d, rt.V.str("isNamed"))), field_name, start, end, kids);
      rt.frameLine(69);
      if (rt.ops.truthy(rt.V.bool(!rt.ops.truthy(rt.method(this.stack, "is_empty", []))))) {
        rt.frameLine(70);
        rt.method(rt.wrapValue(rt.index(rt.wrapValue(rt.index(this.stack, rt.ops.sub(rt.method(this.stack, "size", []), rt.V.int(1)))), rt.V.str("children"))), "append", [node]);
      }
      rt.frameLine(71);
      return node;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  leaf(type: rt.Variant, t: rt.Variant, field_name: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "leaf");
    try {
      rt.frameLine(75);
      this.flush();
      rt.frameLine(76);
      rt.method(rt.wrapValue(rt.index(rt.wrapValue(rt.index(this.stack, rt.ops.sub(rt.method(this.stack, "size", []), rt.V.int(1)))), rt.V.str("children"))), "append", [this.mk(type, rt.V.bool(true), field_name, this.pos_of(t), rt.wrapValue(rt.index(t, rt.V.str("end"))), rt.V.array(rt.GArray.of([])))]);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  anon(t: rt.Variant, field_name: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "anon");
    try {
      rt.frameLine(80);
      this.flush();
      rt.frameLine(81);
      rt.method(rt.wrapValue(rt.index(rt.wrapValue(rt.index(this.stack, rt.ops.sub(rt.method(this.stack, "size", []), rt.V.int(1)))), rt.V.str("children"))), "append", [this.mk(rt.wrapValue(rt.index(t, rt.V.str("kind"))), rt.V.bool(false), field_name, this.pos_of(t), rt.wrapValue(rt.index(t, rt.V.str("end"))), rt.V.array(rt.GArray.of([])))]);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  attach(node: rt.Variant, field_name: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "attach");
    try {
      rt.frameLine(85);
      {
        const _nv = rt.writeIdx(node, rt.V.str("fieldName"), field_name);
        if (_nv !== null) node = _nv;
      }
      rt.frameLine(86);
      rt.method(rt.wrapValue(rt.index(rt.wrapValue(rt.index(this.stack, rt.ops.sub(rt.method(this.stack, "size", []), rt.V.int(1)))), rt.V.str("children"))), "append", [node]);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  set_last_field(field_name: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "set_last_field");
    try {
      rt.frameLine(90);
      let kids = rt.wrapValue(rt.index(rt.wrapValue(rt.index(this.stack, rt.ops.sub(rt.method(this.stack, "size", []), rt.V.int(1)))), rt.V.str("children")));
      rt.frameLine(91);
      {
      const _w0 = rt.ops.sub(rt.method(kids, "size", []), rt.V.int(1));
        const _nv = rt.writeIdx(rt.index(kids, _w0), rt.V.str("fieldName"), field_name);
        if (_nv !== null) rt.setIndex(kids, _w0, _nv);
      }
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  lift_last(): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "lift_last");
    try {
      rt.frameLine(95);
      let kids = rt.wrapValue(rt.index(rt.wrapValue(rt.index(this.stack, rt.ops.sub(rt.method(this.stack, "size", []), rt.V.int(1)))), rt.V.str("children")));
      rt.frameLine(96);
      return rt.method(kids, "pop_back", []);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  mark(): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "mark");
    try {
      rt.frameLine(100);
      return rt.method(rt.wrapValue(rt.index(rt.wrapValue(rt.index(this.stack, rt.ops.sub(rt.method(this.stack, "size", []), rt.V.int(1)))), rt.V.str("children"))), "size", []);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  splice_from(m: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "splice_from");
    try {
      rt.frameLine(104);
      let kids = rt.wrapValue(rt.index(rt.wrapValue(rt.index(this.stack, rt.ops.sub(rt.method(this.stack, "size", []), rt.V.int(1)))), rt.V.str("children")));
      rt.frameLine(105);
      let out = rt.V.array(rt.GArray.of([]));
      rt.frameLine(106);
      for (let i of rt.rangeSeq([m, rt.method(kids, "size", [])])) {
        rt.frameLine(107);
        rt.method(out, "append", [rt.wrapValue(rt.index(kids, rt.V.int(i)))]);
      }
      rt.frameLine(108);
      while (rt.ops.truthy(rt.ops.gt(rt.method(kids, "size", []), m))) {
        rt.frameLine(109);
        rt.method(kids, "pop_back", []);
      }
      rt.frameLine(110);
      return rt.wrapValue(rt.index(out, rt.V.int(0)));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  set_end(t: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "set_end");
    try {
      rt.frameLine(114);
      {
      const _w0 = rt.ops.sub(rt.method(this.stack, "size", []), rt.V.int(1));
        const _nv = rt.writeIdx(rt.index(this.stack, _w0), rt.V.str("end"), rt.wrapValue(rt.index(t, rt.V.str("end"))));
        if (_nv !== null) rt.setIndex(this.stack, _w0, _nv);
      }
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  stash_comment(t: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "stash_comment");
    try {
      rt.frameLine(118);
      rt.method(this.pending, "append", [this.mk(rt.V.str("comment"), rt.V.bool(true), rt.V.str(""), this.pos_of(t), rt.wrapValue(rt.index(t, rt.V.str("end"))), rt.V.array(rt.GArray.of([])))]);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  flush(): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "flush");
    try {
      rt.frameLine(122);
      if (rt.ops.truthy(rt.method(this.pending, "is_empty", []))) {
        rt.frameLine(123);
        return;
      }
      rt.frameLine(124);
      for (let n of rt.iter(this.pending)) {
        rt.frameLine(125);
        rt.method(rt.wrapValue(rt.index(rt.wrapValue(rt.index(this.stack, rt.ops.sub(rt.method(this.stack, "size", []), rt.V.int(1)))), rt.V.str("children"))), "append", [n]);
      }
      rt.frameLine(126);
      this.pending = rt.V.array(rt.GArray.of([]));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  root_finish(end_index: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "root_finish");
    try {
      rt.frameLine(130);
      this.flush();
      rt.frameLine(131);
      let root = this.close(rt.V.str(""));
      rt.frameLine(132);
      {
        const _nv = rt.writeIdx(root, rt.V.str("endIndex"), end_index);
        if (_nv !== null) root = _nv;
      }
      rt.frameLine(133);
      {
        const _nv = rt.writeIdx(root, rt.V.str("text"), rt.method(this.src, "substr", [rt.wrapValue(rt.index(root, rt.V.str("startIndex"))), rt.ops.sub(end_index, rt.wrapValue(rt.index(root, rt.V.str("startIndex"))))]));
        if (_nv !== null) root = _nv;
      }
      rt.frameLine(134);
      return root;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  dump(n: rt.Variant, depth: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "dump");
    try {
      rt.frameLine(138);
      let sp = rt.wrapValue(rt.index(n, rt.V.str("startPosition")));
      rt.frameLine(139);
      print(rt.showArgs([rt.V.str("n|"), depth, rt.V.str("|"), rt.wrapValue(rt.index(n, rt.V.str("type"))), rt.V.str("|"), rt.wrapValue(rt.index(n, rt.V.str("isNamed"))), rt.V.str("|"), rt.wrapValue(rt.index(n, rt.V.str("hasError"))), rt.V.str("|"), rt.wrapValue(rt.index(n, rt.V.str("fieldName"))), rt.V.str("|"), rt.wrapValue(rt.index(n, rt.V.str("startIndex"))), rt.V.str("|"), rt.wrapValue(rt.index(n, rt.V.str("endIndex"))), rt.V.str("|"), rt.wrapValue(rt.index(sp, rt.V.str("row"))), rt.V.str("|"), rt.wrapValue(rt.index(sp, rt.V.str("column"))), rt.V.str("|"), rt.wrapValue(rt.index(n, rt.V.str("text"))), rt.V.str("|"), rt.method(rt.wrapValue(rt.index(n, rt.V.str("children"))), "size", []), rt.V.str("|"), rt.method(rt.wrapValue(rt.index(n, rt.V.str("namedChildren"))), "size", [])]));
      rt.frameLine(140);
      for (let c of rt.iter(rt.wrapValue(rt.index(n, rt.V.str("children"))))) {
        rt.frameLine(141);
        this.dump(c, rt.ops.add(depth, rt.V.int(1)));
      }
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  build(): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "build");
    try {
      rt.frameLine(145);
      this.open(rt.V.str("source"));
      rt.frameLine(146);
      this.leaf(rt.V.str("identifier"), this.tok(rt.V.str("ident"), rt.V.int(0), rt.V.int(3), rt.V.int(0), rt.V.int(0)), rt.V.str("left"));
      rt.frameLine(147);
      this.anon(this.tok(rt.V.str("="), rt.V.int(3), rt.V.int(1), rt.V.int(0), rt.V.int(3)), rt.V.str(""));
      rt.frameLine(148);
      this.open(rt.V.str("binary_operator"));
      rt.frameLine(149);
      this.anon(this.tok(rt.V.str("int"), rt.V.int(4), rt.V.int(1), rt.V.int(0), rt.V.int(4)), rt.V.str("left"));
      rt.frameLine(150);
      this.anon(this.tok(rt.V.str("+"), rt.V.int(6), rt.V.int(1), rt.V.int(0), rt.V.int(6)), rt.V.str("operator"));
      rt.frameLine(151);
      this.leaf(rt.V.str("string"), this.tok(rt.V.str("str"), rt.V.int(8), rt.V.int(6), rt.V.int(0), rt.V.int(8)), rt.V.str("right"));
      rt.frameLine(152);
      let extra = this.tok(rt.V.str("cmt"), rt.V.int(14), rt.V.int(5), rt.V.int(0), rt.V.int(14));
      rt.frameLine(153);
      this.stash_comment(extra);
      rt.frameLine(154);
      this.close(rt.V.str("right"));
      rt.frameLine(155);
      this.set_last_field(rt.V.str("right"));
      rt.frameLine(156);
      let detached = this.lift_last();
      rt.frameLine(157);
      this.attach(detached, rt.V.str("tail"));
      rt.frameLine(158);
      this.set_end(this.tok(rt.V.str("cmt"), rt.V.int(19), rt.V.int(1), rt.V.int(0), rt.V.int(19)));
      rt.frameLine(159);
      this.open_anon(rt.V.str("()"), this.tok(rt.V.str("("), rt.V.int(20), rt.V.int(1), rt.V.int(0), rt.V.int(20)));
      rt.frameLine(160);
      this.leaf(rt.V.str("identifier"), this.tok(rt.V.str("ident"), rt.V.int(21), rt.V.int(1), rt.V.int(0), rt.V.int(21)), rt.V.str(""));
      rt.frameLine(161);
      this.close(rt.V.str(""));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  rebuild_with_lift(): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "rebuild_with_lift");
    try {
      rt.frameLine(165);
      this.stack = rt.V.array(rt.GArray.of([]));
      rt.frameLine(166);
      this.pending = rt.V.array(rt.GArray.of([]));
      rt.frameLine(167);
      this.src = rt.V.str("lift me");
      rt.frameLine(168);
      this.open(rt.V.str("source"));
      rt.frameLine(169);
      this.leaf(rt.V.str("identifier"), this.tok(rt.V.str("ident"), rt.V.int(0), rt.V.int(4), rt.V.int(0), rt.V.int(0)), rt.V.str("left"));
      rt.frameLine(170);
      let inner = this.splice_from(rt.V.int(0));
      rt.frameLine(171);
      this.open(rt.V.str("wrapped"));
      rt.frameLine(172);
      this.attach(inner, rt.V.str("inner"));
      rt.frameLine(173);
      this.close(rt.V.str("body"));
      rt.frameLine(174);
      this.set_last_field(rt.V.str("tail"));
      rt.frameLine(175);
      return this.root_finish(rt.V.int(7));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      case "tok": return rt.wrapValue(this.tok(args[0] as rt.Variant, args[1] as rt.Variant, args[2] as rt.Variant, args[3] as rt.Variant, args[4] as rt.Variant));
      case "pos_of": return rt.wrapValue(this.pos_of(args[0] as rt.Variant));
      case "mk": return rt.wrapValue(this.mk(args[0] as rt.Variant, args[1] as rt.Variant, args[2] as rt.Variant, args[3] as rt.Variant, args[4] as rt.Variant, args[5] as rt.Variant));
      case "named_of": return rt.wrapValue(this.named_of(args[0] as rt.Variant));
      case "open": return rt.wrapValue(this.open(args[0] as rt.Variant));
      case "open_anon": return rt.wrapValue(this.open_anon(args[0] as rt.Variant, args[1] as rt.Variant));
      case "close": return rt.wrapValue(this.close(args[0] as rt.Variant));
      case "leaf": return rt.wrapValue(this.leaf(args[0] as rt.Variant, args[1] as rt.Variant, args[2] as rt.Variant));
      case "anon": return rt.wrapValue(this.anon(args[0] as rt.Variant, args[1] as rt.Variant));
      case "attach": return rt.wrapValue(this.attach(args[0] as rt.Variant, args[1] as rt.Variant));
      case "set_last_field": return rt.wrapValue(this.set_last_field(args[0] as rt.Variant));
      case "lift_last": return rt.wrapValue(this.lift_last());
      case "mark": return rt.wrapValue(this.mark());
      case "splice_from": return rt.wrapValue(this.splice_from(args[0] as rt.Variant));
      case "set_end": return rt.wrapValue(this.set_end(args[0] as rt.Variant));
      case "stash_comment": return rt.wrapValue(this.stash_comment(args[0] as rt.Variant));
      case "flush": return rt.wrapValue(this.flush());
      case "root_finish": return rt.wrapValue(this.root_finish(args[0] as rt.Variant));
      case "dump": return rt.wrapValue(this.dump(args[0] as rt.Variant, args[1] as rt.Variant));
      case "build": return rt.wrapValue(this.build());
      case "rebuild_with_lift": return rt.wrapValue(this.rebuild_with_lift());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerScriptProps(__gd_d_Main, ["src","stack","pending"], (o) => { const s = o as Main; return [s.src, s.stack, s.pending]; });
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", ["src","stack","pending"], {}, (o) => { const s = o as Main; return [s.src, s.stack, s.pending]; });
rt.registerMethodArities(__gd_d_Main, { "_initialize": [0, 0], "tok": [5, 5], "pos_of": [1, 1], "mk": [6, 6], "named_of": [1, 1], "open": [1, 1], "open_anon": [2, 2], "close": [1, 1], "leaf": [3, 3], "anon": [2, 2], "attach": [2, 2], "set_last_field": [1, 1], "lift_last": [0, 0], "mark": [0, 0], "splice_from": [1, 1], "set_end": [1, 1], "stash_comment": [1, 1], "flush": [0, 0], "root_finish": [1, 1], "dump": [2, 2], "build": [0, 0], "rebuild_with_lift": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
