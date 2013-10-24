/**
 * Created with JetBrains PhpStorm.
 * User: Marek
 * Date: 18.10.13
 * Time: 19:41
 * To change this template use File | Settings | File Templates.
 */

var GameModel = GameModel || function (){
    this.planets = [];
    this.fleets = [];

    this.init = function(){
    };

    this.createAndAddPlanet = function (){
        var newPlanet = new GameModel.Planet();
        this.planets.push(newPlanet);

        return newPlanet;
    };

    this.sendFleets = function(from, to, flyTimeInMillis){
        var fleet = new GameModel.SpaceShipFleet();
        this.fleets.push(fleet);
        return from.sendFleets(to, flyTimeInMillis, fleet);
    };

    this.update = function (delta){
        this.updatePlanets(delta);
        this.updateFleets(delta);
    };

    this.updatePlanets = function(delta){
        for(var i in this.planets){
            this.planets[i].update(delta);
        }
    };

    this.updateFleets = function(delta){
        for(var i in this.fleets){
            var fleet = this.fleets[i];
            fleet.update(delta);

            if(fleet.timeToArrive <= 0){
                this.fleets.unshift(fleet);
            }
        }
    };
};

GameModel.Player = function(){
    // @var current type of player
    this.type = this.TYPE_ENUM.NONE;

    // @var number of conquered planets, number of planets player currently have
    this.conqueredPlanets = 0;
};
GameModel.Player.prototype.TYPE_ENUM = {
    NONE: 0,
    PLAYER: 1,
    BOOT: 2
};

GameModel.NeutralOwner = new GameModel.Player();

GameModel.RealPlayer = new GameModel.Player();
GameModel.RealPlayer.type = GameModel.Player.prototype.TYPE_ENUM.PLAYER;

GameModel.Planet = function(){
    // @var new ships created per second
    this.newShipsPerSecond = 3;

    // @var current state
    this.amountOfShips = 0;

    // @var how many of ships will take off on one move from this planet in hold
    this.takeoffInPercent = 0.5;

    // @var how many ships will be in one fleet
    this.fleetCapacity = 10;

    // @var who owns this planet
    this.owner = GameModel.NeutralOwner;

    // @var
    this.name = "unknown";

    //@fixme: fleet by asi melo byt array a to by se melo i vracet
    this.sendFleets = function(destination, flyTimeInMillis, fleet){
        var numberOfShips = Math.ceil(this.amountOfShips * this.takeoffInPercent);
        if( (this.amountOfShips - numberOfShips) < 1 || numberOfShips < 0) return 0;

        this.amountOfShips -= numberOfShips;

        for(var i = numberOfShips; i > 0; i -= this.fleetCapacity){
            var fleetCapacity = (i >= this.fleetCapacity) ? this.fleetCapacity : i;

            fleet.from = this;
            fleet.destination = destination;
            fleet.owner = this.owner;
            fleet.capacity = fleetCapacity;
            fleet.timeToArrive = flyTimeInMillis;
            fleet.timeToStart = Math.random()/10; // 0-10 ms
        }

        return numberOfShips;
    };

    // @var attack
    this.visit = function (shipFleet){
        if( shipFleet.destination != this ){
            console.log("ShipFleet (" + shipFleet + ") trying to land on wrong planet (fleet destination "
                + shipFleet.destination + ", current planet" + this + ")");
            return;
        }

        var amountOfVisitors = shipFleet.capacity;
        shipFleet.capacity = 0;

        if(shipFleet.owner == this.owner){ // this is my planet so we can add ships
            this.amountOfShips += amountOfVisitors;
            return;
        }

        // this is not my planet, attack it!
        this.amountOfShips -= amountOfVisitors;

        if(this.amountOfShips > 0)
            return; // owner has not been changed

        // owner of this planet are changing

        this.amountOfShips = Math.abs(this.amountOfShips); // amount of ships can be < 0 if fleet is conquering planet

        this.owner.conqueredPlanets--;  // old owner has lost this planet

        if(this.amountOfShips == 0)
            this.owner = GameModel.NeutralOwner;
        else
            this.owner = shipFleet.owner;

        this.owner.conqueredPlanets++;  // new owner has conquered new planet
    };

    this.update = function(delta){
        if(this.owner == GameModel.NeutralOwner) return;

        this.amountOfShips += (delta/1000)*this.newShipsPerSecond;
    };
};
GameModel.NonePlanet = new GameModel.Planet();

GameModel.NeutralPlanet = (function (_super) {
    // constructor
    var _this = function (numberOfShips) {
        this.constructor.super.call(this);

        this.amountOfShips = numberOfShips || 10;
        this.owner = GameModel.NeutralOwner;
    };
    extend(_this, _super);

    return _this;
})(GameModel.Planet);

/* [poolable] */
GameModel.SpaceShipFleet = function(){

    this.init = function(){
        // @var flying from planet
        this.from = GameModel.NonePlanet;
        // @var flying to planet
        this.destination = GameModel.NonePlanet;

        // @var how many ships this fleet have
        this.capacity = 0;

        // @var who owns this fleet
        this.owner = GameModel.NeutralOwner;

        // @var time to land and conquer planet in millisecond
        this.timeToArrive = Infinity;

        this.timeToStart = 0;
    };
    this.init();

    this.update = function (delta){

        if(this.timeToStart > 0 ){
            this.timeToStart -= delta;
            return;
        }

        this.timeToArrive -= delta;

        if(this.timeToArrive <= 0){
            this.timeToArrive = 0;
            this.destination.visit(this);
        }
    };
};

/* [poolable] */
GameModel.SpaceShip = function(){
    this.init();

    this.init = function(){

    };
};

GameModel.Score = function(){
    this.score = 0;
};