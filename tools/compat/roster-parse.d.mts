export interface RosterCell {
  tier: string;
  label: string;
  code: string;
}

export function parseRoster(): RosterCell[];
export function rosterCodes(): string[];
