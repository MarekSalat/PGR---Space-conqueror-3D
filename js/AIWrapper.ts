/**
 * Created with IntelliJ IDEA.
 * User: Petr
 * Date: 30.10.13
 * Time: 22:56
 * To change this template use File | Settings | File Templates.
 */

/// <reference path="AI.ts" />
/// <reference path="Level.ts" /> 

enum MessageType {
    SLEEP_REQUEST,
    MOVE_REQUEST,
    SLEEP_RESPONSE,
    MOVE_RESPONSE
}

class Message {

}

class SleepRequestMessage extends Message {
    type = MessageType.SLEEP_REQUEST;
    sleepTime = 1000; // ms
}

class MoveRequestMessage extends Message {
    type = MessageType.MOVE_REQUEST;
    planets = [];
    player = null; // AIPlayer class
}

class SleepResponseMessage extends Message {
    type = MessageType.SLEEP_RESPONSE;
}

class MoveResponseMessage extends Message {
    type = MessageType.MOVE_RESPONSE;
    move = null;
}

class AIWrapper {

    worker = null;
    difficulty = null;
    sleepRequestMessage = null;
    moveRequestMessage = null;
    public AIEventListener;

    constructor(public screen: any, difficulty: AIDifficultyType) {
         this.difficulty = difficulty;
    }

    init() {
        this.initWorkers();

        this.sleepRequestMessage = new SleepRequestMessage();
        this.sleepRequestMessage.sleepTime = this.difficulty;

        this.moveRequestMessage = new MoveRequestMessage();
        this.moveRequestMessage.player = this.screen.level.competitor;
    }

    initWorkers() {
        var AIworker = new Worker('js/AIWorker.js');
        this.worker = AIworker;

        this.AIEventListener = (function(__this){
            return function(event) {__this.AIEventHandler(event)};
        })(this);

        this.worker.addEventListener('message', this.AIEventListener, false);
    }

    setDifficulty(difficulty: AIDifficultyType) {
        this.difficulty = difficulty;
    }

    AIRun() {
        this.difficulty = Setting.AI.status;
        this.postAIMoveRequest();
    }

    postSleepRequest() {
        if (this.difficulty == AIDifficultyType.SLEEPER) {
            return;
        }
        // console.log("sending sleep request message " + this.difficulty);
        //console.log(this.sleepRequestMessage);
        this.sleepRequestMessage.sleepTime = this.difficulty;
        this.worker.postMessage(this.sleepRequestMessage);
    }

    postAIMoveRequest() {
        this.moveRequestMessage.planets = this.serializePlanets();

        // console.log("sending move request message " + this.difficulty);
        // console.log(this.moveRequestMessage);

        this.worker.postMessage(this.moveRequestMessage);
    }


    AIEventHandler(e) {
        this.difficulty = Setting.AI.status;

        // console.log("AI event handler " + this.difficulty + " " + e);

        if (this.difficulty == AIDifficultyType.SLEEPER) {
            return;
        }

        if (e.data instanceof Object && e.data.hasOwnProperty("type")) {
            if (e.data.type == MessageType.SLEEP_RESPONSE) {
                // console.log("AI awaken");
                this.postAIMoveRequest();
            }
            else if (e.data.type == MessageType.MOVE_RESPONSE) {
                // console.log("Move has come");
                if ( ! this.performAIMove(e.data.move)) {
                    this.worker.terminate(); // no more moves are available, so stop worker
                    return;
                }
                this.postSleepRequest();
            }
        }
        else {
            console.log("Not supported message has come");
            this.worker.terminate();
        }
    }

    performAIMove(move: Move) {
        if (move === null) {
            return false;
        }

        // console.log(move);

        var sourcePlanets = [];
        var sourcePlanetIds = move.sourcePlanetIds;

        var targetPlanet = this.screen.level.getPlanetById(move.targetPlanetId);

        for (var i in sourcePlanetIds) {
            var sourcePlanet = this.screen.level.getPlanetById(sourcePlanetIds[i]);
            sourcePlanets.push(sourcePlanet);
        }

        this.screen.level.sendFleets(sourcePlanets, targetPlanet);

        return true
    }

    serializePlanets() {
        var planets = [];
        var levelPlanets = this.screen.level.planets;

        for (var i in levelPlanets) {

            var planet = {};
            planet['position'] = levelPlanets[i].position;
            planet['_id'] = levelPlanets[i]._id;
            planet['planet'] = {};
            planet['planet']['amountOfShips'] = levelPlanets[i].planet.amountOfShips;
            planet['planet']['owner'] = levelPlanets[i].planet.owner;

            planets.push(planet);
        }

        return planets;
    }

}
