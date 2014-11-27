module lib {
  export class CollectionItem<T> {
    static items: Dict<any>;

    allItems: Dict<any>;
    id: number;

    constructor(id: number) {
      this.id = id;
    }

    get(): T {
      return this.allItems[this.id];
    }

    propOrNull(propertyName: string): any {
      var id: number = this.get()[propertyName];
      return typeof id === 'number' ? new (<any> this.constructor)(id) : null;
    }
  }
}
