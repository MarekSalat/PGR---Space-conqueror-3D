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

var AIDifficultyType;
(function (AIDifficultyType) {
    AIDifficultyType[AIDifficultyType["SLEEPER"] = 0] = "SLEEPER";
    AIDifficultyType[AIDifficultyType["EASY"] = 6000] = "EASY";
    AIDifficultyType[AIDifficultyType["MEDIUM"] = 4500] = "MEDIUM";
    AIDifficultyType[AIDifficultyType["HARD"] = 3000] = "HARD";
})(AIDifficultyType || (AIDifficultyType = {}));

var AIStateType;
(function (AIStateType) {
    AIStateType[AIStateType["INIT"] = 0] = "INIT";
    AIStateType[AIStateType["DEFEND"] = 1] = "DEFEND";
    AIStateType[AIStateType["ATTACK_RANDOM"] = 2] = "ATTACK_RANDOM";
    AIStateType[AIStateType["CUT_OFF_HUMAN"] = 3] = "CUT_OFF_HUMAN";
})(AIStateType || (AIStateType = {}));

var AI = (function () {
    function AI() {
        this.state = null;
        this.player = null;
        this.AIPlanets = [];
        this.otherPlanets = [];
        this.move = null;
        this.move = new Move();
    }
    AI.prototype.init = function (player, planets) {
        if (planets === null) {
            return;
        }

        this.state = AIStateType.INIT;
        this.player = player;
        this.AIPlanets = [];
        this.otherPlanets = [];

        for (var i = 0, l = planets.length; i < l; i++) {
            var planet = planets[i];
            if (planet.planet.owner.type === this.player.type) {
                this.AIPlanets.push(planet);
            } else {
                this.otherPlanets.push(planet);
            }
        }

        this.updateState();
    };

    AI.prototype.updateState = function () {
        // if are some fleets attacking me?
        // ---- if is valuable to defend?
        // ---- ---- this.state = AIStateType.DEFEND;
        // ---- ---- return;
        // if has human more resources?
        // ---- this.state = AIStateType.CUT_OFF_HUMAN;
        // ---- return
        this.state = AIStateType.ATTACK_RANDOM;
        return;
    };

    AI.prototype.getAIMove = function () {
        if (this.AIPlanets.length == 0 || this.otherPlanets.length == 0) {
            return null;
        }

        this.move.sourcePlanetIds = [];
        this.move.targetPlanetId = null;

        switch (this.state) {
            case AIStateType.DEFEND:
                return this.getBestDefendMove();
            case AIStateType.CUT_OFF_HUMAN:
                return this.getCutOffHumanMove();
            case AIStateType.ATTACK_RANDOM:
            default:
                return this.getRandomMove();
        }
    };

    AI.prototype.getBestDefendMove = function () {
    };

    AI.prototype.getCutOffHumanMove = function () {
    };

    AI.prototype.getRandomMove = function () {
        for (var i in this.AIPlanets) {
            if (Math.random() < 0.3) {
                this.move.sourcePlanetIds.push(this.AIPlanets[i].id);
            }
        }
        if (this.move.sourcePlanetIds.length == 0) {
            this.move.sourcePlanetIds.push(this.AIPlanets[0].id);
        }
        this.move.targetPlanetId = this.otherPlanets[Math.floor(Math.random() * this.otherPlanets.length)].id;

        return this.move;
    };
    return AI;
})();
//# sourceMappingURL=AI.js.map
