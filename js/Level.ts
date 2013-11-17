/**
 * Created with JetBrains PhpStorm.
 * User: Marek
 * Date: 18.10.13
 * Time: 20:04
 * To change this template use File | Settings | File Templates.
 */

/// <reference path="Setting.ts" />
/// <reference path="GameModel.ts" />
/// <reference path="Asset.ts" />

declare var THREE;
class Level {
    model = null;
    asset;

    numberOfPlanets = 15;
    planets = [];
    selectedPlanets = [];
    selectedTargetPlanet = null;
    fleets = [];

    player = new GameModel.Player();
    competitor = new GameModel.AIPlayer();

    constructor(public screen: any, gamel: GameModel.Model, asset : Asset){
        this.model = new GameModel.Model();
        this.asset = asset;
    }

    init (){
        this.model.init();

        var geometry = this.asset.getPlanetGeometry();
        var material = this.asset.getPlanetMaterial(0);
        var materialSelected = this.asset.getPlanetMaterial(0);

        for(var i = 0; i < this.numberOfPlanets; i++){
            var r = Math.random() + 0.5;
            var pl = this.model.createAndAddPlanet();
            pl.newShipsPerSecond = r * 10;

            var rand = Math.random();
            if(rand < 0.2){
                pl.owner = this.player;
            }
            else if (rand < 0.4) {
                pl.owner = this.competitor;
            }

            var object = this.asset.createPlanetMesh(0);

            object.position.x = Math.random() * 800 - 400;
            object.position.y = Math.random() * 800 - 400;
            object.position.z = Math.random() * 800 - 400;

            object.scale.multiplyScalar(r);
            object.radius = r*60;

//            object.castShadow = true;
//            object.receiveShadow = true;

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

            this.fleets[i].lookAt( this.fleets[i].dstPositon );
        }
    }

    updatePlanets(delta){
        if(this.selectedPlanets.length > 0) return;

        for(var i in this.planets){
            var planetRep = this.planets[i];
            if (planetRep.planet.owner == this.player ){
                this.asset.setPlanetMaterial(planetRep, 1);
            }
            else if (planetRep.planet.owner == this.competitor) {
                this.asset.setPlanetMaterial(planetRep, 2);
            }
            else {
                this.asset.setPlanetMaterial(planetRep, 0);
            }
        }
    }

    onSelectionStart(intersectsArray){
        console.log(intersectsArray);

        var tmp = intersectsArray[0];
        if ('planet' in tmp.object && tmp.object.planet.owner == this.player)
            return true;
        else if ('childOfPlanet' in tmp.object && tmp.object.parent.planet.owner == this.player)
            return true;
        return false;
    }

    onObjectSelected(intersectsArray){
        if(intersectsArray.length == 0 ){
            if(this.selectedTargetPlanet !== null )
                this.planetUnselected(this.selectedTargetPlanet);
            this.selectedTargetPlanet = null;
            return;
        }

        for(var i in intersectsArray){
            var obj = intersectsArray[i].object;
            if('planet' in obj){
                this.onPlanetSelected(obj);
            }
            else if('childOfPlanet' in obj){
                this.onPlanetSelected(obj.parent);
            }
        }
    }

    onPlanetSelected(planetRep) {
        if(this.selectedTargetPlanet === planetRep || this.selectedPlanets.indexOf(planetRep) >= 0) return;

        this.planetSelected(planetRep);

        if (planetRep.planet.owner != this.player ){
            if(this.selectedTargetPlanet != null && this.selectedTargetPlanet.planet.owner != this.player)
                this.planetUnselected(this.selectedTargetPlanet);
            this.selectedTargetPlanet = planetRep;
        }
        else{
            this.selectedPlanets.push(planetRep);
            console.log('Plane ' + planetRep.planet + ' with ' + planetRep.planet.amountOfShips + ' ships');
        }

    }

    onSelectionFinish(intersectsArray){
        console.log("onSelectionFinish intersectsArray.lenght = " + intersectsArray.length + ' target ' + this.selectedTargetPlanet);
        if(this.selectedTargetPlanet == null && intersectsArray.length > 0){
            var target:any = intersectsArray[intersectsArray.length-1].object;
            if("planet" in target)
                this.selectedTargetPlanet = target;
            else('childOfPlanet' in target)
                this.selectedTargetPlanet = target.parent;
        }

        if(this.selectedTargetPlanet != null){
            this.sendFleets(this.selectedPlanets, this.selectedTargetPlanet);
            this.planetUnselected(this.selectedTargetPlanet);
        }

        for(var i in this.selectedPlanets){
            var from:any = this.selectedPlanets[i];
            if(from === this.selectedTargetPlanet ) continue;
            this.planetUnselected(from);
        }

        this.selectedTargetPlanet = null;
        this.selectedPlanets = [];
    }

    sendFleets(fromPlanets: Array, toPlanet:any){
        // create fleet and send it
        for(var i in fromPlanets){
            var from:any = fromPlanets[i];
            var to:any = toPlanet;
            if(from === to ) continue;

            var time = this.getDistance(from, to)*5;

            var fleets = this.model.sendFleets(from.planet, to.planet, time);
            for(var f in fleets){
                var fleet = this.asset.createShipMesh(from.planet.owner == this.player ? 1 : 2);

                fleet.dstPositon = to.position;
                fleet.srcPositon = from.position.clone();
                var r = from.radius / 4;
                var d = from.radius / 2;
                fleet.srcPositon.x += Math.random()*r - d;
                fleet.srcPositon.y += Math.random()*r - d;
                fleet.srcPositon.z += Math.random()*r - d;

                fleet.fleet = fleets[f];
                this.screen.scene.add(fleet);

                this.fleets.push(fleet);
            }
        }
    }

    planetSelected(planetRep){
        this.asset.makePlanetSelected(planetRep);
    }

    planetUnselected(planetRep){
        this.asset.makePlanetUnselected(planetRep);
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

    getPlanetById(id) {
        for (var i = 0, l = this.planets.length; i < l; i++) {
            if (id == this.planets[i].id) {
                return this.planets[i];
            }
        }
        return null;
    }

};
