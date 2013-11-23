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

declare var THREE;
class Level {
    model = null;
    asset;

    numberOfPlanets = 15;
    planets = [];
    planetsForRaycaster = [];
    selectedPlanets = [];
    selectedTargetPlanet = null;
    fleets = [];

    player = new GameModel.RealPlayer();
    competitor = new GameModel.AIPlayer();

    gameOver = false;

    constructor(public screen: any, gamel: GameModel.Model, asset : Asset){
        this.model = new GameModel.Model();
        this.asset = asset;
    }

    init (){
        this.model.init();

        var geometry = this.asset.getPlanetGeometry();
        var material = this.asset.getPlanetMaterial(0);
        var materialSelected = this.asset.getPlanetMaterial(0);

        Skybox.init(this.screen.scene);

        var _id = 0;

        for(var i = 0; i < this.numberOfPlanets; i++){
            var r = Math.random() + 0.5;
            var pl = this.model.createAndAddPlanet();
            pl.newShipsPerSecond = r * 2;

            var rand = Math.random();
            if(rand < 0.2){
                pl.owner = this.player;
            }
            else if (rand < 0.4) {
                pl.owner = this.competitor;
            }
            else{
                //pl.amountOfShips = (x % 5) >= 2.5 ? parseInt(x / 5 + "") * 5 + 5 : parseInt(x / 5 + "") * 5;
                pl.amountOfShips = r*30;
            }

            var planetObj3d:any = this.asset.createPlanetMesh(0);

            planetObj3d.position.x = Math.random() * 800 - 400;
            planetObj3d.position.y = Math.random() * 800 - 400;
            planetObj3d.position.z = Math.random() * 800 - 400;

            planetObj3d.scale.multiplyScalar(r);
            planetObj3d.radius = r*60;

            _id++;
            planetObj3d._id = _id;

//            object.castShadow = true;
//            object.receiveShadow = true;

            planetObj3d.planet = pl;
            this.planets.push(planetObj3d);
            this.planetsForRaycaster.push(planetObj3d.planetMesh);
            this.screen.scene.add( planetObj3d );
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

        this.player.fleetsOnWay = 0;
        this.competitor.fleetsOnWay = 0;

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
        if(this.selectedPlanets.length > 0) return;

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
            drawRect(planetRep.label.context, 0, 0, 100, 100, "rgba(0, 0, 0, 0.8)");

            var amountOfShips = planetRep.planet.amountOfShips;

            planetRep.label.context.fillText(Math.round(amountOfShips).toString(), canvas.width / 2, canvas.height / 2);
            planetRep.label.texture.needsUpdate = true;

            planetRep.label.translateOnAxis(this.axis, planetRep.radius + 10);

            if (planetRep.planet.owner == this.player ){
                this.asset.setPlanetMaterial(planetRep, 1);
            }
            else if (planetRep.planet.owner == this.competitor) {
                this.asset.setPlanetMaterial(planetRep, 2);
            }
            else {
                this.asset.setPlanetMaterial(planetRep, 0);
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
            else if('childOfPlanet' in obj && obj.parent !== undefined){
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

            var time = this.getDistance(from, to);

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

    getPlanetById(_id) {
        for (var i = 0, l = this.planets.length; i < l; i++) {
            if (_id == this.planets[i]._id) {
                return this.planets[i];
            }
        }
        return null;
    }

};
