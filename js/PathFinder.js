var PathFinder = (function () {
    function PathFinder(scene) {
        this.scene = scene;
        this.pointsArray = [];
    }
    PathFinder.prototype.initPaths = function () {
        console.log("initPaths");

        for (var i in this.scene.children) {
            for (var j in this.scene.children) {
                if (!(this.scene.children[i] instanceof THREE.Mesh) || !(this.scene.children[j] instanceof THREE.Mesh))
                    continue;

                this.pointsArray.push(findPath(this.scene.children[i], this.scene.children[j]));
            }
        }

        return this.pointsArray;
    };

    PathFinder.prototype.findPath = function (from, to) {
        var points = [];
        points.push(from.position);

        var fromPos = from.position.clone();
        var toNormal = to.position.clone();

        var raycaster = new THREE.Raycaster();
        raycaster.set(fromPos, toNormal.sub(fromPos).normalize());
        var intersects = raycaster.intersectObjects(this.scene.children);

        var i = 0;
        var object;
        var point = new THREE.Vector3();
        var j = 0;

        var okPoint = false;
        var same = false;

        var dist = from.position.distanceTo(to.position);
        var radDist = from.geometry.radius + to.geometry.radius;

        var distance = Infinity;

        var lineVec = new THREE.Vector3();

        while (from.position != to.position && radDist < dist && j < 100) {
            j++;
            i = 0;

            while (i < intersects.length) {
                if (!(intersects[i].object instanceof THREE.Mesh))
                    i++;
else
                    break;
            }

            if (i < intersects.length && intersects[i].object.position != to.position && distance > intersects[i].distance) {
                if (object == intersects[i].object) {
                    same = true;
                }

                object = intersects[i].object;

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

                var hypo = object.geometry.radius * 2;
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
            } else if (i < intersects.length && intersects[i].object.position == to.position) {
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
            intersects = raycaster.intersectObjects(this.scene.children);
        }

        points.push(to.position);

        return points;
    };

    PathFinder.prototype.getPath = function (from, to) {
        for (var i in this.pointsArray) {
            var points = this.pointsArray[i];

            if (points[0] == from && points[points.length - 1] == to)
                return points;
        }

        return null;
    };

    PathFinder.prototype.drawPaths = function () {
        var geometry;
        var line;

        for (var i in this.pointsArray) {
             {
                geometry = new THREE.Geometry();

                for (var j in this.pointsArray[i]) {
                    geometry.vertices.push(this.pointsArray[i][j]);
                }

                line = new THREE.Line(geometry);
                this.scene.add(line);
            }
        }
    };
    return PathFinder;
})();
//# sourceMappingURL=PathFinder.js.map
