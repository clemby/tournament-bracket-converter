module lib {

  export function buildTreeFromHead(head: Match): Match[][] {
    var currentTier: Match[] = [head],
        tiers: Match[][] = [];

    function getMatchChildren(match: Match): Match[] {
      return match.winnerPrev();
    }

    while (currentTier.length) {
      tiers.push(currentTier);
      // Cast to any[] because we make use of $.map's array flattening, which
      // doesn't appear to be recognised.
      currentTier = <any[]> $.map(currentTier, getMatchChildren);
    }

    return tiers.reverse();
  }


  function getWinnerNext(match: Match): Match {
    return match.winnerNext();
  }

  function keymap(match: Match, matchId: number, winnerNext: Match): number {
    return winnerNext.id;
  }

  export function idSortCmp<T extends {id: number;}>(a: T, b: T): number {
    return a.id - b.id;
  }

  export function buildTreeFromBase(base: Match[]): Match[][] {
    var currentTier: Dict<Match> = lib.dictmap(base, identity, null, keymap),
        tiers: Match[][] = [],
        tierArray: Match[] = $.map(currentTier, identity);

    while (tierArray.length > 1) {
      tiers.push(tierArray);
      currentTier = lib.dictmap(currentTier, getWinnerNext, null, keymap);
      tierArray = $.map(currentTier, identity).sort(idSortCmp);
    }

    var tierNext: Match = tierArray[0];
    while (tierNext) {
      tiers.push([tierNext]);
      tierNext = tierNext.winnerNext();
    }

    return tiers;
  }


  export function identity<T>(t: T) {
    return t;
  }


  export function getFirstRound(): Match[] {
    return $.map(Match.items, (matchObj: MatchObject): Match => {
      var match = new Match(matchObj);
      if (match.winnerPrev().length || match.loserPrev().length) {
        return null;
      }
      return match;
    });
  }


  export function checkIfSecondaryFinal(finalMatch: Match): boolean {
    var hasSecondaryFinal: boolean = false,
        preFinals: Match[] = finalMatch.winnerPrev(),
        childCount: number = preFinals.length;

    switch (childCount) {
      case 2:
        break;

      case 1:
        hasSecondaryFinal = true;
        if (preFinals.length !== 2) {
          throw Error(
            "Expected 2 rounds to precede first final; got " + preFinals.length
          );
        }
        break;

      default:
        throw Error(
          childCount + " matches directly precede final; expected 1"
        );
    }

    return hasSecondaryFinal;
  }


  export function formatTournamentData(data: ApiData): JQueryBracketData {
    Team.loadItems(data.teams);
    Match.loadItems(data.matches);

    // wb: winning bracket; lb: losing bracket.
    var wbFirstRound: Match[] = getFirstRound();

    // If byes are detected, we use a placeholder team. Use a non-number string
    // for the ID since null and undefined are both admissible as numbers.
    var byesDetected: boolean = false,
        nullTeamId: number = <any> 'PLACEHOLDER';

    $.each(wbFirstRound, (i: number, m: lib.Match): void => {
      var obj: lib.MatchObject = m.get();
      if (obj.teams.length === 1) {
        obj.teams.push(nullTeamId);
      }
      byesDetected = true;
    });

    if (byesDetected) {
      lib.Team.items[nullTeamId] = {
        id: nullTeamId,
        name: '--',
        short_name: '--',
        members: []
      };
    }

    var wbTree: Match[][] = buildTreeFromBase(wbFirstRound);
    var lbFirstRound: Match[] = $.map(wbFirstRound, (match: Match): Match =>
          match.loserNext()
        );
    var lbTree: Match[][];
    var isDoubleElimination: boolean = !!lbFirstRound.length;
    var finalTier: Match[] = wbTree.pop();

    if (finalTier.length !== 1) {
      throw Error("Too many matches in final tier of winning bracket");
    }

    var finalMatch: Match = finalTier[0],
        hasSecondaryFinal: boolean = false,
        hasConsolationRound: boolean = false;

    if (isDoubleElimination) {
      lbTree = buildTreeFromBase(lbFirstRound);

      // Ensure the final can be reached from the loser bracket too (otherwise
      // it won't work with jquery.bracket). Remove it so it doesn't appear in
      // the results twice.
      var loserBracketFinals: Match[] = lbTree.pop(),
          loserBracketFinalsLength: number = loserBracketFinals.length;

      if (loserBracketFinalsLength !== 1) {
        throw Error("No final for loser bracket");
      }

      if (loserBracketFinals[0].id !== finalMatch.id) {
        throw Error("Couldn't reach final from losing bracket");
      }

      if (loserBracketFinals[loserBracketFinalsLength - 1].loserNext()) {
        hasConsolationRound = true;
      }

      hasSecondaryFinal = checkIfSecondaryFinal(finalMatch);
    }
    else {
      var preFinals = finalMatch.winnerPrev(),
          consolationRounds = $.map(preFinals, (m: Match) => m.loserNext());

      hasConsolationRound = !!consolationRounds.length;
    }


    function matchResult(match: Match): number[] {
      return match.result();
    }

    function roundResults(round: Match[]): number[][] {
      return round.map(matchResult);
    }

    function bracketResults(bracket: Match[][]): number[][][] {
      return bracket.map(roundResults);
    }


    var results: number[][][][];
    if (isDoubleElimination) {
      // Pop the final from the winner bracket tree; jquery.bracket requires it
      // to be added in a separate bracket for double elimination.
      wbTree.pop();

      results = [
        bracketResults(wbTree),
        bracketResults(lbTree),
        [[finalMatch.result()]]
      ];
    }
    else {
      results = [bracketResults(wbTree)];
    }

    var teams: string[][] = wbTree[0].map((match: Match): string[] => {
      return match.teamNames();
    });

    return {
      init: {
        teams: teams,
        results: results
      },
      skipSecondaryFinal: !hasSecondaryFinal,
      skipConsolationRound: !hasConsolationRound
    };
  }
}
