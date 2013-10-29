/**
 * Created with JetBrains PhpStorm.
 * User: Marek
 * Date: 18.10.13
 * Time: 20:04
 * To change this template use File | Settings | File Templates.
 */

/// <reference path="Setting.ts" />
/// <reference path="GameModel.ts" />

declare var THREE;
class Level {
    model = null;
    asset = null;

    numberOfPlanets = 15;
    planets = [];
    selectedPlanets = [];
    selectedTargetPlanet = null;
    fleets = [];

    player = new GameModel.Player();
    competitor = new GameModel.Player();

    constructor(public screen: any, gamel: GameModel.Model){
        this.model = new GameModel.Model();
    }

    init (){
        this.model.init();

        //var geometry = new THREE.CubeGeometry( 60, 60, 60 );

        for(var i = 0; i < this.numberOfPlanets; i++){
            var geometry = new THREE.SphereGeometry( Math.random()*60 + 40, 32, 24 );
            var pl = this.model.createAndAddPlanet();

            var rand = Math.random();
            if(rand < 0.2){
                pl.owner = this.player;
            }
            else if (rand < 0.4) {
                pl.owner = this.competitor;
            }

            var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color:  0xfafafa} ) );

            object.position.x = Math.random() * 800 - 400;
            object.position.y = Math.random() * 800 - 400;
            object.position.z = Math.random() * 800 - 400;

            object.planet = pl;
            this.planets.push(object);
            this.screen.scene.add( object );
        }
    }

    private src;
    private dst;
    private res;

    update(delta){
        this.model.update(delta);
        this.updateFleets(delta);
        this.updatePlanets(delta);

    }

    updateFleets(delta){
        if(this.src == null) this.src = new THREE.Vector3(0,0,0);
        if(this.dst == null) this.dst = new THREE.Vector3(0,0,0);
        if(this.res == null) this.res = new THREE.Vector3(0,0,0);

        for(var i in this.fleets){
            var fleet = this.fleets[i].fleet;

            if(fleet.timeToArrive <= 0) {
                this.screen.scene.remove(this.fleets[i]);
                this.fleets.splice(i, 1);
                continue;
            }
            this.src.copy(this.fleets[i].srcPositon);
            this.dst.copy(this.fleets[i].dstPositon);
            this.res.set(0,0,0);

            var t = fleet.timeToArrive / fleet.flyTime;

            this.src.multiplyScalar(t);
            this.dst.multiplyScalar(1-t);
            this.res.add(this.src);
            this.res.add(this.dst);

            this.fleets[i].position.copy(this.res);
        }
    }

    updatePlanets(delta){
        for(var i in this.planets){
            var planetRep = this.planets[i];
            if (planetRep.planet.owner == this.player ){
                planetRep.material.color.setHex(Setting.colors.emerald);
            }
            else if (planetRep.planet.owner == this.competitor) {
                planetRep.material.color.setHex(Setting.colors.alizarin);
            }
            else {
                planetRep.material.color.setHex(0xfafafa);
            }
        }
    }

    onSelectionStart(intersectsArray){
        if ('planet' in intersectsArray[0].object && intersectsArray[0].object.planet.owner == this.player)
            return true;
        return false;
    }

    onObjectSelected(intersectsArray){
        if(intersectsArray.length == 0 ){
            if(this.selectedTargetPlanet != null) this.planetUnselected(this.selectedTargetPlanet);
            this.selectedTargetPlanet = null;
            return;
        }

        for(var i in intersectsArray){
            var obj = intersectsArray[i].object;
            if('planet' in obj){
                this.onPlanedSelected(obj);
            }
        }
    }

    onPlanedSelected(planetRep) {
        if(this.selectedPlanets.indexOf(planetRep) >= 0 || this.selectedTargetPlanet == planetRep) return;

        this.planetSelected(planetRep);

        if (planetRep.planet.owner != this.player ){
            if(this.selectedTargetPlanet != null) this.planetUnselected(this.selectedTargetPlanet);
            this.selectedTargetPlanet = planetRep;
        }
        else{
            this.selectedPlanets.push(planetRep);
            console.log('Plane ' + planetRep.planet + ' with ' + planetRep.planet.amountOfShips + ' ships');
        }

    }

    onSelectionFinish(){
        for(var i in this.selectedPlanets){
            this.planetUnselected( this.selectedPlanets[i] );
        }
        if(this.selectedTargetPlanet != null){
            this.planetUnselected(this.selectedTargetPlanet);

            // create fleet and send it
            for(var i in this.selectedPlanets){
                var from = this.selectedPlanets[i];
                var to = this.selectedTargetPlanet;
                var time = this.getDistance(from, to)*5;

                var fleets = this.model.sendFleets(from.planet, to.planet, time);
                for(var f in fleets){
                    var fleet = this.createFleet();

                    fleet.dstPositon = to.position;
                    fleet.srcPositon = from.position.clone();
                    var r = from.geometry.radius / 4;
                    var d = from.geometry.radius / 2;
                    fleet.srcPositon.x += Math.random()*r - d;
                    fleet.srcPositon.y += Math.random()*r - d;
                    fleet.srcPositon.z += Math.random()*r - d;

                    fleet.fleet = fleets[f];
                    this.screen.scene.add(fleet);
                    this.fleets.push(fleet);
                }
            }
        }
        this.selectedTargetPlanet = null;
        this.selectedPlanets = [];

        console.log(fleets);
    }

    private fleetGeometry = null;
    private fleetMaterial = null;
    createFleet(){
        if(this.fleetGeometry == null) this.fleetGeometry = new THREE.SphereGeometry( 10, 12, 8 );
        if(this.fleetMaterial == null) this.fleetMaterial = new THREE.MeshLambertMaterial( { color:  0x0000ff} );

        var obj = new THREE.Mesh( this.fleetGeometry,  this.fleetMaterial);
        return obj;
    }

    planetSelected(planetRep){
        planetRep.currentHex = planetRep.material.emissive.getHex();

        if (planetRep.planet.owner != this.player ){
            planetRep.material.emissive.setHex( 0xff0000 );
        }
        else {
            planetRep.material.emissive.setHex( 0x00ff00 );
        }
    }

    planetUnselected(planetRep){
        planetRep.material.emissive.setHex( planetRep.currentHex );
    }

    //@todo: vrati three.js path k planete
    getPath(planetA, planetB){
        throw {message: "unimplemented"};
    }

    getDistance(planetA, planetB){
        var aidx = this.planets.indexOf(planetA);
        var bidx = this.planets.indexOf(planetB);
        if(aidx < 0 || bidx < 0) return Infinity;

        return this.planets[aidx].position.distanceTo(this.planets[bidx].position);
    }
};
