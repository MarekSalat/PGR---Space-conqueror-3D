var GameModel = GameModel || function (){

};

GameModel.Player = function(){
    this.TYPE_ENUM = {
        NONE: 0,
        PLAYER: 1,
        BOOT: 2
    };

    // @var current type of player
    this.type = this.TYPE_ENUM.NONE;

    // @var number of conquered planets
    this.conqueredPlanets = 0;
};

GameModel.Planet = function(){
    // @var new ships created per second
    this.newShipsPerSecond = 13;

    // @var current state
    this.numberOfShips = 0;

    // @var how many of ships will take off from this planet in percent
    this.takeoff = 0.5;

    // @var who owns this planet
    this.owner = new GameModel.Player();

    // @var
    this.name = "uknown";
};

GameModel.SpaceShipFleet = function(){
    // @var flying from planet
    this.from = new GameModel.Planet();
    // @var flying to planet
    this.to   = new GameModel.Planet();

    // @var how many ships this fleet have
    this.capacity = 1;

    // @var who owns this fleet
    this.owner = new GameModel.Player();
};

GameModel.SpaceShip = function(){

};

GameModel.addPlanet = function (planet){;
    if(!this.planets){
        this.planets = [];
    }

    this.push(planet);
}



GameModel.Score = function(){
    this.score = 0;
};

console.log( new GameModel.Planet().shipsPerSecond);