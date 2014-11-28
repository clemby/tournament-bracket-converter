module lib {
  export class Team extends lib.CollectionItem<TeamObject> {
    static items: Dict<TeamObject> = {};

    allItems: Dict<TeamObject>;

    name(): string {
      return this.get().name;
    }

    shortName(): string {
      var obj: TeamObject = this.get();
      return obj.short_name || obj.name;
    }
  }
  Team.prototype.allItems = Team.items;
}
