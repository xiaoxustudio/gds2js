import { UnsupportedError } from "@gds2js/runtime/runtime/errors";

export type SceneNode = { name: string; cls: string; script: string | null; children: SceneNode[] };

function attrs(head: string): Record<string, string> {
  const out: Record<string, string> = {};
  const quoted = /(\w+)\s*=\s*"([^"]*)"/g;
  for (;;) {
    const m = quoted.exec(head);
    if (m === null) break;
    out[m[1] as string] = m[2] as string;
  }
  const bare = /(\w+)\s*=\s*([A-Za-z0-9_."-]+)(?=\s|$)/g;
  for (;;) {
    const m = bare.exec(head);
    if (m === null) break;
    if (out[m[1] as string] === undefined) out[m[1] as string] = m[2] as string;
  }
  return out;
}

/** `.tscn` 的节点表：根段不带 parent=，其余段的 parent 是相对根的路径（"." 就是根）。 */
export function parseScene(text: string): SceneNode {
  const scripts = new Map<string, string>();
  const byPath = new Map<string, SceneNode>();
  let root: SceneNode | null = null;
  let current: SceneNode | null = null;
  let header = false;

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (line === "" || line.startsWith(";")) continue;
    const section = /^\[([^\]]*)\]$/.exec(line);
    if (section !== null) {
      const body = section[1] as string;
      const tag = /^(\w+)/.exec(body)?.[1] ?? "";
      if (tag === "gd_scene") {
        header = true;
        current = null;
        continue;
      }
      const a = attrs(body);
      if (tag === "ext_resource") {
        if (a["type"] !== "Script") throw new UnsupportedError("scene-ext-resource", `场景里的 ext_resource 只量过 type="Script"（收到 ${String(a["type"])}）`);
        if (a["path"] === undefined) throw new UnsupportedError("scene-ext-resource", "ext_resource 少了 path");
        scripts.set(a["id"] ?? "", a["path"]);
        continue;
      }
      if (tag === "sub_resource") throw new UnsupportedError("scene-sub-resource", "场景里的 sub_resource 段没建模");
      if (tag !== "node") throw new UnsupportedError("scene-section", `场景文件里的 [${tag}] 段没建模`);
      const name = a["name"];
      const cls = a["type"];
      if (name === undefined) throw new UnsupportedError("scene-node", "场景节点段少了 name");
      if (cls === undefined) throw new UnsupportedError("scene-node", "场景节点只量过带 type= 的那一形（instance= 没建模）");
      if (a["instance"] !== undefined || a["groups"] !== undefined) throw new UnsupportedError("scene-node", "场景节点的 instance= / groups= 没建模");
      const node: SceneNode = { name, cls, script: null, children: [] };
      const parent = a["parent"];
      if (parent === undefined) {
        if (root !== null) throw new UnsupportedError("scene-node", "场景里出现第二个不带 parent= 的节点");
        root = node;
        byPath.set(".", node);
      } else {
        if (root === null) throw new UnsupportedError("scene-node", "场景的第一个节点就带了 parent=");
        const up = byPath.get(parent);
        if (up === undefined) throw new UnsupportedError("scene-parent", `场景节点的 parent="${parent}" 指不到已读出的节点`);
        up.children.push(node);
        byPath.set(parent === "." ? name : `${parent}/${name}`, node);
      }
      current = node;
      continue;
    }
    const prop = /^(\w+)\s*=\s*(.*)$/.exec(line);
    if (prop === null) throw new UnsupportedError("scene-line", `场景文件里这一行读不出来：${line}`);
    if (current === null) throw new UnsupportedError("scene-line", "场景属性出现在任何 [node] 段之前");
    const key = prop[1] as string;
    if (key !== "script") throw new UnsupportedError("scene-property", `场景节点的 ${key}= 属性还没建模`);
    const ref = /ExtResource\(\s*"([^"]*)"\s*\)/.exec(prop[2] as string);
    if (ref === null) throw new UnsupportedError("scene-property", '场景节点的 script= 只量过 ExtResource("id") 那一形');
    const path = scripts.get(ref[1] as string);
    if (path === undefined) throw new UnsupportedError("scene-property", "script 指的 ExtResource id 不在表里");
    current.script = path;
  }

  if (!header) throw new UnsupportedError("scene-header", "场景文件缺 [gd_scene] 头");
  if (root === null) throw new UnsupportedError("scene-root", "场景里没有根节点");
  return root;
}
