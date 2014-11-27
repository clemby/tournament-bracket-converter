module lib {

  export class Tree<T extends {id: number;}> {
    tiers: number[][];
    objects: {[id: number]: T;};
    relation: string;

    constructor(
      headId: number,
      objects: {[id: number]: T;},
      relation: string
    ) {
      this.objects = objects;
      this.relation = relation;

      var currentTier: number[] = [headId],
          tiers: number[][] = this.tiers = [];

      while (currentTier.length) {
        tiers.push(currentTier);
        currentTier = $.map(
          currentTier,
          (id: number): any => this.getChildren(id)
        );
      }
    }

    getChildren(parentId: number): number[] {
      return $.map(
        this.objects,
        (obj: T): number => obj[this.relation] === parentId ? obj.id : null
      );
    }
  }

}
