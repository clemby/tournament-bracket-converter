module lib {
  export class CollectionItem<T extends {id: number;}> {
    static items: Dict<any>;

    static loadItems: (items: Dict<any>) => void;

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
  CollectionItem.loadItems = function(items: any[]): void {
    if (!this.items) {
      throw Error("Must create items dict on leaf class first");
    }

    $.each(items, (idx: number, obj: any): void => {
      this.items[obj.id] = obj;
    });
  };
}
