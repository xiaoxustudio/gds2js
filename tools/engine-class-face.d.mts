export type EngineClassFaceRow = {
  cls: string;
  typeofCode: number;
  label: string;
  member: string;
  isValid: boolean;
  args: number;
  isNull: boolean;
  boundArgs: number;
  classHas: boolean;
};

export function parseFace(text: string): EngineClassFaceRow[];
export function renderFace(text: string): string;
