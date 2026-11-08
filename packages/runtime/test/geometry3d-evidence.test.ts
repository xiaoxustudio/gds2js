import { describe, expect, it } from "vitest";
import { method as methodRaw } from "@gds2js/runtime/runtime/methods";
import { nativeClass } from "@gds2js/runtime/runtime/class/identity/native-class";
import { vector3 } from "@gds2js/runtime/runtime/class/vector/vector3";
import { plane } from "@gds2js/runtime/runtime/class/orient/plane";
import { GBytes } from "@gds2js/runtime/runtime/class/bytes/packed";
import { Tag, V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GArray } from "@gds2js/runtime/runtime/values";

const method = (recv: any, name: string, args: any[]): any => methodRaw(recv, name, args) as Variant as any;
const G = nativeClass("Geometry3D");
const v3 = (x: number, y: number, z: number): Variant => vector3(x, y, z);
const planes = (items: Variant[]): Variant => V.array(GArray.of(items));
const pack = (items: Variant[]): Variant => V.object(GBytes.of(items.map((v) => v.v as never), "vector3"));

describe("runtime/geometry3d face", () => {
  it("box, cylinder and capsule planes", () => {
    const box = method(G, "build_box_planes", [v3(1, 2, 3)]);
    expect((box.v as GArray).raw().length).toBe(6);
    const cyl = method(G, "build_cylinder_planes", [V.float(1), V.float(2), V.int(8), V.int(1)]);
    expect((cyl.v as GArray).raw().length).toBe(10);
    const cap = method(G, "build_capsule_planes", [V.float(1), V.float(2), V.int(8), V.int(2), V.int(1)]);
    expect((cap.v as GArray).raw().length).toBe(40);
    const cap1 = method(G, "build_capsule_planes", [V.float(1), V.float(2), V.int(4), V.int(1), V.int(1)]);
    expect((cap1.v as GArray).raw().length).toBe(12);
  });

  it("clipping and convex hull points", () => {
    const tri = pack([v3(0, 0, 0), v3(2, 0, 0), v3(0, 2, 0)]);
    const clipped = method(G, "clip_polygon", [tri, plane(0, 1, 0, 0.5)]);
    expect((clipped.v as GBytes).raw().length).toBe(4);
    const box = method(G, "build_box_planes", [v3(1, 2, 3)]);
    const points = method(G, "compute_convex_mesh_points", [box]);
    expect((points.v as GBytes).raw().length).toBe(8);
    const empty = method(G, "compute_convex_mesh_points", [planes([plane(1, 0, 0, 0), plane(1, 0, 0, 1)])]);
    expect((empty.v as GBytes).raw().length).toBe(0);
  });

  it("segment, ray and closest helpers", () => {
    expect(method(G, "get_closest_point_to_segment", [v3(5, 1, 0), v3(-1, 0, 0), v3(1, 0, 0)]).t).toBe(Tag.OBJECT);
    expect(method(G, "get_closest_point_to_segment_uncapped", [v3(5, 1, 0), v3(-1, 0, 0), v3(1, 0, 0)]).t).toBe(Tag.OBJECT);
    expect((method(G, "get_closest_points_between_segments", [v3(0, 0, 0), v3(1, 0, 0), v3(0, 1, 0), v3(1, 1, 0)]).v as GBytes).raw().length).toBe(2);
    const bary = method(G, "get_triangle_barycentric_coords", [v3(0.2, 0.3, 0), v3(0, 0, 0), v3(1, 0, 0), v3(0, 1, 0)]);
    expect(bary.v.x).toBeCloseTo(0.5, 5);
    expect(method(G, "ray_intersects_triangle", [v3(2, 2, -1), v3(0, 0, 1), v3(0, 0, 0), v3(1, 0, 0), v3(0, 1, 0)]).t).toBe(Tag.NIL);
    expect(method(G, "segment_intersects_triangle", [v3(0.2, 0.2, -1), v3(0.2, 0.2, 1), v3(0, 0, 0), v3(1, 0, 0), v3(0, 1, 0)]).t).toBe(Tag.OBJECT);
  });

  it("sphere, cylinder and convex roots", () => {
    const sphere = method(G, "segment_intersects_sphere", [v3(-2, 0.5, 0), v3(2, 0.5, 0), v3(0, 0, 0), V.float(1)]);
    expect((sphere.v as GBytes).raw().length).toBe(2);
    const cyl = method(G, "segment_intersects_cylinder", [v3(-2, 0, 0), v3(2, 0, 0), V.float(2), V.float(1)]);
    expect((cyl.v as GBytes).raw().length).toBe(2);
    const box = method(G, "build_box_planes", [v3(2, 2, 2)]);
    const convex = method(G, "segment_intersects_convex", [v3(0, 0, -5), v3(0, 0, 5), box]);
    expect((convex.v as GBytes).raw().length).toBe(2);
    const inside = method(G, "segment_intersects_convex", [v3(0, 0, 0), v3(0, 0, 5), box]);
    expect((inside.v as GBytes).raw().length).toBe(0);
  });

  it("delaunay tetrahedralization", () => {
    const pts = pack([v3(0, 0, 0), v3(1, 0, 0), v3(0, 1, 0), v3(0, 0, 1), v3(0.2, 0.2, 0.2)]);
    const indices = method(G, "tetrahedralize_delaunay", [pts]);
    expect((indices.v as GBytes).raw().length).toBe(16);
    expect((method(G, "tetrahedralize_delaunay", [pack([v3(0, 0, 0), v3(1, 0, 0)])]).v as GBytes).raw().length).toBe(0);
  });
});
