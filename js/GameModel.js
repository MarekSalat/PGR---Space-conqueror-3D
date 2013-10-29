var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/**
* Created with JetBrains PhpStorm.
* User: Marek
* Date: 18.10.13
* Time: 19:41
* To change this template use File | Settings | File Templates.
*/
var GameModel;
(function (GameModel) {
    var Factories = (function () {
        function Factories() {
        }
        Factories.createNeutralPlanet = function () {
            return new NeutralPlanet(0);
        };

        Factories.getNeutralPlanet = function () {
            if (Factories.neutralPlanet == null) {
                Factories.neutralPlanet = Factories.createNeutralPlanet();
            }
            return Factories.neutralPlanet;
        };

        Factories.createNonePlanet = function () {
            return new NonePlanet();
        };

        Factories.getNonePlanet = function () {
            if (Factories.nonePlanet == null) {
                Factories.nonePlanet = Factories.createNonePlanet();
                //this.nonePlanet.init();
            }
            return Factories.nonePlanet;
        };

        Factories.createNeutralOwner = function () {
            return new NeutralOwner();
        };

        Factories.getNeutralOwner = function () {
            if (Factories.neutralOwner == null) {
                Factories.neutralOwner = Factories.createNeutralOwner();
                //this.neutralOwner.init()
            }
            return Factories.neutralOwner;
        };
        Factories.neutralPlanet = null;

        Factories.nonePlanet = null;

        Factories.neutralOwner = null;
        return Factories;
    })();
    GameModel.Factories = Factories;

    var Model = (function () {
        function Model() {
            this.planets = [];
            this.fleets = [];
        }
        Model.prototype.init = function () {
        };

        Model.prototype.createAndAddPlanet = function () {
            var newPlanet = new Planet();
            this.planets.push(newPlanet);

            return newPlanet;
        };

        Model.prototype.sendFleets = function (from, to, flyTimeInMillis) {
            var fleets = from.sendFleets(to, flyTimeInMillis);
            for (var i in fleets)
                this.fleets.push(fleets[i]);
            return fleets;
        };

        Model.prototype.update = function (delta) {
            this.updatePlanets(delta);
            this.updateFleets(delta);
        };

        Model.prototype.updatePlanets = function (delta) {
            for (var i in this.planets) {
                this.planets[i].update(delta);
            }
        };

        Model.prototype.updateFleets = function (delta) {
            for (var i in this.fleets) {
                var fleet = this.fleets[i];
                fleet.update(delta);

                if (fleet.timeToArrive <= 0) {
                    this.fleets.splice(i, 1);
                }
            }
        };
        return Model;
    })();
    GameModel.Model = Model;
    ;

    (function (PlayerType) {
        PlayerType[PlayerType["NONE"] = 0] = "NONE";
        PlayerType[PlayerType["PLAYER"] = 1] = "PLAYER";
        PlayerType[PlayerType["BOOT"] = 2] = "BOOT";
    })(GameModel.PlayerType || (GameModel.PlayerType = {}));
    var PlayerType = GameModel.PlayerType;
    ;

    var Player = (function () {
        function Player() {
            // @var current type of player
            this.type = PlayerType.NONE;
            // @var number of conquered planets, number of planets player currently have
            this.conqueredPlanets = 0;
        }
        return Player;
    })();
    GameModel.Player = Player;
    ;

    var NeutralOwner = (function (_super) {
        __extends(NeutralOwner, _super);
        function NeutralOwner() {
            _super.call(this);
        }
        return NeutralOwner;
    })(Player);
    GameModel.NeutralOwner = NeutralOwner;

    var RealPlayer = (function (_super) {
        __extends(RealPlayer, _super);
        function RealPlayer() {
            _super.call(this);
            this.type = PlayerType.PLAYER;
        }
        return RealPlayer;
    })(Player);
    GameModel.RealPlayer = RealPlayer;

    // ---------------
    var Planet = (function () {
        function Planet() {
            // @var new ships created per second
            this.newShipsPerSecond = 30;
            // @var current state
            this.amountOfShips = 0;
            this.maximumAmountOfShips = 500;
            // @var how many of ships will take off on one move from this planet in hold
            this.takeoffInPercent = 0.5;
            // @var how many ships will be in one fleet
            this.fleetCapacity = 10;
            // @var who owns this planet
            this.owner = Factories.getNeutralOwner();
            // @var
            this.name = "unknown";
        }
        Planet.prototype.sendFleets = function (destination, flyTimeInMillis) {
            var numberOfShips = Math.ceil(this.amountOfShips * this.takeoffInPercent);
            if ((this.amountOfShips - numberOfShips) < 1 || numberOfShips < 0)
                return [];

            this.amountOfShips -= numberOfShips;

            var fleets = [];
            for (var i = numberOfShips; i > 0; i -= this.fleetCapacity) {
                var fleetCapacity = (i >= this.fleetCapacity) ? this.fleetCapacity : i;

                var fleet = new SpaceShipFleet();
                fleet.from = this;
                fleet.destination = destination;
                fleet.owner = this.owner;
                fleet.capacity = fleetCapacity;
                fleet.timeToArrive = flyTimeInMillis;
                fleet.flyTime = flyTimeInMillis;
                fleet.timeToStart = -Math.random() * 500;

                fleets.push(fleet);
            }

            return fleets;
        };

        // @var attack
        Planet.prototype.visit = function (shipFleet) {
            if (shipFleet.destination != this) {
                console.log("ShipFleet (" + shipFleet + ") trying to land on wrong planet (fleet destination " + shipFleet.destination + ", current planet" + this + ")");
                return;
            }

            var amountOfVisitors = shipFleet.capacity;
            shipFleet.capacity = 0;

            if (shipFleet.owner == this.owner) {
                this.amountOfShips += amountOfVisitors;
                return;
            }

            // this is not my planet, attack it!
            this.amountOfShips -= amountOfVisitors;

            if (this.amountOfShips > 0)
                return;

            // owner of this planet are changing
            this.amountOfShips = Math.abs(this.amountOfShips);

            this.owner.conqueredPlanets--;

            if (this.amountOfShips == 0)
                this.owner = Factories.getNeutralOwner();
else
                this.owner = shipFleet.owner;

            this.owner.conqueredPlanets++;
        };

        Planet.prototype.update = function (delta) {
            if (typeof this.owner == "NeutralOwner")
                return;

            this.amountOfShips += (delta / 1000) * this.newShipsPerSecond;
            if (this.amountOfShips > this.maximumAmountOfShips)
                this.amountOfShips = this.maximumAmountOfShips;
        };
        return Planet;
    })();
    GameModel.Planet = Planet;
    ;

    var NeutralPlanet = (function (_super) {
        __extends(NeutralPlanet, _super);
        function NeutralPlanet(numberOfShips) {
            _super.call(this);

            this.amountOfShips = numberOfShips || 10;
            this.owner = Factories.getNeutralOwner();
        }
        return NeutralPlanet;
    })(Planet);
    GameModel.NeutralPlanet = NeutralPlanet;
    ;

    var NonePlanet = (function (_super) {
        __extends(NonePlanet, _super);
        function NonePlanet() {
            _super.call(this);

            this.amountOfShips = 0;
            this.owner = Factories.getNeutralOwner();
        }
        NonePlanet.prototype.sendFleets = function (destination, flyTimeInMillis) {
            return [];
        };

        NonePlanet.prototype.update = function (delta) {
        };

        NonePlanet.prototype.visit = function (shipFleet) {
        };
        return NonePlanet;
    })(Planet);
    GameModel.NonePlanet = NonePlanet;
    ;

    // --------------------
    var SpaceShipFleet = (function () {
        function SpaceShipFleet() {
            // @var flying from planet
            this.from = Factories.getNonePlanet();
            // @var flying to planet
            this.destination = Factories.getNonePlanet();
            // @var how many ships this fleet have
            this.capacity = 0;
            // @var who owns this fleet
            this.owner = Factories.getNeutralOwner();
            // @var time to land and conquer planet in millisecond
            this.timeToArrive = Infinity;
            this.flyTime = Infinity;
            this.timeToStart = 0;
        }
        SpaceShipFleet.prototype.init = function () {
        };

        SpaceShipFleet.prototype.update = function (delta) {
            if (this.timeToStart < 0) {
                this.timeToStart += delta;
                return;
            }

            this.timeToArrive -= delta;

            if (this.timeToArrive <= 0) {
                this.timeToArrive = 0;
                this.destination.visit(this);
            }
        };
        return SpaceShipFleet;
    })();
    GameModel.SpaceShipFleet = SpaceShipFleet;
    ;
})(GameModel || (GameModel = {}));
//# sourceMappingURL=GameModel.js.map
