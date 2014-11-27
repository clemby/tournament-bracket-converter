module lib {
  export class Team extends lib.CollectionItem<TeamObject> {
    static items: {[id: number]: TeamObject;} = {};
  }
  Team.prototype.items = Team.items;
}
