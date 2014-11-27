module lib {
  export class Match extends lib.CollectionItem<MatchObject> {
    static items: {[id: number]: MatchObject;} = {};

    constructor(obj: MatchObject);
    constructor(match: Match);
    constructor(id: number);
    constructor(arg: any) {
      super(typeof arg === 'number' ? arg : arg.id);
    }

    name(): string {
      return this.get().name;
    }

    winnerNext(): Match {
      return this.propOrNull('winnerNext');
    }

    loserNext(): Match {
      return this.propOrNull('loserNext');
    }

    teams(): Team[] {
      return $.map(this.get().teams, (id: number): Team => new Team(id));
    }

    teamNames(): string[] {
      return $.map(
        this.get().teams,
        (id: number): string => Team.items[id].name
      );
    }

    winner(): Team {
      return this.propOrNull('winner');
    }

    prev(relation: string): Match[] {
      return $.map(this.items, (matchObj: MatchObject): Match => {
        return matchObj[relation] === this.id ? new Match(matchObj.id) : null;
      });
    }

    winnerPrev(): Match[] {
      return this.prev('winnerNext');
    }

    loserPrev(): Match[] {
      return this.prev('loserNext');
    }

    result(): number[] {
      var obj: MatchObject = this.get(),
          winnerId: number = obj.winner;

      function toNull(x) {
        return null;
      }

      if (typeof winnerId !== 'number') {
        return $.map(obj.teams, toNull);
      }

      var index: number = $.inArray(winnerId, obj.teams);
      if (index < 0) {
        return $.map(obj.teams, toNull);
      }

      return $.map(obj.teams, (teamObj: TeamObject) => {
        return teamObj.id === winnerId ? 1 : 0;
      });
    }

  }
  Match.prototype.items = Match.items;

}


declare module lib {
  export module Match {
    export function propOrNull(propertyName: string): Match;
  }
}
