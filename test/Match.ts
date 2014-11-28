describe("Match", () => {
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
    beforeEach((): void => {
      lib.Match.items[16] = <any> { id: 16 };
    });

    it("returns the underlying object", () => {
      var match = new lib.Match(16);
      expect(match.get()).toBe(lib.Match.items[16]);
    });
  });

  describe("result method", () => {
    var matchId: number;
    var match: lib.Match;

    beforeEach((): void => {
      matchId = 16;
      lib.Match.items[matchId] = {
        id: 16,
        name: 'Final',
        teams: [1, 2, 3]
      };
      match = new lib.Match(matchId);
    });

    it("returns an array of nulls (1 per player) if no winner is set", () => {
      lib.Match.items[matchId].teams = [1, 2, 3];
      expect(match.result()).toEqual([null, null, null]);
    });
    it("throws an error if the winner is set but not in teams list", () => {
      lib.Match.items[matchId].winner = 42;
      expect(() => match.result()).toThrow();
    });
    it("returns 0 for losers and 1 for winners if winner is set & present", ()
    => {
      lib.Match.items[matchId].winner = 2;
      lib.Match.items[matchId].teams = [1, 2, 3];
      expect(match.result()).toEqual([0, 1, 0]);
    });
  });

  describe("teamNames method", () => {
    var match: lib.Match;
    var teams: lib.Team[];

    beforeEach((): void => {
      teams = [
        new lib.Team(0),
        new lib.Team(1),
        new lib.Team(2),
        new lib.Team(3)
      ];

      $.each(teams, (id: number, team: lib.Team): void => {
        spyOn(team, 'shortName').and.returnValue('short name ' + id);
      });

      match = new lib.Match(1);
      spyOn(match, 'teams').and.returnValue(teams);
    });

    it("gets team names via Team.shortName", () => {
      expect(match.teamNames()).toEqual([
        'short name 0',
        'short name 1',
        'short name 2',
        'short name 3'
      ]);
    });
  });
});
