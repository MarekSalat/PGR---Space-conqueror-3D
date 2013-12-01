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
/// <reference path="Skybox.ts" />
/// <reference path="PathFinder.ts" />

declare var THREE;
class Level {
    model = null;
    asset;

    planets = [];
    planetsForRaycaster = [];
    selectedPlanets = [];
    selectedTargetPlanet = null;
    fleets = [];

    player = new GameModel.RealPlayer();
    competitor = new GameModel.AIPlayer();

    gameOver = false;
    playerWin = false;

    public pathFinder;

    constructor(public screen: any, gamel: GameModel.Model, asset : Asset) {
        this.model = new GameModel.Model();
        this.asset = asset;
    }

    init() {

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

        this.player.fleetsOnWay = 0;
        this.competitor.fleetsOnWay = 0;

        for(var i in this.fleets){
            var fleet = this.fleets[i].fleet;

            if(fleet.timeToArrive <= 0) {
                this.screen.scene.remove(this.fleets[i]);
                this.fleets.splice(i, 1);
                continue;
            }

            var t = 1 - fleet.timeToArrive / fleet.flyTime;

            if (t > this.fleets[i].path.lengthsArray[this.fleets[i].index + 1])
            {
                this.fleets[i].index++;
            }

            var t2 = (t - this.fleets[i].path.lengthsArray[this.fleets[i].index])
                / (this.fleets[i].path.lengthsArray[this.fleets[i].index + 1]
                - this.fleets[i].path.lengthsArray[this.fleets[i].index]);

//            if (i == 0)
//            {
//                console.log("t: " + t + " " + (1 - t) + " t2: " + t2 + " " + (1 - t2));
//                console.log("lengthsArray: " + this.fleets[i].path.lengthsArray[this.fleets[i].index]);
//                console.log("lengthsArray + 1: " + this.fleets[i].path.lengthsArray[this.fleets[i].index + 1]);
//                console.log("index: " + this.fleets[i].index);
//            }

            this.src.copy(this.fleets[i].path.pointsArray[this.fleets[i].index]);
            this.dst.copy(this.fleets[i].path.pointsArray[this.fleets[i].index + 1]);

//            this.src.copy(this.fleets[i].srcPositon);
//            this.dst.copy(this.fleets[i].dstPositon);

            this.res.set(0, 0, 0);

            this.src.multiplyScalar(1 - t2);
            this.dst.multiplyScalar(t2);
            this.res.add(this.src);
            this.res.add(this.dst);

            this.fleets[i].position.copy(this.res);

            this.fleets[i].lookAt(this.fleets[i].path.pointsArray[this.fleets[i].index + 1]);

            this.fleets[i].translateOnAxis(this.fleets[i].trans, this.fleets[i].radius);


            if (fleet.owner.type == GameModel.PlayerType.BOOT) {
                this.competitor.fleetsOnWay++;
            }
            else if (fleet.owner.type == GameModel.PlayerType.PLAYER) {
                this.player.fleetsOnWay++;
            }
        }
    }

    axis = new THREE.Vector3();
    updatePlanets(delta){
        // if(this.selectedPlanets.length > 0) return;

        this.player.planetsOwned = 0;
        this.competitor.planetsOwned = 0;

        for(var i in this.planets){
            var planetRep = this.planets[i];

            planetRep.label.position.set(0,0,0);
            //planetObj3d.label.translateOnAxis( new THREE.Vector3(0,0,1), planetObj3d.radius/2 + 20);
            this.axis.copy(this.screen.camera.position);
            this.axis.sub(planetRep.position);
            this.axis.normalize();

            var canvas = planetRep.label.canvas;
            planetRep.label.context.clearRect(0, 0, canvas.width, canvas.height);
            drawRect(planetRep.label.context, 0, 0, canvas.width, canvas.height, "rgba(0, 0, 0, 0.8)");

            var amountOfShips = planetRep.planet.amountOfShips;

            planetRep.label.context.fillText(Math.round(amountOfShips).toString(), canvas.width / 2, canvas.height / 2);
            planetRep.label.texture.needsUpdate = true;

            planetRep.label.translateOnAxis(this.axis, planetRep.radius + 10);


            if ( this.selectedPlanets.indexOf(planetRep) == -1 && this.selectedTargetPlanet !== planetRep ) {
                // not selected planets - let's set ordinary material

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
            else {
                // selected planets, but may have changed theirs owner - so let's check owner
                var index = this.selectedPlanets.indexOf(planetRep);
                if (~index && planetRep.planet.owner != this.player) {
                    this.planetUnselected(planetRep);
                    this.selectedPlanets.splice(index, 1);
                }
                else if (this.selectedTargetPlanet === planetRep && planetRep.planet.owner == this.player) {
                    this.planetUnselected(planetRep);
                    this.selectedTargetPlanet = null;
                }
            }

            if (planetRep.planet.owner.type == GameModel.PlayerType.BOOT) {
                this.competitor.planetsOwned++;
            }
            else if (planetRep.planet.owner.type == GameModel.PlayerType.PLAYER) {
                this.player.planetsOwned++;
            }
        }
    }

    onSelectionStart(intersectsArray){
//        console.log(intersectsArray);

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
            else if('childOfPlanet' in obj && obj.parent !== undefined){
                this.onPlanetSelected(obj.parent);
            }
        }
    }

    onPlanetSelected(planetRep) {
        if (this.selectedTargetPlanet === planetRep) {
            return;
        }
        else if (this.selectedPlanets.indexOf(planetRep) >= 0) {
            this.planetUnselected(this.selectedTargetPlanet);
            this.selectedTargetPlanet = null;
            return;
        }

        console.log("planet selected");
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
//        console.log(intersectsArray);
        if(this.selectedTargetPlanet == null && intersectsArray.length > 0){
            for(var i in intersectsArray){
                var target:any = intersectsArray[i].object;

                if("planet" in target)
                {
                    this.selectedTargetPlanet = target;
                    break;
                }
                else if('childOfPlanet' in target)
                {
                    this.selectedTargetPlanet = target.parent;
                    break;
                }
            }
        }

        if(this.selectedTargetPlanet != null){

            var playerSelectedPlanets = [];
            for (var i in this.selectedPlanets) {
//                console.log(this.selectedPlanets[i]);
                if (this.selectedPlanets[i].planet.owner == this.player) {
                    playerSelectedPlanets.push(this.selectedPlanets[i]);
                }
                else {
                    this.planetUnselected(this.selectedPlanets[i]);
                }
            }
            this.selectedPlanets = playerSelectedPlanets;

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

            var time = this.getDistance(from, to);

            var fleets = this.model.sendFleets(from.planet, to.planet, time);
            for(var f in fleets){
                var fleet = this.asset.createShipMesh(from.planet.owner == this.player ? 1 : 2);

                fleet.dstPositon =  to.position;
                fleet.srcPositon = from.position.clone();

                fleet.radius = from.radius < to.radius ? from.radius : to.radius;
                fleet.radius /= 4;

                fleet.path = this.pathFinder.getPath(from.position, to.position);
                fleet.index = 0;

                var r = from.radius / 4;
                var d = from.radius / 2;
                var x = Math.random()*d - r;
                var y = Math.random()*d - r;
                var z = Math.random()*d - r;

                fleet.trans = new THREE.Vector3(x, y, z).normalize();
                //console.log(fleet.radius);

                fleet.translateOnAxis(fleet.trans, fleet.radius);

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

    getPlanetById(_id) {
        for (var i = 0, l = this.planets.length; i < l; i++) {
            if (_id == this.planets[i]._id) {
                return this.planets[i];
            }
        }
        return null;
    }

};
