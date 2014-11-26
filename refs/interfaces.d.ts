declare module lib {

  export interface Dict<T> {
    [id: number]: T;
  }


  export interface Team {
    id: number;
    name: string;
  }


  export interface Match {
    id: number;
    name: string;

    winnerNext?: number;
    loserNext?: number;
    elemId?: string;
  }


  export interface ApiData {
    teams: Team[];
    matches: Match[];
  }


  export interface FormattedData {
    matches: {[id: number]: Match;};
  }

}
