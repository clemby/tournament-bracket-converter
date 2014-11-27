interface JQueryBracketInitData {
  teams: string[][];
  results: number[][][][];
}


interface JQueryBracketData {
  init: JQueryBracketInitData;
  skipConsolationRound?: boolean;
  skipSecondaryFinal?: boolean;
}


interface JQuery {
  bracket(data: JQueryBracketData): JQuery;
}
