var Level = (function () {
    function Level(screen, gamel) {
        this.screen = screen;
        this.model = null;
        this.asset = null;
        this.numberOfPlanets = 15;
        this.planets = [];
        this.selectedPlanets = [];
        this.selectedTargetPlanet = null;
        this.fleets = [];
        this.player = new GameModel.Player();
        this.competitor = new GameModel.AIPlayer();
        this.AIThread = null;
        this.AISleeperThread = null;
        this.fleetGeometry = null;
        this.fleetMaterial = null;
        this.model = new GameModel.Model();
    }
    Level.prototype.init = function () {
        this.model.init();
        this.initWorkers();

        for (var i = 0; i < this.numberOfPlanets; i++) {
            var geometry = new THREE.SphereGeometry(Math.random() * 60 + 40, 32, 24);
            var pl = this.model.createAndAddPlanet();

            var rand = Math.random();
            if (rand < 0.2) {
                pl.owner = this.player;
            } else if (rand < 0.4) {
                pl.owner = this.competitor;
            }

            var object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: 0xfafafa }));

            object.position.x = Math.random() * 800 - 400;
            object.position.y = Math.random() * 800 - 400;
            object.position.z = Math.random() * 800 - 400;

            object.planet = pl;
            this.planets.push(object);
            this.screen.scene.add(object);
        }
    };

    Level.prototype.update = function (delta) {
        this.model.update(delta);
        this.updateFleets(delta);
        this.updatePlanets(delta);
    };

    Level.prototype.updateFleets = function (delta) {
        if (this.src == null)
            this.src = new THREE.Vector3(0, 0, 0);
        if (this.dst == null)
            this.dst = new THREE.Vector3(0, 0, 0);
        if (this.res == null)
            this.res = new THREE.Vector3(0, 0, 0);

        for (var i in this.fleets) {
            var fleet = this.fleets[i].fleet;

            if (fleet.timeToArrive <= 0) {
                this.screen.scene.remove(this.fleets[i]);
                this.fleets.splice(i, 1);
                continue;
            }
            this.src.copy(this.fleets[i].srcPositon);
            this.dst.copy(this.fleets[i].dstPositon);
            this.res.set(0, 0, 0);

            var t = fleet.timeToArrive / fleet.flyTime;

            this.src.multiplyScalar(t);
            this.dst.multiplyScalar(1 - t);
            this.res.add(this.src);
            this.res.add(this.dst);

            this.fleets[i].position.copy(this.res);
        }
    };

    Level.prototype.updatePlanets = function (delta) {
        for (var i in this.planets) {
            var planetRep = this.planets[i];
            if (planetRep.planet.owner == this.player) {
                planetRep.material.color.setHex(Setting.colors.emerald);
            } else if (planetRep.planet.owner == this.competitor) {
                planetRep.material.color.setHex(Setting.colors.alizarin);
            } else {
                planetRep.material.color.setHex(0xfafafa);
            }
        }
    };

    Level.prototype.onSelectionStart = function (intersectsArray) {
        if ('planet' in intersectsArray[0].object && intersectsArray[0].object.planet.owner == this.player)
            return true;
        return false;
    };

    Level.prototype.onObjectSelected = function (intersectsArray) {
        if (intersectsArray.length == 0) {
            if (this.selectedTargetPlanet != null)
                this.planetUnselected(this.selectedTargetPlanet);
            this.selectedTargetPlanet = null;
            return;
        }

        for (var i in intersectsArray) {
            var obj = intersectsArray[i].object;
            if ('planet' in obj) {
                this.onPlanedSelected(obj);
            }
        }
    };

    Level.prototype.onPlanedSelected = function (planetRep) {
        if (this.selectedPlanets.indexOf(planetRep) >= 0 || this.selectedTargetPlanet == planetRep)
            return;

        this.planetSelected(planetRep);

        if (planetRep.planet.owner != this.player) {
            if (this.selectedTargetPlanet != null)
                this.planetUnselected(this.selectedTargetPlanet);
            this.selectedTargetPlanet = planetRep;
        } else {
            this.selectedPlanets.push(planetRep);
            console.log('Plane ' + planetRep.planet + ' with ' + planetRep.planet.amountOfShips + ' ships');
        }
    };

    Level.prototype.onSelectionFinish = function () {
        for (var i in this.selectedPlanets) {
            this.planetUnselected(this.selectedPlanets[i]);
        }
        if (this.selectedTargetPlanet != null) {
            this.planetUnselected(this.selectedTargetPlanet);

            for (var i in this.selectedPlanets) {
                var from = this.selectedPlanets[i];
                var to = this.selectedTargetPlanet;
                var time = this.getDistance(from, to) * 5;

                var fleets = this.model.sendFleets(from.planet, to.planet, time);
                for (var f in fleets) {
                    var fleet = this.createFleet();

                    fleet.dstPositon = to.position;
                    fleet.srcPositon = from.position.clone();
                    var r = from.geometry.radius / 4;
                    var d = from.geometry.radius / 2;
                    fleet.srcPositon.x += Math.random() * r - d;
                    fleet.srcPositon.y += Math.random() * r - d;
                    fleet.srcPositon.z += Math.random() * r - d;

                    fleet.fleet = fleets[f];
                    this.screen.scene.add(fleet);
                    this.fleets.push(fleet);
                }
            }
        }
        this.selectedTargetPlanet = null;
        this.selectedPlanets = [];

        console.log(fleets);
    };

    Level.prototype.createFleet = function () {
        if (this.fleetGeometry == null)
            this.fleetGeometry = new THREE.SphereGeometry(10, 12, 8);
        if (this.fleetMaterial == null)
            this.fleetMaterial = new THREE.MeshLambertMaterial({ color: 0x0000ff });

        var obj = new THREE.Mesh(this.fleetGeometry, this.fleetMaterial);
        return obj;
    };

    Level.prototype.planetSelected = function (planetRep) {
        planetRep.currentHex = planetRep.material.emissive.getHex();

        if (planetRep.planet.owner != this.player) {
            planetRep.material.emissive.setHex(0xff0000);
        } else {
            planetRep.material.emissive.setHex(0x00ff00);
        }
    };

    Level.prototype.planetUnselected = function (planetRep) {
        planetRep.material.emissive.setHex(planetRep.currentHex);
    };

    //@todo: vrati three.js path k planete
    Level.prototype.getPath = function (planetA, planetB) {
        throw { message: "unimplemented" };
    };

    Level.prototype.getDistance = function (planetA, planetB) {
        var aidx = this.planets.indexOf(planetA);
        var bidx = this.planets.indexOf(planetB);
        if (aidx < 0 || bidx < 0)
            return Infinity;

        return this.planets[aidx].position.distanceTo(this.planets[bidx].position);
    };

    Level.prototype.getPlanetById = function (id) {
        for (var i = 0, l = this.planets.length; i < l; i++) {
            if (id == this.planets[i].id) {
                return this.planets[i];
            }
        }
        return null;
    };

    /*///////////////////////////////////////////////////////////////////////*/
    /* AI threads */
    /*///////////////////////////////////////////////////////////////////////*/
    Level.prototype.initWorkers = function () {
        var AIworker = new Worker('js/AIWorker.js');
        this.AIThread = AIworker;
        var AISleeperWorker = new Worker('js/AISleeperWorker.js');
        this.AISleeperThread = AISleeperWorker;

        this.AIEventListener = (function (__this) {
            return function (event) {
                __this.AIEventHandler(event);
            };
        })(this);
        this.AISleeperEventListener = (function (__this) {
            return function (event) {
                __this.AISleeperEventHandler(event);
            };
        })(this);

        this.AIThread.onmessage = this.AIEventListener;
        this.AISleeperThread.onmessage = this.AISleeperEventListener;
    };

    Level.prototype.AIEventHandler = function (e) {
        if (!(e.data instanceof Object) || !('sourcePlanetIds' in e.data) || !('targetPlanetId' in e.data)) {
            // something what isn't Move has come
            // console.log(e.data);
            this.AIThread.terminate();
            this.AISleeperThread.terminate();
            return;
        }

        //console.log("Move has come from AIWorker");
        var sourcePlanetIds = e.data.sourcePlanetIds;
        var sourcePlanet = null;
        var targetPlanet = this.getPlanetById(e.data.targetPlanetId);

        for (var i = 0, l = sourcePlanetIds.length; i < l; i++) {
            sourcePlanet = this.getPlanetById(sourcePlanetIds[i]);

            // TODO: shouldn't be "fleet creation" in level methods?
            // create fleet and send it
            var from = sourcePlanet;
            var to = targetPlanet;
            var time = this.getDistance(from, to) * 5;

            var fleets = this.model.sendFleets(from.planet, to.planet, time);
            for (var f in fleets) {
                var fleet = this.createFleet();

                fleet.dstPositon = to.position;
                fleet.srcPositon = from.position.clone();
                var r = from.geometry.radius / 4;
                var d = from.geometry.radius / 2;
                fleet.srcPositon.x += Math.random() * r - d;
                fleet.srcPositon.y += Math.random() * r - d;
                fleet.srcPositon.z += Math.random() * r - d;

                //fleet.position.copy(fleet.srcPositon);
                fleet.fleet = fleets[f];
                this.screen.scene.add(fleet);
                this.fleets.push(fleet);
            }
        }

        // TODO: mayby AI should calculate sleeping time
        // TODO: also game difficulty parameter should manipulate with AI sleeping time
        this.AISleeperRun(3000);
    };

    Level.prototype.AISleeperEventHandler = function (e) {
        // console.log(e.data);
        this.AIRun();
    };

    Level.prototype.AIRun = function () {
        var planets = [];

        for (var i in this.planets) {
            var planet = {};
            planet['position'] = this.planets[i].position;
            planet['id'] = this.planets[i].id;
            planet['planet'] = {};
            planet['planet']['amountOfShips'] = this.planets[i].planet.amountOfShips;
            planet['planet']['owner'] = this.planets[i].planet.owner;

            planets.push(planet);
        }

        var message = {
            'planets': planets,
            'player': this.competitor
        };

        // console.log(message);
        /*
        var ai = new AI();
        ai.init(this.competitor, planets);
        console.log(ai.getAIMove());
        */
        this.AIThread.postMessage(message);
    };

    Level.prototype.AISleeperRun = function (sleepTime) {
        var message = { 'sleepTime': sleepTime };
        this.AISleeperThread.postMessage(message);
    };
    return Level;
})();
;
//# sourceMappingURL=Level.js.map
