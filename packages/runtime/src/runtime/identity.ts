/** 对象身份的发号器：`get_instance_id()`、字典键与数组成员判定都吃它。
 * Godot 那个数是指针派生的（同一次运行内稳定、跨运行跨版本都不定），所以它**从不进语料**：
 * 复现的是「同一个对象同键、不同对象不同键」这套关系，不是数字本身。 */
export interface GdIdentified {
  readonly gdObjectId: number;
}

let seq = 0;

export function nextObjectId(): number {
  seq += 1;
  return seq;
}
