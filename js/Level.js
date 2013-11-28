var Level = (function () {
    function Level(screen, gamel, asset) {
        this.screen = screen;
        this.model = null;
        this.planets = [];
        this.planetsForRaycaster = [];
        this.selectedPlanets = [];
        this.selectedTargetPlanet = null;
        this.fleets = [];
        this.player = new GameModel.RealPlayer();
        this.competitor = new GameModel.AIPlayer();
        this.gameOver = false;
        this.playerWin = false;
        this.axis = new THREE.Vector3();
        this.model = new GameModel.Model();
        this.asset = asset;
    }
    Level.prototype.init = function () {
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

        this.player.fleetsOnWay = 0;
        this.competitor.fleetsOnWay = 0;

        for (var i in this.fleets) {
            var fleet = this.fleets[i].fleet;

            if (fleet.timeToArrive <= 0) {
                this.screen.scene.remove(this.fleets[i]);
                this.fleets.splice(i, 1);
                continue;
            }

            var t = 1 - fleet.timeToArrive / fleet.flyTime;

            if (t > this.fleets[i].path.lengthsArray[this.fleets[i].index + 1]) {
                this.fleets[i].index++;
            }

            var t2 = (t - this.fleets[i].path.lengthsArray[this.fleets[i].index]) / (this.fleets[i].path.lengthsArray[this.fleets[i].index + 1] - this.fleets[i].path.lengthsArray[this.fleets[i].index]);

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
            } else if (fleet.owner.type == GameModel.PlayerType.PLAYER) {
                this.player.fleetsOnWay++;
            }
        }
    };

    Level.prototype.updatePlanets = function (delta) {
        if (this.selectedPlanets.length > 0)
            return;

        this.player.planetsOwned = 0;
        this.competitor.planetsOwned = 0;

        for (var i in this.planets) {
            var planetRep = this.planets[i];

            planetRep.label.position.set(0, 0, 0);

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

            if (planetRep.planet.owner == this.player) {
                this.asset.setPlanetMaterial(planetRep, 1);
            } else if (planetRep.planet.owner == this.competitor) {
                this.asset.setPlanetMaterial(planetRep, 2);
            } else {
                this.asset.setPlanetMaterial(planetRep, 0);
            }

            if (planetRep.planet.owner.type == GameModel.PlayerType.BOOT) {
                this.competitor.planetsOwned++;
            } else if (planetRep.planet.owner.type == GameModel.PlayerType.PLAYER) {
                this.player.planetsOwned++;
            }
        }
    };

    Level.prototype.onSelectionStart = function (intersectsArray) {
        console.log(intersectsArray);

        var tmp = intersectsArray[0];
        if ('planet' in tmp.object && tmp.object.planet.owner == this.player)
            return true;
else if ('childOfPlanet' in tmp.object && tmp.object.parent.planet.owner == this.player)
            return true;
        return false;
    };

    Level.prototype.onObjectSelected = function (intersectsArray) {
        if (intersectsArray.length == 0) {
            if (this.selectedTargetPlanet !== null)
                this.planetUnselected(this.selectedTargetPlanet);
            this.selectedTargetPlanet = null;
            return;
        }

        for (var i in intersectsArray) {
            var obj = intersectsArray[i].object;
            if ('planet' in obj) {
                this.onPlanetSelected(obj);
            } else if ('childOfPlanet' in obj && obj.parent !== undefined) {
                this.onPlanetSelected(obj.parent);
            }
        }
    };

    Level.prototype.onPlanetSelected = function (planetRep) {
        if (this.selectedTargetPlanet === planetRep || this.selectedPlanets.indexOf(planetRep) >= 0)
            return;

        this.planetSelected(planetRep);

        if (planetRep.planet.owner != this.player) {
            if (this.selectedTargetPlanet != null && this.selectedTargetPlanet.planet.owner != this.player)
                this.planetUnselected(this.selectedTargetPlanet);
            this.selectedTargetPlanet = planetRep;
        } else {
            this.selectedPlanets.push(planetRep);
            console.log('Plane ' + planetRep.planet + ' with ' + planetRep.planet.amountOfShips + ' ships');
        }
    };

    Level.prototype.onSelectionFinish = function (intersectsArray) {
        console.log("onSelectionFinish intersectsArray.lenght = " + intersectsArray.length + ' target ' + this.selectedTargetPlanet);
        console.log(intersectsArray);
        if (this.selectedTargetPlanet == null && intersectsArray.length > 0) {
            for (var i in intersectsArray) {
                var target = intersectsArray[i].object;

                if ("planet" in target) {
                    this.selectedTargetPlanet = target;
                    break;
                } else if ('childOfPlanet' in target) {
                    this.selectedTargetPlanet = target.parent;
                    break;
                }
            }
        }

        if (this.selectedTargetPlanet != null) {
            this.sendFleets(this.selectedPlanets, this.selectedTargetPlanet);
            this.planetUnselected(this.selectedTargetPlanet);
        }

        for (var i in this.selectedPlanets) {
            var from = this.selectedPlanets[i];
            if (from === this.selectedTargetPlanet)
                continue;
            this.planetUnselected(from);
        }

        this.selectedTargetPlanet = null;
        this.selectedPlanets = [];
    };

    Level.prototype.sendFleets = function (fromPlanets, toPlanet) {
        for (var i in fromPlanets) {
            var from = fromPlanets[i];
            var to = toPlanet;
            if (from === to)
                continue;

            var time = this.getDistance(from, to);

            var fleets = this.model.sendFleets(from.planet, to.planet, time);
            for (var f in fleets) {
                var fleet = this.asset.createShipMesh(from.planet.owner == this.player ? 1 : 2);

                fleet.dstPositon = to.position;
                fleet.srcPositon = from.position.clone();

                fleet.radius = from.radius < to.radius ? from.radius : to.radius;
                fleet.radius /= 4;

                fleet.path = this.pathFinder.getPath(from.position, to.position);
                fleet.index = 0;

                var r = from.radius / 4;
                var d = from.radius / 2;
                var x = Math.random() * d - r;
                var y = Math.random() * d - r;
                var z = Math.random() * d - r;

                fleet.trans = new THREE.Vector3(x, y, z).normalize();
                console.log(fleet.radius);

                fleet.translateOnAxis(fleet.trans, fleet.radius);

                fleet.fleet = fleets[f];
                this.screen.scene.add(fleet);

                this.fleets.push(fleet);
            }
        }
    };

    Level.prototype.planetSelected = function (planetRep) {
        this.asset.makePlanetSelected(planetRep);
    };

    Level.prototype.planetUnselected = function (planetRep) {
        this.asset.makePlanetUnselected(planetRep);
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

    Level.prototype.getPlanetById = function (_id) {
        for (var i = 0, l = this.planets.length; i < l; i++) {
            if (_id == this.planets[i]._id) {
                return this.planets[i];
            }
        }
        return null;
    };
    return Level;
})();
;
//# sourceMappingURL=Level.js.map
