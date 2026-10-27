import { registerVarToStrValueHook } from "./values";
import { Signal } from "./signal";
import { GVector2 } from "./vector2";
import { GVector2i } from "./vector2i";
import { GVector3 } from "./vector3";
import { GVector3i } from "./vector3i";
import { GVector4 } from "./vector4";
import { GVector4i } from "./vector4i";
import { GColor } from "./color";
import { GAABB, GPlane, GQuaternion, GRect2, GRect2i } from "./composite-classes";
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
  if (o instanceof GQuaternion) return `Quaternion(${rtosFix(o.x, true)}, ${rtosFix(o.y, true)}, ${rtosFix(o.z, true)}, ${rtosFix(o.w, true)})`;
  if (o instanceof GPlane) return `Plane(${rtosFix(o.nx, true)}, ${rtosFix(o.ny, true)}, ${rtosFix(o.nz, true)}, ${rtosFix(o.d, true)})`;
  if (o instanceof GAABB) return `AABB(${rtosFix(o.x, true)}, ${rtosFix(o.y, true)}, ${rtosFix(o.z, true)}, ${rtosFix(o.sx, true)}, ${rtosFix(o.sy, true)}, ${rtosFix(o.sz, true)})`;
  if (o instanceof Signal) return "Signal()";
  return null;
});
