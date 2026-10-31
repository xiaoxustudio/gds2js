import { registerVarToStrValueHook } from "./values";
import { Signal } from "./signal";
import { GVector2 } from "./class/vector/vector2";
import { GVector2i } from "./class/vector/vector2i";
import { GVector3 } from "./class/vector/vector3";
import { GVector3i } from "./class/vector/vector3i";
import { GVector4 } from "./class/vector/vector4";
import { GVector4i } from "./class/vector/vector4i";
import { GColor } from "./color";
import { GAABB, GBasis, GPlane, GQuaternion, GRect2, GRect2i, GTransform2D, GTransform3D } from "./composite-classes";
import { rtosFix } from "./grisu2";

registerVarToStrValueHook((o) => {
  if (o instanceof GVector2) return `Vector2(${rtosFix(o.x, true)}, ${rtosFix(o.y, true)})`;
  if (o instanceof GVector2i) return `Vector2i(${o.x}, ${o.y})`;
  if (o instanceof GVector3) return `Vector3(${rtosFix(o.x, true)}, ${rtosFix(o.y, true)}, ${rtosFix(o.z, true)})`;
  if (o instanceof GVector3i) return `Vector3i(${o.x}, ${o.y}, ${o.z})`;
  if (o instanceof GVector4) return `Vector4(${rtosFix(o.x, true)}, ${rtosFix(o.y, true)}, ${rtosFix(o.z, true)}, ${rtosFix(o.w, true)})`;
  if (o instanceof GVector4i) return `Vector4i(${o.x}, ${o.y}, ${o.z}, ${o.w})`;
  if (o instanceof GColor) return `Color(${rtosFix(o.r, true)}, ${rtosFix(o.g, true)}, ${rtosFix(o.b, true)}, ${rtosFix(o.a, true)})`;
  if (o instanceof GRect2) return `Rect2(${rtosFix(o.x, true)}, ${rtosFix(o.y, true)}, ${rtosFix(o.w, true)}, ${rtosFix(o.h, true)})`;
  if (o instanceof GRect2i) return `Rect2i(${o.x}, ${o.y}, ${o.w}, ${o.h})`;
  if (o instanceof GTransform2D) return `Transform2D(${rtosFix(o.xx, true)}, ${rtosFix(o.xy, true)}, ${rtosFix(o.yx, true)}, ${rtosFix(o.yy, true)}, ${rtosFix(o.ox, true)}, ${rtosFix(o.oy, true)})`;
  if (o instanceof GTransform3D) {
    return `Transform3D(${rtosFix(o.x0, true)}, ${rtosFix(o.y0, true)}, ${rtosFix(o.z0, true)}, ${rtosFix(o.x1, true)}, ${rtosFix(o.y1, true)}, ${rtosFix(o.z1, true)}, ${rtosFix(o.x2, true)}, ${rtosFix(o.y2, true)}, ${rtosFix(o.z2, true)}, ${rtosFix(o.ox, true)}, ${rtosFix(o.oy, true)}, ${rtosFix(o.oz, true)})`;
  }
  if (o instanceof GQuaternion) return `Quaternion(${rtosFix(o.x, true)}, ${rtosFix(o.y, true)}, ${rtosFix(o.z, true)}, ${rtosFix(o.w, true)})`;
  if (o instanceof GPlane) return `Plane(${rtosFix(o.nx, true)}, ${rtosFix(o.ny, true)}, ${rtosFix(o.nz, true)}, ${rtosFix(o.d, true)})`;
  if (o instanceof GBasis) return `Basis(${rtosFix(o.x0, true)}, ${rtosFix(o.y0, true)}, ${rtosFix(o.z0, true)}, ${rtosFix(o.x1, true)}, ${rtosFix(o.y1, true)}, ${rtosFix(o.z1, true)}, ${rtosFix(o.x2, true)}, ${rtosFix(o.y2, true)}, ${rtosFix(o.z2, true)})`;
  if (o instanceof GAABB) return `AABB(${rtosFix(o.x, true)}, ${rtosFix(o.y, true)}, ${rtosFix(o.z, true)}, ${rtosFix(o.sx, true)}, ${rtosFix(o.sy, true)}, ${rtosFix(o.sz, true)})`;
  if (o instanceof Signal) return "Signal()";
  return null;
});
