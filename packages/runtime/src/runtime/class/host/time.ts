import { Tag, V, type Variant } from "../../tags";
import { UnsupportedError } from "../../errors";
import { GDict } from "../../values";

const WEEK = 7;

function floorDiv(a: number, b: number): number {
  return Math.floor(a / b);
}

function daysFromCivil(y: number, m: number, d: number): number {
  const yy = m <= 2 ? y - 1 : y;
  const era = floorDiv(yy, 400);
  const yoe = yy - era * 400;
  const doy = floorDiv(153 * (m + (m > 2 ? -3 : 9)) + 2, 5) + d - 1;
  const doe = yoe * 365 + floorDiv(yoe, 4) - floorDiv(yoe, 100) + doy;
  return era * 146097 + doe - 719468;
}

function civilFromDays(z: number): { year: number; month: number; day: number } {
  const zz = z + 719468;
  const era = floorDiv(zz, 146097);
  const doe = zz - era * 146097;
  const yoe = floorDiv(doe - floorDiv(doe, 1460) + floorDiv(doe, 36524) - floorDiv(doe, 146096), 365);
  const doy = doe - (365 * yoe + floorDiv(yoe, 4) - floorDiv(yoe, 100));
  const mp = floorDiv(5 * doy + 2, 153);
  const d = doy - floorDiv(153 * mp + 2, 5) + 1;
  const m = mp < 10 ? mp + 3 : mp - 9;
  return { year: m <= 2 ? yoe + era * 400 + 1 : yoe + era * 400, month: m, day: d };
}

function weekdayOf(dayNum: number): number {
  return (((dayNum + 4) % WEEK) + WEEK) % WEEK;
}

function unixParts(t: number): { dayNum: number; hour: number; minute: number; second: number } {
  const sec = Math.floor(t);
  const dayNum = floorDiv(sec, 86400);
  const rem = sec - dayNum * 86400;
  return { dayNum, hour: floorDiv(rem, 3600), minute: floorDiv(rem % 3600, 60), second: rem % 60 };
}

function dictOf(entries: Array<[string, Variant]>): Variant {
  const d = new GDict();
  for (const [k, v] of entries) d.set(V.str(k), v);
  return V.dict(d);
}

function pad(n: number, width: number): string {
  return String(Math.abs(n)).padStart(width, "0");
}

function datetimeString(y: number, mo: number, d: number, h: number, mi: number, s: number, useSpace: boolean): string {
  return `${pad(y, 4)}-${pad(mo, 2)}-${pad(d, 2)}${useSpace ? " " : "T"}${pad(h, 2)}:${pad(mi, 2)}:${pad(s, 2)}`;
}

function parseDatetime(text: string): { y: number; mo: number; d: number; h: number; mi: number; s: number } {
  const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})$/.exec(text);
  if (m === null) throw new UnsupportedError("time-parse", `Time 的日期串 "${text}" 这一形没量过（只量过 YYYY-MM-DDTHH:MM:SS 与空格分隔）`);
  return { y: Number(m[1]), mo: Number(m[2]), d: Number(m[3]), h: Number(m[4]), mi: Number(m[5]), s: Number(m[6]) };
}

function numField(args: Variant[], at: number, who: string): number {
  const v = args[at];
  if (v === undefined || (v.t !== Tag.INT && v.t !== Tag.FLOAT)) throw new UnsupportedError("time-arg", `Time.${who}() 的第 ${String(at + 1)} 参只量过数`);
  return Math.trunc(Number(v.v as number | bigint));
}

function dictField(d: GDict, key: string, fallback: number): number {
  const k = V.str(key);
  if (!d.has(k)) return fallback;
  const v = d.get(k);
  return v.t !== Tag.INT && v.t !== Tag.FLOAT ? fallback : Math.trunc(Number(v.v as number | bigint));
}

function boolArg(args: Variant[], at: number, fallback: boolean): boolean {
  const v = args[at];
  return v === undefined ? fallback : v.t === Tag.BOOL ? v.v === true : fallback;
}

function dictArg(args: Variant[], at: number, who: string): GDict {
  const v = args[at];
  if (v === undefined || v.t !== Tag.DICT) throw new UnsupportedError("time-arg", `Time.${who}() 的日期字典没给`);
  return v.v as GDict;
}

function systemFields(utc: boolean): { y: number; mo: number; d: number; h: number; mi: number; s: number } {
  const now = new Date();
  return utc
    ? { y: now.getUTCFullYear(), mo: now.getUTCMonth() + 1, d: now.getUTCDate(), h: now.getUTCHours(), mi: now.getUTCMinutes(), s: now.getUTCSeconds() }
    : { y: now.getFullYear(), mo: now.getMonth() + 1, d: now.getDate(), h: now.getHours(), mi: now.getMinutes(), s: now.getSeconds() };
}

function datetimeDict(t: number, weekday: boolean): Variant {
  const { dayNum, hour, minute, second } = unixParts(t);
  const c = civilFromDays(dayNum);
  const entries: Array<[string, Variant]> = [
    ["year", V.int(c.year)],
    ["month", V.int(c.month)],
    ["day", V.int(c.day)],
  ];
  if (weekday) entries.push(["weekday", V.int(weekdayOf(dayNum))]);
  entries.push(["hour", V.int(hour)], ["minute", V.int(minute)], ["second", V.int(second)]);
  return dictOf(entries);
}

export function timeStatic(name: string, args: Variant[]): Variant {
  switch (name) {
    case "get_datetime_dict_from_unix_time":
      return datetimeDict(numField(args, 0, name), true);
    case "get_datetime_dict_from_system": {
      const f = systemFields(boolArg(args, 0, false));
      const dayNum = daysFromCivil(f.y, f.mo, f.d);
      return dictOf([
        ["year", V.int(f.y)],
        ["month", V.int(f.mo)],
        ["day", V.int(f.d)],
        ["weekday", V.int(weekdayOf(dayNum))],
        ["hour", V.int(f.h)],
        ["minute", V.int(f.mi)],
        ["second", V.int(f.s)],
      ]);
    }
    case "get_date_dict_from_unix_time": {
      const t = numField(args, 0, name);
      const { dayNum } = unixParts(t);
      const c = civilFromDays(dayNum);
      return dictOf([["year", V.int(c.year)], ["month", V.int(c.month)], ["day", V.int(c.day)], ["weekday", V.int(weekdayOf(dayNum))]]);
    }
    case "get_date_dict_from_system": {
      const f = systemFields(boolArg(args, 0, false));
      const dayNum = daysFromCivil(f.y, f.mo, f.d);
      return dictOf([["year", V.int(f.y)], ["month", V.int(f.mo)], ["day", V.int(f.d)], ["weekday", V.int(weekdayOf(dayNum))]]);
    }
    case "get_time_dict_from_unix_time": {
      const { hour, minute, second } = unixParts(numField(args, 0, name));
      return dictOf([["hour", V.int(hour)], ["minute", V.int(minute)], ["second", V.int(second)]]);
    }
    case "get_time_dict_from_system": {
      const f = systemFields(boolArg(args, 0, false));
      return dictOf([["hour", V.int(f.h)], ["minute", V.int(f.mi)], ["second", V.int(f.s)]]);
    }
    case "get_datetime_string_from_unix_time": {
      const { dayNum, hour, minute, second } = unixParts(numField(args, 0, name));
      const c = civilFromDays(dayNum);
      return V.str(datetimeString(c.year, c.month, c.day, hour, minute, second, boolArg(args, 1, false)));
    }
    case "get_datetime_dict_from_datetime_string": {
      const text = args[0];
      if (text === undefined || text.t !== Tag.STRING) throw new UnsupportedError("time-arg", "Time.get_datetime_dict_from_datetime_string() 只量过 String");
      const p = parseDatetime(String(text.v));
      const dayNum = daysFromCivil(p.y, p.mo, p.d);
      const entries: Array<[string, Variant]> = [["year", V.int(p.y)], ["month", V.int(p.mo)], ["day", V.int(p.d)]];
      if (boolArg(args, 1, false)) entries.push(["weekday", V.int(weekdayOf(dayNum))]);
      entries.push(["hour", V.int(p.h)], ["minute", V.int(p.mi)], ["second", V.int(p.s)]);
      return dictOf(entries);
    }
    case "get_datetime_string_from_datetime_dict": {
      const d = dictArg(args, 0, name);
      return V.str(datetimeString(dictField(d, "year", 0), dictField(d, "month", 0), dictField(d, "day", 0), dictField(d, "hour", 0), dictField(d, "minute", 0), dictField(d, "second", 0), boolArg(args, 1, false)));
    }
    case "get_datetime_string_from_system":
    case "get_date_string_from_system":
    case "get_time_string_from_system": {
      const f = systemFields(boolArg(args, 0, false));
      if (name === "get_date_string_from_system") return V.str(`${pad(f.y, 4)}-${pad(f.mo, 2)}-${pad(f.d, 2)}`);
      if (name === "get_time_string_from_system") return V.str(`${pad(f.h, 2)}:${pad(f.mi, 2)}:${pad(f.s, 2)}`);
      return V.str(datetimeString(f.y, f.mo, f.d, f.h, f.mi, f.s, boolArg(args, 1, false)));
    }
    case "get_date_string_from_unix_time": {
      const { dayNum } = unixParts(numField(args, 0, name));
      const c = civilFromDays(dayNum);
      return V.str(`${pad(c.year, 4)}-${pad(c.month, 2)}-${pad(c.day, 2)}`);
    }
    case "get_time_string_from_unix_time": {
      const { hour, minute, second } = unixParts(numField(args, 0, name));
      return V.str(`${pad(hour, 2)}:${pad(minute, 2)}:${pad(second, 2)}`);
    }
    case "get_offset_string_from_offset_minutes": {
      const m = numField(args, 0, name);
      const sign = m < 0 ? "-" : "+";
      const abs = Math.abs(m);
      return V.str(`${sign}${pad(floorDiv(abs, 60), 2)}:${pad(abs % 60, 2)}`);
    }
    case "get_unix_time_from_datetime_dict": {
      const d = dictArg(args, 0, name);
      const days = daysFromCivil(dictField(d, "year", 0), dictField(d, "month", 1), dictField(d, "day", 1));
      return V.int(days * 86400 + dictField(d, "hour", 0) * 3600 + dictField(d, "minute", 0) * 60 + dictField(d, "second", 0));
    }
    case "get_unix_time_from_datetime_string": {
      const text = args[0];
      if (text === undefined || text.t !== Tag.STRING) throw new UnsupportedError("time-arg", "Time.get_unix_time_from_datetime_string() 只量过 String");
      const p = parseDatetime(String(text.v));
      return V.int(daysFromCivil(p.y, p.mo, p.d) * 86400 + p.h * 3600 + p.mi * 60 + p.s);
    }
    case "get_unix_time_from_system":
      return V.float(Date.now() / 1000);
    case "get_ticks_msec":
      return V.int(Math.floor(performance.now()));
    case "get_ticks_usec":
      return V.int(Math.floor(performance.now() * 1000));
    case "get_time_zone_from_system": {
      const bias = -new Date().getTimezoneOffset();
      let zone = "UTC";
      try {
        zone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC";
      } catch {
        zone = "UTC";
      }
      return dictOf([["bias", V.int(bias)], ["name", V.str(zone)]]);
    }
    default:
      throw new UnsupportedError("time-member", `Time.${name}() 这一支没量过`);
  }
}
