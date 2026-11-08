import { describe, expect, it } from "vitest";
import { method as methodRaw, attribute as attributeRaw } from "@gds2js/runtime/runtime/methods";
import { nativeClass } from "@gds2js/runtime/runtime/class/identity/native-class";
import { Tag, V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GDict } from "@gds2js/runtime/runtime/values";

const method = (recv: any, name: string, args: any[]): any => methodRaw(recv, name, args) as Variant as any;
const attribute = (recv: any, name: string): any => attributeRaw(recv, name) as Variant as any;

function dict(entries: Record<string, Variant>): Variant {
  const d = new GDict();
  for (const [k, v] of Object.entries(entries)) d.set(V.str(k), v);
  return V.dict(d);
}

const TIME = nativeClass("Time");

describe("runtime/time face", () => {
  it("deterministic conversions", () => {
    expect(method(TIME, "get_unix_time_from_datetime_dict", [dict({ year: V.int(2024), month: V.int(2), day: V.int(29), hour: V.int(12), minute: V.int(34), second: V.int(56) })]).v).toBe(1709210096);
    expect(method(TIME, "get_unix_time_from_datetime_string", [V.str("2024-02-29T12:34:56")]).v).toBe(1709210096);
    expect(method(TIME, "get_datetime_string_from_unix_time", [V.int(1700000000), V.bool(false)]).v).toBe("2023-11-14T22:13:20");
    expect(method(TIME, "get_datetime_string_from_unix_time", [V.int(1700000000), V.bool(true)]).v).toBe("2023-11-14 22:13:20");
    expect(method(TIME, "get_date_string_from_unix_time", [V.int(1700000000)]).v).toBe("2023-11-14");
    expect(method(TIME, "get_time_string_from_unix_time", [V.int(1700000000)]).v).toBe("22:13:20");
    expect(method(TIME, "get_offset_string_from_offset_minutes", [V.int(330)]).v).toBe("+05:30");
    expect(method(TIME, "get_offset_string_from_offset_minutes", [V.int(-300)]).v).toBe("-05:00");
  });

  it("dict shapes and system reads", () => {
    const dt = method(TIME, "get_datetime_dict_from_unix_time", [V.int(0)]);
    expect(dt.t).toBe(Tag.DICT);
    expect((dt.v as GDict).get(V.str("weekday"))!.v).toBe(4);
    const parsed = method(TIME, "get_datetime_dict_from_datetime_string", [V.str("2024-02-29T12:34:56"), V.bool(true)]);
    expect((parsed.v as GDict).get(V.str("weekday"))!.v).toBe(4);
    const noWeekday = method(TIME, "get_datetime_dict_from_datetime_string", [V.str("2024-02-29 12:34:56"), V.bool(false)]);
    expect((noWeekday.v as GDict).get(V.str("weekday")).t).toBe(Tag.NIL);
    expect(method(TIME, "get_datetime_dict_from_system", [V.bool(true)]).t).toBe(Tag.DICT);
    expect(method(TIME, "get_date_dict_from_system", [V.bool(false)]).t).toBe(Tag.DICT);
    expect(method(TIME, "get_time_dict_from_system", [V.bool(true)]).t).toBe(Tag.DICT);
    expect(method(TIME, "get_datetime_string_from_system", [V.bool(true), V.bool(false)]).t).toBe(Tag.STRING);
    expect(method(TIME, "get_date_string_from_system", [V.bool(true)]).t).toBe(Tag.STRING);
    expect(method(TIME, "get_time_string_from_system", [V.bool(true)]).t).toBe(Tag.STRING);
    expect(method(TIME, "get_datetime_string_from_datetime_dict", [dict({ year: V.int(2024), month: V.int(2), day: V.int(29), hour: V.int(12), minute: V.int(34), second: V.int(56) }), V.bool(false)]).v).toBe("2024-02-29T12:34:56");
    expect(method(TIME, "get_unix_time_from_system", []).t).toBe(Tag.FLOAT);
    expect(method(TIME, "get_ticks_msec", []).t).toBe(Tag.INT);
    expect(method(TIME, "get_ticks_usec", []).t).toBe(Tag.INT);
    const tz = method(TIME, "get_time_zone_from_system", []);
    expect(tz.t).toBe(Tag.DICT);
    expect((tz.v as GDict).get(V.str("bias"))!.t).toBe(Tag.INT);
    expect((tz.v as GDict).get(V.str("name"))!.t).toBe(Tag.STRING);
  });

  it("enum values", () => {
    expect(attribute(TIME, "MONTH_JANUARY").v).toBe(1);
    expect(attribute(TIME, "MONTH_FEBRUARY").v).toBe(2);
    expect(attribute(TIME, "MONTH_MARCH").v).toBe(3);
    expect(attribute(TIME, "MONTH_APRIL").v).toBe(4);
    expect(attribute(TIME, "MONTH_MAY").v).toBe(5);
    expect(attribute(TIME, "MONTH_JUNE").v).toBe(6);
    expect(attribute(TIME, "MONTH_JULY").v).toBe(7);
    expect(attribute(TIME, "MONTH_AUGUST").v).toBe(8);
    expect(attribute(TIME, "MONTH_SEPTEMBER").v).toBe(9);
    expect(attribute(TIME, "MONTH_OCTOBER").v).toBe(10);
    expect(attribute(TIME, "MONTH_NOVEMBER").v).toBe(11);
    expect(attribute(TIME, "MONTH_DECEMBER").v).toBe(12);
    expect(attribute(TIME, "WEEKDAY_SUNDAY").v).toBe(0);
    expect(attribute(TIME, "WEEKDAY_MONDAY").v).toBe(1);
    expect(attribute(TIME, "WEEKDAY_TUESDAY").v).toBe(2);
    expect(attribute(TIME, "WEEKDAY_WEDNESDAY").v).toBe(3);
    expect(attribute(TIME, "WEEKDAY_THURSDAY").v).toBe(4);
    expect(attribute(TIME, "WEEKDAY_FRIDAY").v).toBe(5);
    expect(attribute(TIME, "WEEKDAY_SATURDAY").v).toBe(6);
  });
});
