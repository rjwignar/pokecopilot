export interface Ability {
  name: string;
  is_hidden: boolean;
}

export interface Stat {
  name: string;
  value: number;
}

export interface Type {
  name: string;
}

export interface Pokemon {
  _id: number;
  name: string;
  abilities: Ability[];
  height: number;
  moves: string[];
  official_art: string;
  showdown_gif: string;
  stats: Stat[];
  base_stat_total: number;
  weight: number;
  contentVector: number[];
  types: Type[];
}
