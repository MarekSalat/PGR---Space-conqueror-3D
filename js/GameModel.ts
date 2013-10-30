/**
 * Created with JetBrains PhpStorm.
 * User: Marek
 * Date: 18.10.13
 * Time: 19:41
 * To change this template use File | Settings | File Templates.
 */
module GameModel {

    export class Factories {

        static createNeutralPlanet(){
            return new NeutralPlanet(0);
        }
        private static neutralPlanet = null;
        static getNeutralPlanet(){
            if(Factories.neutralPlanet == null){
                Factories.neutralPlanet = Factories.createNeutralPlanet();
            }
            return Factories.neutralPlanet;
        }

        static createNonePlanet(){
            return new NonePlanet();
        }
        private static nonePlanet = null;
        static getNonePlanet(){
            if(Factories.nonePlanet == null){
                Factories.nonePlanet = Factories.createNonePlanet();
                //this.nonePlanet.init();
            }
            return Factories.nonePlanet;
        }

        static createNeutralOwner (){
            return new NeutralOwner();
        }
        private static neutralOwner = null;
        static getNeutralOwner (){
            if(Factories.neutralOwner == null){
                Factories.neutralOwner = Factories.createNeutralOwner();
                //this.neutralOwner.init()
            }
            return Factories.neutralOwner;
        }
    }

    export class Model {
        planets = [];
        fleets = [];

        constructor(){}

        init(){ }

        createAndAddPlanet () {
            var newPlanet = new Planet();
            this.planets.push(newPlanet);

            return newPlanet;
        }

        sendFleets (from: Planet, to: Planet, flyTimeInMillis:number){
            var fleets = from.sendFleets(to, flyTimeInMillis);
            for(var i in fleets)
                this.fleets.push(fleets[i]);
            return fleets;
        }

        update (delta){
            this.updatePlanets(delta);
            this.updateFleets(delta);
        }

        updatePlanets (delta){
            for(var i in this.planets){
                this.planets[i].update(delta);
            }
        }

        updateFleets (delta){
            for(var i in this.fleets){
                var fleet = this.fleets[i];
                fleet.update(delta);

                if(fleet.timeToArrive <= 0){
                    this.fleets.splice(i, 1);
                }
            }
        }
    };


    export enum PlayerType {
        NONE,
        PLAYER,
        BOOT,
    };

    export class Player {

        // @var current type of player
        type = PlayerType.NONE;

        // @var number of conquered planets, number of planets player currently have
        conqueredPlanets = 0;
    };

    export class NeutralOwner extends Player {
        constructor (){
            super();
        }
    }

    export class RealPlayer extends Player {
        constructor(){
            super();
            this.type = PlayerType.PLAYER;
        }
    }

    // ---------------

    export class Planet {
        // @var new ships created per second
        newShipsPerSecond = 30;

        // @var current state
        amountOfShips = 0;

        maximumAmountOfShips = 500;

        // @var how many of ships will take off on one move from this planet in hold
        takeoffInPercent = 0.5;

        // @var how many ships will be in one fleet
        fleetCapacity = 10;

        // @var who owns this planet
        owner = Factories.getNeutralOwner();

        // @var
        name = "unknown";

        sendFleets(destination: Planet, flyTimeInMillis:number ){
            var numberOfShips = Math.ceil(this.amountOfShips * this.takeoffInPercent);
            if( (this.amountOfShips - numberOfShips) < 1 || numberOfShips < 0) return [];

            this.amountOfShips -= numberOfShips;

            var fleets = [];
            for(var i = numberOfShips; i > 0; i -= this.fleetCapacity){
                var fleetCapacity = (i >= this.fleetCapacity) ? this.fleetCapacity : i;

                var fleet = new SpaceShipFleet();
                fleet.from = this;
                fleet.destination = destination;
                fleet.owner = this.owner;
                fleet.capacity = fleetCapacity;
                fleet.timeToArrive = flyTimeInMillis;
                fleet.flyTime = flyTimeInMillis;
                fleet.timeToStart = -Math.random()*500; // 0-500 ms

                fleets.push(fleet);
            }

            return fleets;
        }

        // @var attack
        visit (shipFleet: SpaceShipFleet){
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
                this.owner = Factories.getNeutralOwner();
            else
                this.owner = shipFleet.owner;

            this.owner.conqueredPlanets++;  // new owner has conquered new planet
        }

        update (delta){
            if(this.owner === Factories.getNeutralOwner()) return;

            this.amountOfShips += (delta/1000)*this.newShipsPerSecond;
            if(this.amountOfShips > this.maximumAmountOfShips) this.amountOfShips = this.maximumAmountOfShips;
        }
    };

    export class NeutralPlanet extends Planet {
        constructor(numberOfShips: number){
            super();

            this.amountOfShips = numberOfShips || 10;
            this.owner = Factories.getNeutralOwner();
        }
    };

    export class NonePlanet extends Planet {
        constructor(){
            super();

            this.amountOfShips = 0;
            this.owner = Factories.getNeutralOwner();
        }

        sendFleets (destination: Planet, flyTimeInMillis:number){
            return [];
        }

        update(delta){}

        visit (shipFleet){}
    };

    // --------------------

    export class SpaceShipFleet {
        // @var flying from planet
        from = Factories.getNonePlanet();
        // @var flying to planet
        destination = Factories.getNonePlanet();

        // @var how many ships this fleet have
        capacity = 0;

        // @var who owns this fleet
        owner = Factories.getNeutralOwner();

        // @var time to land and conquer planet in millisecond
        timeToArrive = Infinity;
        flyTime = Infinity;

        timeToStart = 0;

        init (){
        }

        update(delta){
            if(this.timeToStart < 0 ){
                this.timeToStart += delta;
                return;
            }

            this.timeToArrive -= delta;

            if(this.timeToArrive <= 0){
                this.timeToArrive = 0;
                this.destination.visit(this);
            }
        }
    };
}


