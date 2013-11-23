var Asset = (function () {
    function Asset() {
        this.planetMaterial = [];
        this.planetGlowMaterial = [];
        this.planetSelectedGlowMaterial = [];
        this.shiptMesh = [];
        this.textureFlare = [];
    }
    Asset.prototype.init = function () {
        this.planetGeometry = new THREE.SphereGeometry(42, 32, 24);
        this.planetMaterial[0] = new THREE.MeshLambertMaterial({ color: 0xfafafa });

        this.planetMaterial[1] = new THREE.MeshLambertMaterial({ color: Setting.colors.emerald });
        this.planetMaterial[2] = new THREE.MeshLambertMaterial({ color: Setting.colors.alizarin });

        this.planetGlowMaterial[0] = this.createShaderMaterial();
        this.planetGlowMaterial[1] = this.createShaderMaterial(1.0, 3.0, Setting.colors.emerald);
        this.planetGlowMaterial[2] = this.createShaderMaterial(1.0, 3.0, Setting.colors.alizarin);

        this.planetSelectedGlowMaterial[0] = this.createShaderMaterial();
        this.planetSelectedGlowMaterial[1] = this.createShaderMaterial(1.0, 0.5, Setting.colors.emerald);
        this.planetSelectedGlowMaterial[2] = this.createShaderMaterial(1.0, 0.5, Setting.colors.alizarin);

        var loader = new THREE.JSONLoader();
        loader.load('../asset/ship.js', (function (__this) {
            return function (geometry) {
                //geometry.applyMatrix( new THREE.Matrix4().makeRotationZ( Math.PI / 2 ) );
                __this.shiptGeometry = geometry;
                __this.shipMaterial = new THREE.MeshLambertMaterial({ color: 0xfafafa });

                var shipGlowMesh;

                __this.shiptMesh[0] = null;

                __this.shiptMesh[1] = new THREE.Object3D();
                shipGlowMesh = new THREE.Mesh(__this.shiptGeometry, __this.createShaderMaterial(1.0, 3.0, Setting.colors.emerald));
                shipGlowMesh.scale.multiplyScalar(1.2);
                __this.shiptMesh[1].add(shipGlowMesh);
                __this.shiptMesh[1].add(new THREE.Mesh(__this.shiptGeometry, __this.shipMaterial));

                __this.shiptMesh[2] = new THREE.Object3D();
                shipGlowMesh = new THREE.Mesh(__this.shiptGeometry, __this.createShaderMaterial(1.0, 3.0, Setting.colors.alizarin));
                shipGlowMesh.scale.multiplyScalar(1.2);
                __this.shiptMesh[2].add(shipGlowMesh);
                __this.shiptMesh[2].add(new THREE.Mesh(__this.shiptGeometry, __this.shipMaterial));

                console.log("ship loaded");
            };
        })(this));
    };

    Asset.prototype.createShaderMaterial = function (c, p, colorHex) {
        if (typeof c === "undefined") { c = 1.0; }
        if (typeof p === "undefined") { p = 3.0; }
        if (typeof colorHex === "undefined") { colorHex = 0xffff00; }
        return new THREE.ShaderMaterial({
            uniforms: {
                "c": { type: "f", value: c },
                "p": { type: "f", value: p },
                glowColor: { type: "c", value: new THREE.Color(colorHex) },
                viewVector: { type: "v3", value: _game.screen.camera.position }
            },
            vertexShader: [
                "uniform vec3 viewVector;" + "uniform float c;" + "uniform float p;" + "varying float intensity;" + "void main()" + "{" + "    vec3 vNormal = normalize( normalMatrix * normal );" + "    vec3 vNormel = normalize( normalMatrix * viewVector );" + "    intensity = pow( c - dot(vNormal, vNormel), p );" + "" + "    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );" + "}"
            ].join("\n"),
            fragmentShader: [
                "uniform vec3 glowColor;" + "varying float intensity;" + "void main()" + "{" + "    vec3 glow = glowColor * intensity;" + "    gl_FragColor = vec4( glow, 1.0 );" + "}"
            ].join("\n"),
            side: THREE.FrontSide,
            blending: THREE.AdditiveBlending,
            transparent: true
        });
    };

    Asset.prototype.createPlanetMesh = function (playerID) {
        var group = new THREE.Object3D();

        var planetMesh = new THREE.Mesh(this.getPlanetGeometry(), this.getPlanetMaterial(playerID));
        planetMesh.childOfPlanet = true;

        var glowMesh = new THREE.Mesh(this.getPlanetGeometry(), this.planetGlowMaterial[playerID]);
        glowMesh.childOfPlanet = true;
        glowMesh.scale.multiplyScalar(1.2);
        group.add(planetMesh);
        if (playerID > 0)
            group.add(glowMesh);

        var spritey = makeTextSprite("0000", { fontsize: 35, borderColor: { r: 0, g: 0, b: 0, a: 1.0 }, backgroundColor: { r: 0, g: 0, b: 0, a: 0.8 } });
        spritey.position.set(0, 0, 0);
        spritey.childOfPlanet = true;
        group.add(spritey);

        group.glowMesh = glowMesh;
        group.planetMesh = planetMesh;
        group.id = playerID;
        group.label = spritey;

        return group;
    };

    Asset.prototype.getPlanetGeometry = function () {
        return this.planetGeometry;
    };

    Asset.prototype.getPlanetMaterial = function (playerID) {
        return this.planetMaterial[playerID];
    };

    Asset.prototype.setPlanetMaterial = function (planet, playerID) {
        planet.glowMesh.material = this.planetGlowMaterial[playerID];

        if (playerID > 0)
            planet.add(planet.glowMesh);
        if (playerID == 0 && planet.playerID > 0)
            planet.remove(planet.glowMesh);

        planet.id = playerID;
    };

    Asset.prototype.makePlanetSelected = function (planet) {
        if (!("glowMesh" in planet)) {
            console.log("Planet does not have glow mesh, I do not know how to select it.");
            console.log(planet);
            return;
        }
        ;

        planet.glowMesh.oldMaterial = planet.glowMesh.material;
        planet.glowMesh.material = this.planetSelectedGlowMaterial[planet.id];

        if (planet.id == 0)
            planet.add(planet.glowMesh);
    };

    Asset.prototype.makePlanetUnselected = function (planet) {
        console.log(planet);

        if (planet == undefined) {
            return;
        }
        planet.glowMesh.material = planet.glowMesh.oldMaterial;

        if (planet.id == 0)
            planet.remove(planet.glowMesh);
    };

    Asset.prototype.getFlareTextures = function () {
        if (this.textureFlare.length <= 0) {
            this.textureFlare[0] = THREE.ImageUtils.loadTexture("../asset/lensflare0.png");
            this.textureFlare[1] = THREE.ImageUtils.loadTexture("../asset/lensflare2.png");
            this.textureFlare[2] = THREE.ImageUtils.loadTexture("../asset/lensflare3.png");
        }

        return this.textureFlare;
    };

    Asset.prototype.createShipMesh = function (playerID) {
        return this.shiptMesh[playerID].clone();
    };
    return Asset;
})();
;

function makeTextSprite(message, parameters) {
    if (parameters === undefined)
        parameters = {};

    var fontface = parameters.hasOwnProperty("fontface") ? parameters["fontface"] : "Arial";

    var fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 18;

    var borderThickness = parameters.hasOwnProperty("borderThickness") ? parameters["borderThickness"] : 4;

    var borderColor = parameters.hasOwnProperty("borderColor") ? parameters["borderColor"] : { r: 0, g: 0, b: 0, a: 1.0 };

    var backgroundColor = parameters.hasOwnProperty("backgroundColor") ? parameters["backgroundColor"] : { r: 0, g: 0, b: 0, a: 1.0 };

    var spriteAlignment = THREE.SpriteAlignment.topLeft;

    var canvas = document.createElement('canvas');

    var context = canvas.getContext('2d');
    context.font = "Bold " + fontsize + "px " + fontface;

    // get size data (height depends only on font size)
    var metrics = context.measureText(message);
    var textWidth = metrics.width;
    canvas.width = textWidth;
    canvas.height = fontsize;

    var context = canvas.getContext('2d');
    context.font = "Bold " + fontsize + "px " + fontface;

    context.textAlign = "center";
    context.textBaseline = "middle";

    // background color
    context.fillStyle = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," + backgroundColor.b + "," + backgroundColor.a + ")";

    // border color
    context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," + borderColor.b + "," + borderColor.a + ")";

    context.lineWidth = borderThickness;

    // text color
    var c = Setting.colors.wisteria.toString();
    context.fillStyle = "rgba(255, 255, 255, 1.0)";

    // context.fillText( message, borderThickness, fontsize + borderThickness);
    context.fillText(message, canvas.width / 2, canvas.height / 2);

    // canvas contents will be used for a texture
    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    //    texture.onUpdate = function(){
    //        console.log("texture update");
    //    };
    var spriteMaterial = new THREE.SpriteMaterial({ map: texture, useScreenCoordinates: false, alignment: spriteAlignment });

    var sprite = new THREE.Sprite(spriteMaterial);

    sprite.scale.set(30, 30, 1.0);

    sprite.canvas = canvas;
    sprite.context = context;
    sprite.texture = texture;

    return sprite;
}

function drawRect(contex, x, y, w, h, color) {
    contex.beginPath();
    contex.rect(x, y, w, h);

    var colorInContext = contex.fillStyle;
    contex.fillStyle = color;
    contex.fill();
    contex.fillStyle = colorInContext;
}

// @todo: loader bude mit stejne api jako three.js loader at v tom nemame bordel
var AssetLoader = (function () {
    function AssetLoader() {
    }
    AssetLoader.prototype.load = function (callbackFinished, callbackProgress) {
        var asset = new Asset();

        // ----
        callbackProgress(100);
        callbackFinished(asset);
    };
    return AssetLoader;
})();
;
//# sourceMappingURL=Asset.js.map
