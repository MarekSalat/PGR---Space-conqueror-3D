/**
 * Created with JetBrains PhpStorm.
 * User: Marek
 * Date: 18.10.13
 * Time: 20:04
 * To change this template use File | Settings | File Templates.
 */

//@todo: jeste je to treba promyslet. ale meli by mu stacit objetky planet a nejaka tovarna na vytvoreni flotily
var Level = Level || function(screen, game) {
    this.screen = screen;
    this.game = game;

    this.model = new GameModel();
    this.asset = null;

    this.numberOfPlanets = 15;
    this.planets = [];
    this.selectedPlanets = [];
    this.selectedTargetPlanet = null;
    this.fleets = [];

    this.player = new GameModel.Player();
    this.competitor = new GameModel.Player();

    this.init = function (){
        this.model.init();

        //var geometry = new THREE.CubeGeometry( 60, 60, 60 );

        for(var i = 0; i < this.numberOfPlanets; i++){
            var geometry = new THREE.SphereGeometry( Math.random()*60 + 40, 16, 8 );
            var pl = this.model.createAndAddPlanet();

            var rand = Math.random();
            var _color = 0xfafafa;
            if(rand < 0.2){
                pl.owner = this.player;
                _color = Setting.colors.emerald;
            }
            else if (rand < 0.4) {
                pl.owner = this.competitor;
                _color = Setting.colors.alizarin;
            }

            var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color:  _color} ) );

            object.position.x = Math.random() * 800 - 400;
            object.position.y = Math.random() * 800 - 400;
            object.position.z = Math.random() * 800 - 400;

            object.planet = pl;
            this.planets.push(object);
            this.screen.scene.add( object );
        }
    };

    this.update = function (delta){
        this.model.update(delta);
    };

    this.onSelectionStart = function (intersectsArray){
        if (intersectsArray[0].object.planet.owner == this.player)
            return true;
        return false;
    };

    this.onObjectSelected = function (intersectsArray){
        if(intersectsArray.length == 0 ){
            if(this.selectedTargetPlanet != null) this.planetUnselected(this.selectedTargetPlanet);
            this.selectedTargetPlanet = null;
            return;
        }

        for(var i in intersectsArray){
            var obj = intersectsArray[i].object;
            if(obj.hasOwnProperty('planet')){
                this.onPlanedSelected(obj);
            }
        }
    };

    this.onPlanedSelected = function (planetRep) {
        if(this.selectedPlanets.indexOf(planetRep) >= 0 || this.selectedTargetPlanet == planetRep) return;

        this.planetSelected(planetRep);

        if (planetRep.planet.owner != this.player ){
            if(this.selectedTargetPlanet != null) this.planetUnselected(this.selectedTargetPlanet);
            this.selectedTargetPlanet = planetRep;
        }
        else{
            this.selectedPlanets.push(planetRep);
        }

    };

    this.onSelectionFinish = function (){
        for(var i in this.selectedPlanets){
            this.planetUnselected( this.selectedPlanets[i] );
        }
        if(this.selectedTargetPlanet != null){
            this.planetUnselected(this.selectedTargetPlanet);

            // create fleet and send it
            for(var i in this.selectedPlanets){
                var from = this.selectedPlanets[i];
                var to = this.selectedTargetPlanet;
                var time = this.getDistance(from, to);
                this.model.sendFleets(from.planet, to.planet, time);

                console.log('fleet sent from ' + from.planet + ' to ' + to.planet + '. time to arrive ' + time);
            }
        }
        this.selectedTargetPlanet = null;
        this.selectedPlanets = [];
    };

    this.planetSelected = function (planetRep){
        planetRep.currentHex = planetRep.material.emissive.getHex();

        if (planetRep.planet.owner != this.player ){
            planetRep.material.emissive.setHex( 0x00ff00 );
        }
        else {
            planetRep.material.emissive.setHex( 0xff0000  );
        }
    };

    this.planetUnselected = function (planetRep){
        planetRep.material.emissive.setHex( planetRep.currentHex );
    };

    //@todo: vrati three.js path k planete
    this.getPath = function (planetA, planetB){
        throw {message: "unimplemented"};
    };

    //@todo: vrati jak dlouho se poleti
    this.getDistance = function (planetA, planetB){
        var aidx = this.planets.indexOf(planetA);
        var bidx = this.planets.indexOf(planetB);
        if(aidx < 0 || bidx < 0) return Infinity;

        this.planets[aidx].position.distanceToSquared(this.planets[bidx].position);
    };
};
