interface SomeObj {
  id: number;
}


class SubClass extends lib.CollectionItem<SomeObj> {
  static items: lib.Dict<SubClass> = {};
}
SubClass.prototype.allItems = SubClass.items;


describe("CollectionItem", () => {
  describe("loadItems static method", () => {
    it("throws if the items dict hasn't been set", () => {
      expect((): void => { lib.CollectionItem.loadItems([]); }).toThrow();
    });
    it("sets all items by their 'id' property", () => {
      var items: SomeObj[] = [{ id: 4 }, { id: 17 }];
      SubClass.loadItems(items);
      expect(SubClass.items[4]).toBe(items[0]);
      expect(SubClass.items[17]).toBe(items[1]);
    });
  });
});

describe("CollectionItem", () => {
  describe("constructor", () => {
    it("sets the id", () => {
      var cItem = new lib.CollectionItem<any>(17);
      expect(cItem.id).toBe(17);
    });
  });
});

describe("CollectionItem", () => {
  var items: SomeObj[];
  var instance: SubClass;
  
  beforeEach((): void => {
    items = [{
      id: 4
    }, {
      id: 7,
      setProperty: 19
    }, {
      id: 19
    }];
    SubClass.loadItems(items);
    instance = new SubClass(7);
  });

  describe("get method", () => {
    it("returns the instance with that id", () => {
      expect(instance.get()).toBe(items[1]);
    });
  });

  describe("propOrNull method", () => {
    it("returns null if that property isn't set", () => {
      expect(instance.propOrNull('unsetProperty')).toBe(null);
    });
    it("returns a new object of the same type if the property is set", () => {
      var other: SubClass = instance.propOrNull('setProperty');
      expect(other.id).toBe(19);
      expect(other instanceof SubClass);
    });
  });
});
