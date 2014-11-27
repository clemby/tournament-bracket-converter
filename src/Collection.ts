module lib {
  export class CollectionItem<T> {
    static items: {[id: number]: any;};

    id: number;
    items: typeof CollectionItem.items;

    constructor(id: number) {
      this.id = id;
    }

    get(): T {
      return this.items[this.id];
    }

    propOrNull(propertyName: string): any {
      var id: number = this.get()[propertyName];
      return typeof id === 'number' ? new (<any> this.constructor)(id) : null;
    }
  }
}
