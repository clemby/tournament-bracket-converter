describe("Match", () => {
  var items: lib.Dict<lib.MatchObject> = {
    7: {
      "name": "WB - Match 1",
      "id": 7,
      "winner": 6,
      "teams": [
        6,
        4
      ],
      "winnerNext": 13,
      "loserNext": 9
    },
    8: {
      "name": "WB - Match 2",
      "id": 8,
      "winner": null,
      "teams": [
        3,
        8
      ],
      "winnerNext": 13,
      "loserNext": 9
    },
    9: {
      "name": "LB - Match 1",
      "id": 9,
      "winner": null,
      "teams": [
        2
      ],
      "winnerNext": 17,
      "loserNext": null
    },
    10: {
      "name": "LB - Match 2",
      "id": 10,
      "winner": null,
      "teams": [],
      "winnerNext": 18,
      "loserNext": null
    },
    11: {
      "name": "WB - Match 3",
      "id": 11,
      "winner": null,
      "teams": [
        1,
        2
      ],
      "winnerNext": 14,
      "loserNext": 10
    },
    12: {
      "name": "WB - Match 4",
      "id": 12,
      "winner": null,
      "teams": [
        7,
        5
      ],
      "winnerNext": 14,
      "loserNext": 10
    },
    13: {
      "name": "WB - Match 5",
      "id": 13,
      "winner": null,
      "teams": [],
      "winnerNext": 15,
      "loserNext": 17
    },
    14: {
      "name": "WB - Match 6",
      "id": 14,
      "winner": null,
      "teams": [],
      "winnerNext": 15,
      "loserNext": 18
    },
    15: {
      "name": "WB - Match 7",
      "id": 15,
      "winner": null,
      "teams": [],
      "winnerNext": 16,
      "loserNext": 20
    },
    16: {
      "name": "Final",
      "id": 16,
      "winner": null,
      "teams": [],
      "winnerNext": null,
      "loserNext": null
    },
    17: {
      "name": "LB - Match 3",
      "id": 17,
      "winner": null,
      "teams": [],
      "winnerNext": 19,
      "loserNext": null
    },
    18: {
      "name": "LB - Match 4",
      "id": 18,
      "winner": null,
      "teams": [],
      "winnerNext": 19,
      "loserNext": null
    },
    19: {
      "name": "LB - Match 5",
      "id": 19,
      "winner": null,
      "teams": [],
      "winnerNext": 20,
      "loserNext": null
    },
    20: {
      "name": "LB - Match 6",
      "id": 20,
      "winner": null,
      "teams": [],
      "winnerNext": 16,
      "loserNext": null
    }
  };

  beforeEach((): void => {
    lib.Match.loadItems(items);
  });

  describe("constructor", () => {
    var match: lib.Match;

    it("takes the object's id if given an object", () => {
      match = new lib.Match(<lib.MatchObject> {id: 7});
      expect(match.id).toBe(7);
    });
    it("takes the match's id if given a Match", () => {
      var other = new lib.Match(7);
      match = new lib.Match(other);
      expect(match.id).toBe(other.id);
    });
    it("takes the argument as id if given a number", () => {
      match = new lib.Match(7);
      expect(match.id).toBe(7);
    });
    it("takes the argument as numerical id if given a string", () => {
      match = new lib.Match("7");
      expect(match.id).toBe(7);
    });
  });

  describe("get method", () => {
    it("returns the underlying object", () => {
      var match = new lib.Match(16);
      expect(match.get()).toBe(items[16]);
    });
  });

  describe("result method", () => {
    var matchId: number;
    var match: lib.Match;

    beforeEach((): void => {
      matchId = 16;
      match = new lib.Match(matchId);
    });

    it("returns an array of nulls (1 per player) if no winner is set", () => {
      items[matchId].teams = [1, 2, 3];
      expect(match.result()).toEqual([null, null, null]);
    });
    it("throws an error if the winner is set but not in teams list", () => {
      items[matchId].winner = 42;
      expect(() => match.result()).toThrow();
    });
    it("returns 0 for losers and 1 for winners if winner is set & present", ()
    => {
      items[matchId].winner = 2;
      items[matchId].teams = [1, 2, 3];
      expect(match.result()).toEqual([0, 1, 0]);
    });
  });
});
