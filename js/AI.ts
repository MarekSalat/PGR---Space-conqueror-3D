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
    EASY = 6000,
    MEDIUM = 4500,
    HARD = 3000
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
        for (var i in this.AIPlanets) {
            if (Math.random() < 0.3) { // 33.3% chance that planet will be give into soucePlanets
                this.move.sourcePlanetIds.push(this.AIPlanets[i].id);
            }
        }
        if (this.move.sourcePlanetIds.length == 0) {
            this.move.sourcePlanetIds.push(this.AIPlanets[0].id);
        }
        this.move.targetPlanetId = this.otherPlanets[Math.floor(Math.random()*this.otherPlanets.length)].id;

        return this.move
    }
}



