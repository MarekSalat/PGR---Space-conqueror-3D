/**
* Created with IntelliJ IDEA.
* User: Petr
* Date: 29.10.13
* Time: 22:17
* To change this template use File | Settings | File Templates.
*/
/// <reference path="GameModel.ts" />
var Move = (function () {
    function Move() {
        this.sourcePlanetIds = [];
        this.targetPlanetId = null;
    }
    return Move;
})();

var AI = (function () {
    function AI(AIPlayer) {
        this.player = null;
        this.AIPlanets = [];
        this.otherPlanets = [];
        this.player = AIPlayer;
    }
    AI.prototype.initPlanets = function (planets) {
        if (planets === null) {
            return;
        }

        for (var i = 0, l = planets.length; i < l; i++) {
            var planet = planets[i];
            if (planet.planet.owner.type === this.player.type) {
                this.AIPlanets.push(planet);
            } else {
                this.otherPlanets.push(planet);
            }
        }
    };

    AI.prototype.calculateBestMove = function () {
        if (this.AIPlanets.length == 0 || this.otherPlanets.length == 0) {
            return null;
        }

        // TODO: better AI tactic :-)
        var move = new Move();
        for (var i in this.AIPlanets) {
            move.sourcePlanetIds.push(this.AIPlanets[i].id);
        }
        move.targetPlanetId = this.otherPlanets[0].id;

        return move;
    };
    return AI;
})();
//# sourceMappingURL=AI.js.map
