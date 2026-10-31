import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { UnsupportedError } from "@gds2js/runtime/runtime/errors";
import { parseScene, type SceneNode } from "../../../packages/compiler/src/parse/scene";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];

const SAMPLES = [
  '[gd_scene format=3]\n\n[ext_resource type="Script" path="res://main.gd" id="1_a"]\n\n[node name="Main" type="Node2D"]\nscript = ExtResource("1_a")\n\n[node name="Body" type="Sprite2D" parent="."]\n\n[node name="Arm" type="Node2D" parent="Body"]\n',
  '[node name="A" type="Node"]\n',
  '[gd_scene]\n[node name="A" type="Node"]\n[node name="B" type="Node"]\n',
  '[gd_scene]\n[node name="A" type="Node" parent="."]\n',
  '[gd_scene]\n[ext_resource type="Texture2D" path="x" id="1"]\n',
  '[gd_scene]\n[sub_resource type="RectangleShape2D" id="1"]\n',
  "[gd_scene]\n[foo]\n",
  '[gd_scene]\n[node name="A"]\n',
  '[gd_scene]\n[node name="A" type="Node" instance=ExtResource("1")]\n',
  '[gd_scene]\n[node name="A" type="Node"]\nposition = Vector2(0, 0)\n',
  '[gd_scene]\n[node name="A" type="Node"]\nscript = ExtResource("9")\n',
  '[gd_scene]\nscript = ExtResource("1")\n',
  '[gd_scene]\n[node name="A" type="Node"]\n!!!\n',
  '[gd_scene]\n[node name="A" type="Node"]\n[node name="B" type="Node" parent="Ghost"]\n',
  "[gd_scene]\n",
];

function flat(node: SceneNode, prefix: string, out: string[]): void {
  out.push(`${prefix}:${node.cls}:${String(node.script)}`);
  for (const ch of node.children) flat(ch, `${prefix}/${ch.name}`, out);
}

function expected(i: number): string {
  try {
    const out: string[] = [];
    flat(parseScene(SAMPLES[i]!), ".", out);
    return `sc|${String(i)}|ok|${out.join(";").replace(/res:\/\//g, "<case>/")}`;
  } catch (e) {
    if (!(e instanceof UnsupportedError)) throw e;
    return `sc|${String(i)}|err|${e.code}`;
  }
}

describe("bootstrap · .tscn 节点表与 TypeScript parseScene 逐格对账", () => {
  it("① 读数在盘面", (ctx) => {
    if (lines.length === 0) ctx.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(lines.some((l) => l.startsWith("sc|"))).toBe(true);
  });

  for (let i = 0; i < SAMPLES.length; i++) {
    it(`② scene ${String(i)}`, () => {
      expect(lines.find((l) => l.startsWith(`sc|${String(i)}|`))).toBe(expected(i));
    });
  }
});
