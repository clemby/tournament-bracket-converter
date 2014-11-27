interface JQueryBracketData {
  teams: string[][];
  results: number[][][][];
}


interface JQuery {
  bracket(data: {
    init: JQueryBracketData;
    skipConsolationRound?: boolean;
    skipSecondaryFinal?: boolean;
  }): JQuery;
}
