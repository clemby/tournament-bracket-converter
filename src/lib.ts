module lib {
  export function getFinal(): Match {
    var candidates: Dict<MatchObject> = {},
        matchId: string,
        match: MatchObject,
        matches: Dict<MatchObject> = Match.items;

    for (matchId in matches) {
      match = matches[matchId];

      // The final must have no subsequent matches.
      if (typeof match.winnerNext === 'number') {
        continue;
      }

      // Consider having loserNext but no winnerNext an error.
      if (typeof match.loserNext === 'number') {
        throw Error("Match " + matchId + " has loserNext but no winnerNext");
      }

      candidates[matchId] = match;
    }

    // The final can't be reached directly by losing a match.
    for (matchId in matches) {
      match = matches[matchId];
      if (typeof match.loserNext !== 'number') {
        delete candidates[match.loserNext];
      }
    }

    var keys: string[] = Object.keys(candidates);
    switch (keys.length) {
      case 1:
        return new Match(candidates[keys[0]]);
      case 0:
        throw Error("No final detected; circular or empty tournament?");
      default:
        throw Error("Multiple finals detected: " + keys);
    }
  }


  export function isEmpty(obj: Dict<any>): boolean {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        return false;
      }
    }
    return true;
  }


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


  export interface TournamentOptions {
    hasSecondaryFinal: boolean;
    hasConsolationRound: boolean;
  }


  export function getTournamentOptions(finalMatch?: Match): TournamentOptions {
    if (!finalMatch) {
      finalMatch = getFinal();
    }

    var preFinals: Match[] = finalMatch.winnerPrev(),
        childCount: number = preFinals.length,
        hasSecondaryFinal: boolean = false,
        hasConsolationRound: boolean = false;

    switch (childCount) {
      case 2:
        break;

      case 1:
        hasSecondaryFinal = true;
        preFinals = preFinals[0].winnerPrev();
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

    $.each(preFinals, (i: number, match: Match): void => {
      if (match.loserNext()) {
        hasConsolationRound = true;
      }
    });

    return {
      hasSecondaryFinal: hasSecondaryFinal,
      hasConsolationRound: hasConsolationRound
    };
  }


  export function formatTournamentData(data: ApiData): JQueryBracketData {
    Team.loadItems(data.teams);
    Match.loadItems(data.matches);

    var finalMatch: Match = getFinal(),
        tournOpts = getTournamentOptions();

    // wb: winning bracket; lb: losing bracket.
    var wbFirstRound: Match[] = getFirstRound(),
        wbTree: Match[][] = buildTreeFromBase(wbFirstRound),
        lbFirstRound: Match[] = $.map(wbFirstRound, (match: Match): Match =>
          match.loserNext()
        ),
        lbTree: Match[][],
        isDoubleElimination: boolean = !!lbFirstRound.length;

    // Sanity check.
    if (wbTree[wbTree.length - 1][0].id !== finalMatch.id) {
      throw Error("Couldn't reach final from winning bracket");
    }

    if (isDoubleElimination) {
      lbTree = buildTreeFromBase(lbFirstRound);

      // Ensure the final can be reached from the loser bracket too (otherwise
      // it won't work with jquery.bracket). Remove it so it doesn't appear in
      // the results twice.
      var loserBracketFinals: Match[] = lbTree.pop();
      if (loserBracketFinals.length !== 1) {
        throw Error("No final for loser bracket");
      }

      if (loserBracketFinals[0].id !== finalMatch.id) {
        throw Error("Couldn't reach final from losing bracket");
      }
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
      skipSecondaryFinal: isDoubleElimination && !tournOpts.hasSecondaryFinal,
      skipConsolationRound: !tournOpts.hasConsolationRound
    };
  }
}
