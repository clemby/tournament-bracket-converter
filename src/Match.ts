module lib {
  export class Match extends lib.CollectionItem<MatchObject> {
    static items: Dict<MatchObject> = {};

    allItems: Dict<MatchObject>;

    constructor(obj: MatchObject);
    constructor(match: Match);
    constructor(id: number);
    constructor(id: string);
    constructor(arg: any) {
      super(typeof arg === 'number' || typeof arg === 'string' ? +arg : arg.id);
    }

    name(): string {
      return this.get().name;
    }

    winnerNext(): Match {
      return this.propOrNull('winner_next');
    }

    loserNext(): Match {
      return this.propOrNull('loser_next');
    }

    teams(): Team[] {
      return $.map(this.get().teams, (id: number): Team => new Team(id));
    }

    teamNames(): string[] {
      return this.teams().map((team: Team): string => team.shortName());
    }

    winner(): Team {
      return this.propOrNull('winner');
    }

    prev(relation: string): Match[] {
      return $.map(this.allItems, (matchObj: MatchObject): Match => {
        return matchObj[relation] === this.id ? new Match(matchObj.id) : null;
      });
    }

    winnerPrev(): Match[] {
      return this.prev('winner_next');
    }

    loserPrev(): Match[] {
      return this.prev('loser_next');
    }

    result(): number[] {
      var obj: MatchObject = this.get(),
          winnerId: number = obj.winner;

      function toNull(x) {
        return null;
      }

      if (typeof winnerId !== 'number') {
        return obj.teams.map(toNull);
      }

      var index: number = $.inArray(winnerId, obj.teams);
      if (index < 0) {
        throw Error("Winner " + winnerId + " not found in team list");
      }

      return obj.teams.map((teamId: number) => {
        return teamId === winnerId ? 1 : 0;
      });
    }

  }
  Match.prototype.allItems = Match.items;

}


declare module lib {
  export module Match {
    export function propOrNull(propertyName: string): Match;
  }
}
