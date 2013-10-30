/**
* Created with IntelliJ IDEA.
* User: Nich
* Date: 30.10.13
* Time: 22:56
* To change this template use File | Settings | File Templates.
*/
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="AI.ts" />
/// <reference path="Level.ts" />
var MessageType;
(function (MessageType) {
    MessageType[MessageType["SLEEP_REQUEST"] = 0] = "SLEEP_REQUEST";
    MessageType[MessageType["MOVE_REQUEST"] = 1] = "MOVE_REQUEST";
    MessageType[MessageType["SLEEP_RESPONSE"] = 2] = "SLEEP_RESPONSE";
    MessageType[MessageType["MOVE_RESPONSE"] = 3] = "MOVE_RESPONSE";
})(MessageType || (MessageType = {}));

var Message = (function () {
    function Message() {
    }
    return Message;
})();

var SleepRequestMessage = (function (_super) {
    __extends(SleepRequestMessage, _super);
    function SleepRequestMessage() {
        _super.apply(this, arguments);
        this.type = MessageType.SLEEP_REQUEST;
        this.sleepTime = 1000;
    }
    return SleepRequestMessage;
})(Message);

var MoveRequestMessage = (function (_super) {
    __extends(MoveRequestMessage, _super);
    function MoveRequestMessage() {
        _super.apply(this, arguments);
        this.type = MessageType.MOVE_REQUEST;
        this.planets = [];
        this.player = null;
    }
    return MoveRequestMessage;
})(Message);

var SleepResponseMessage = (function (_super) {
    __extends(SleepResponseMessage, _super);
    function SleepResponseMessage() {
        _super.apply(this, arguments);
        this.type = MessageType.SLEEP_RESPONSE;
    }
    return SleepResponseMessage;
})(Message);

var MoveResponseMessage = (function (_super) {
    __extends(MoveResponseMessage, _super);
    function MoveResponseMessage() {
        _super.apply(this, arguments);
        this.type = MessageType.MOVE_RESPONSE;
        this.move = null;
    }
    return MoveResponseMessage;
})(Message);

var AIWrapper = (function () {
    function AIWrapper(screen, difficulty) {
        this.screen = screen;
        this.worker = null;
        this.difficulty = null;
        this.sleepRequestMessage = null;
        this.moveRequestMessage = null;
        this.difficulty = difficulty;
    }
    AIWrapper.prototype.init = function () {
        this.initWorkers();

        this.sleepRequestMessage = new SleepRequestMessage();
        this.sleepRequestMessage.sleepTime = this.difficulty;

        this.moveRequestMessage = new MoveRequestMessage();
        this.moveRequestMessage.player = this.screen.level.competitor;
    };

    AIWrapper.prototype.initWorkers = function () {
        var AIworker = new Worker('js/AIWorker.js');
        this.worker = AIworker;

        this.AIEventListener = (function (__this) {
            return function (event) {
                __this.AIEventHandler(event);
            };
        })(this);

        this.worker.addEventListener('message', this.AIEventListener, false);
    };

    AIWrapper.prototype.AIRun = function () {
        this.postSleepRequest();
    };

    AIWrapper.prototype.postSleepRequest = function () {
        //console.log("sending sleep request message");
        //console.log(this.sleepRequestMessage);
        this.worker.postMessage(this.sleepRequestMessage);
    };

    AIWrapper.prototype.postAIMoveRequest = function () {
        this.moveRequestMessage.planets = this.serializePlanets();

        // console.log("sending move request message");
        // console.log(this.moveRequestMessage);
        this.worker.postMessage(this.moveRequestMessage);
    };

    AIWrapper.prototype.AIEventHandler = function (e) {
        if (e.data instanceof Object && e.data.hasOwnProperty("type")) {
            if (e.data.type == MessageType.SLEEP_RESPONSE) {
                // console.log("AI awaken");
                this.postAIMoveRequest();
            } else if (e.data.type == MessageType.MOVE_RESPONSE) {
                if (!this.performAIMove(e.data.move)) {
                    this.worker.terminate();
                    return;
                }
                this.postSleepRequest();
            }
        } else {
            console.log("Not supported message has come");
            this.worker.terminate();
        }
    };

    AIWrapper.prototype.performAIMove = function (move) {
        if (move === null) {
            return false;
        }

        var sourcePlanets = [];
        var sourcePlanetIds = move.sourcePlanetIds;

        var targetPlanet = this.screen.level.getPlanetById(move.targetPlanetId);

        for (var i in sourcePlanetIds) {
            var sourcePlanet = this.screen.level.getPlanetById(sourcePlanetIds[i]);
            sourcePlanets.push(sourcePlanet);
        }

        this.screen.level.sendFleets(sourcePlanets, targetPlanet);

        return true;
    };

    AIWrapper.prototype.serializePlanets = function () {
        var planets = [];
        var levelPlanets = this.screen.level.planets;

        for (var i in levelPlanets) {
            var planet = {};
            planet['position'] = levelPlanets[i].position;
            planet['id'] = levelPlanets[i].id;
            planet['planet'] = {};
            planet['planet']['amountOfShips'] = levelPlanets[i].planet.amountOfShips;
            planet['planet']['owner'] = levelPlanets[i].planet.owner;

            planets.push(planet);
        }

        return planets;
    };
    return AIWrapper;
})();
//# sourceMappingURL=AIWrapper.js.map
