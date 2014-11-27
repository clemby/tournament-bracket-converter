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
      // Cast to any[] because $.map flattens arrays, but this doesn't appear
      // to be understood.
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


  export function formatApiResponse(data) {
    var matches = {},
        loserNextCount = 0;

    $.each(data.teams, (i: number, teamObj: TeamObject): void => {
      Team.items[teamObj.id] = teamObj;
    });

    $.each(data.matches, (i: number, matchObj: MatchObject): void => {
      Match.items[matchObj.id] = matchObj;

      if (typeof matchObj.loserNext === 'number') {
        ++loserNextCount;
      }
    });


    var doubleElimination = false,
        consolationRound = false;

    // TODO: This assumes only two teams per match (fine for jquery.bracket).
    if (loserNextCount === 2) {
      consolationRound = true;
    }
    if (loserNextCount > 2) {
      doubleElimination = true;
    }


    var finalMatch: Match = getFinal();

    if (doubleElimination) {
      return doubleEliminationTournament({
        matches: matches,
        teams: Team.items,
        finalMatch: finalMatch
      });
    }

    throw Error("Not implemented!");
  }


  export function doubleEliminationTournament(o: {
    finalMatch: Match;
  })
    : JQueryBracketData
  {
    var finalMatch = o.finalMatch,
        preFinals = finalMatch.winnerPrev(),
        hasSecondaryFinal = false,
        bracketHeads;

    switch (preFinals.length) {
      case 1:
        hasSecondaryFinal = true;
        bracketHeads = preFinals[0].winnerPrev();
        break;
      case 2:
        hasSecondaryFinal = false;
        bracketHeads = preFinals;
        break;
      default:
        throw Error(
          preFinals.length + " matches directly precede final; expected 1"
        );
    }

    // wb: winning bracket; lb: losing bracket.
    var wbFirstRound: Match[] = getFirstRound();
    var wbTree: Match[][] = buildTreeFromBase(wbFirstRound);
    var lbFirstRound: Match[] = $.map(wbFirstRound, (match: Match): Match =>
          match.loserNext()
        );
    var lbTree: Match[][] = buildTreeFromBase(lbFirstRound);

    if (lbTree.pop()[0].id !== finalMatch.id) {
      // This layout won't work with jquery.bracket.
      throw Error("Couldn't reach final from losing bracket");
    }
    if (wbTree.pop()[0].id !== finalMatch.id) {
      throw Error("Couldn't reach final from winning bracket");
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


    var wbResults: number[][][] = bracketResults(wbTree),
        lbResults: number[][][] = bracketResults(lbTree);

    var results: number[][][][] = [
      wbResults,
      lbResults,
      [[finalMatch.result()]]
    ];

    var teams: string[][] = wbTree[0].map((match: Match): string[] => {
      return match.teamNames();
    });

    $.extend(window, {
      teams: teams,
      results: results,
      wbTree: wbTree,
      lbTree: lbTree,
      wbResults: wbResults,
      lbResults: lbResults
    });

    return {
      teams: teams,
      results: results
    };
  }
}