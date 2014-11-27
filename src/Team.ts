module lib {
  export class Team extends lib.CollectionItem<TeamObject> {
    static items: Dict<TeamObject> = {};

    allItems: Dict<TeamObject>;
  }
  Team.prototype.allItems = Team.items;
}
