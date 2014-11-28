declare module lib {

  export interface Dict<T> {
    [id: number]: T;
  }


  export interface MatchObject {
    id: number;
    name: string;
    teams: number[];

    winner?: number;
    winner_next?: number;
    loser_next?: number;
  }


  export interface TeamObject {
    id: number;
    name: string;

    short_name?: string;
    members?: string[];
  }


  export interface ApiData {
    teams: TeamObject[];
    matches: MatchObject[];
  }
}
