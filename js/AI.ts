/**
 * Created with IntelliJ IDEA.
 * User: Petr
 * Date: 29.10.13
 * Time: 22:17
 * To change this template use File | Settings | File Templates.
 */

/// <reference path="GameModel.ts" />

class Move {
    sourcePlanetIds = [];
    targetPlanetId = null;
}

enum AIDifficultyType {
    SLEEPER = 0,
    EASY = 9000,
    MEDIUM = 6000,
    HARD = 2500
}

enum AIStateType {
    INIT,
    DEFEND,
    ATTACK_RANDOM,
    CUT_OFF_HUMAN
}

class AI {
    state = null;
    player = null;
    AIPlanets = [];
    otherPlanets = [];
    move = null;

    constructor() {
        this.move = new Move();
    }

    init(player: GameModel.Player, planets: any) {

        if (planets === null) {
            return;
        }

        this.state = AIStateType.INIT;
        this.player = player;
        this.AIPlanets = [];
        this.otherPlanets = [];

        for (var i=0, l=planets.length; i < l; i++) {
            var planet = planets[i];
            if (planet.planet.owner.type === this.player.type) {
                this.AIPlanets.push(planet);
            }
            else {
                this.otherPlanets.push(planet);
            }
        }

        this.updateState();
    }

    private updateState() {
        // if are some ship attacking me?

        // ---- if is valuable to defend?
        // ---- ---- this.state = AIStateType.DEFEND;
        // ---- ---- return;

        // if has human more resources?
        // ---- this.state = AIStateType.CUT_OFF_HUMAN;
        // ---- return

        this.state = AIStateType.ATTACK_RANDOM;
        return;
    }

    getAIMove() {
        if (this.AIPlanets.length == 0 || this.otherPlanets.length == 0) {
            return null;
        }

        this.move.sourcePlanetIds = [];
        this.move.targetPlanetId = null;

        switch(this.state) {
            case AIStateType.DEFEND:
                return this.getBestDefendMove();
            case AIStateType.CUT_OFF_HUMAN:
                return this.getCutOffHumanMove();
            case AIStateType.ATTACK_RANDOM:
            default:
                return this.getRandomMove();
        }
    }

    getBestDefendMove() {

    }

    getCutOffHumanMove() {

    }

    getRandomMove() {

        var sourcePlanets = [];

        for (var i in this.AIPlanets) {
            if (Math.random() < 0.3) { // 30% chance that planet will be give into soucePlanets
                this.move.sourcePlanetIds.push(this.AIPlanets[i]._id);
                sourcePlanets.push(this.AIPlanets[i]);
            }
        }
        if (this.move.sourcePlanetIds.length == 0) {
            this.move.sourcePlanetIds.push(this.AIPlanets[0]._id);
            sourcePlanets.push(this.AIPlanets[0]);
        }
        //this.move.targetPlanetId = this.otherPlanets[Math.floor(Math.random()*this.otherPlanets.length)]._id;

        var minimum = 100000000;
        var distance = 1000000000000;
        for (var i in this.otherPlanets) {
            var planet = this.otherPlanets[i];


            var newDistance = this.calculateDistance(planet, sourcePlanets[0]);
            if (distance > newDistance) {
                if (minimum >= planet.planet.amountOfShips || (minimum + 30) >= planet.planet.amountOfShips) {

                    this.move.targetPlanetId = planet._id;

                    minimum = planet.planet.amountOfShips;
                    distance = newDistance;
                }
            }


        }

        return this.move
    }

    calculateDistance(from, to) {
        return Math.sqrt(
            Math.pow(from.position.x - to.position.x, 2) +
            Math.pow(from.position.y - to.position.z, 2) +
            Math.pow(from.position.z - to.position.z, 2)   );
    }
}



