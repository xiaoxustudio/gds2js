/** 4.6.3 实测的引擎类静态常量（`000-probe-fd-consts`：`FileAccess.READ/WRITE/READ_WRITE/WRITE_READ` = 1/2/3/7，typeof 那格回 2）。 */
export function engineClassConst(cls: string, name: string): number | null {
  if (cls !== "FileAccess") return null;
  if (name === "READ") return 1;
  if (name === "WRITE") return 2;
  if (name === "READ_WRITE") return 3;
  if (name === "WRITE_READ") return 7;
  return null;
}
