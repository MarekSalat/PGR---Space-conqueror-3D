var PathFinder = (function () {
    function PathFinder(planets) {
        this.planets = planets;
        this.pathsArray = [];
    }
    PathFinder.prototype.initPaths = function () {
        console.log("initPaths");
        console.log(this.planets);

        for (var i in this.planets) {
            for (var j in this.planets) {
                //                if (!(this.scene.children[i] instanceof THREE.Object3D) || !(this.scene.children[j] instanceof THREE.Object3D))
                //                    continue;
                var path = new Path();
                path.pointsArray = this.findPath(this.planets[i], this.planets[j]);
                path.computeLengths();

                //                console.log(path);
                this.pathsArray.push(path);
                //                this.pathsArray.push(this.findPath(this.planets[i], this.planets[j]));
            }
        }

        return this.pathsArray;
    };

    PathFinder.prototype.findPath = function (from, to) {
        //        if (typeof from.planetMesh === "undefined" || typeof to.planetMesh === "undefined")
        //            return [];
        var points = [];
        points.push(from.position);

        var fromPos = from.position.clone();
        var toNormal = to.position.clone();

        var raycaster = new THREE.Raycaster();
        raycaster.set(fromPos, toNormal.sub(fromPos).normalize());
        var intersects = raycaster.intersectObjects(this.planets, true);

        var i = 0;
        var object;
        var point = new THREE.Vector3();
        var j = 0;

        var okPoint = false;
        var same = false;

        var dist = from.position.distanceTo(to.position);
        var radDist = from.radius + to.radius;

        var distance = Infinity;

        var lineVec = new THREE.Vector3();

        console.log(intersects);

        while (from.position != to.position && radDist < dist && j < 100) {
            j++;
            i = 0;

            while (i < intersects.length) {
                if (!(intersects[i].object instanceof THREE.Mesh))
                    i++;
else
                    break;
            }

            if (i < intersects.length && intersects[i].object.parent.position != to.position && distance > intersects[i].distance) {
                if (object == intersects[i].object.parent) {
                    same = true;
                }

                object = intersects[i].object.parent;

                lineVec.copy(to.position);
                lineVec.sub(fromPos);

                var startVec = new THREE.Vector3(object.position.x, object.position.y, object.position.z);
                var endVec = new THREE.Vector3(object.position.x, object.position.y, object.position.z);

                startVec.sub(fromPos);
                endVec.sub(to.position);

                var obstruction = startVec;

                var lineAlpha = Math.atan(lineVec.y / lineVec.x);

                var alpha = Math.atan(obstruction.y / obstruction.x);

                lineAlpha = Math.abs(lineAlpha);
                alpha = Math.abs(alpha);

                if (isNaN(alpha))
                    alpha = 0;

                if ((startVec.length() > endVec.length() && alpha < lineAlpha) || (startVec.length() < endVec.length() && alpha > lineAlpha)) {
                    obstruction = endVec;
                    alpha = (Math.atan(obstruction.y / obstruction.x));
                    alpha = Math.abs(alpha);
                }

                if (isNaN(alpha))
                    alpha = 0;

                var hypo = object.radius * 2;
                var opposite = hypo * Math.sin(alpha);
                var adjacent = hypo * Math.cos(alpha);

                if (startVec.x < 0) {
                    //                    opposite *= -1;
                    adjacent *= -1;
                }

                if (startVec.y < 0) {
                    opposite *= -1;
                    //                    adjacent *= -1;
                }

                if (same) {
                    same = false;

                    if (startVec.x > 0 && startVec.y > 0 || startVec.x < 0 && startVec.y < 0) {
                        opposite *= -1;
                        //                        adjacent *= -1;
                    } else {
                        adjacent *= -1;
                    }
                }

                point.x = object.position.x + opposite;
                point.y = object.position.y - adjacent;
                point.z = object.position.z;
            } else if (i < intersects.length && intersects[i].object.parent.position == to.position) {
                break;
            } else {
                okPoint = true;
            }

            if (okPoint) {
                if (typeof point === "undefined")
                    break;
                points.push(point);

                fromPos = point.clone();
                toNormal = to.position.clone();
                okPoint = false;
                distance = Infinity;
                object = null;
            } else {
                toNormal = point.clone();
                distance = fromPos.distanceTo(toNormal);
            }

            raycaster.set(fromPos, toNormal.sub(fromPos).normalize());
            intersects = raycaster.intersectObjects(this.planets, true);
        }

        points.push(to.position);

        console.log(points);
        console.log("-----------------------------------------------------------------");

        return points;
    };

    PathFinder.prototype.getPath = function (from, to) {
        for (var i in this.pathsArray) {
            var path = this.pathsArray[i];

            if (path.pointsArray[0] == from && path.pointsArray[path.pointsArray.length - 1] == to)
                return path;
        }

        return null;
    };

    PathFinder.prototype.drawPaths = function (scene) {
        console.log("drawPaths");

        //        console.log(this.pathsArray);
        var geometry;
        var line;

        for (var i in this.pathsArray) {
            if (this.pathsArray[i].pointsArray.length > 2) {
                geometry = new THREE.Geometry();

                for (var j in this.pathsArray[i].pointsArray) {
                    geometry.vertices.push(this.pathsArray[i].pointsArray[j]);
                }

                line = new THREE.Line(geometry);
                scene.add(line);
            }
        }
    };
    return PathFinder;
})();
//# sourceMappingURL=PathFinder.js.map
