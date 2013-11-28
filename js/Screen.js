var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var GameScreen = (function () {
    function GameScreen() {
        console.log("Screen construct");
    }
    GameScreen.prototype.init = function () {
        console.log("Screen init");
    };

    GameScreen.prototype.update = function (delta) {
    };

    GameScreen.prototype.render = function (delta) {
    };
    return GameScreen;
})();
;

var Game3DScreen = (function (_super) {
    __extends(Game3DScreen, _super);
    function Game3DScreen() {
        _super.call(this);
        console.log("Game3DScreen construct");
        this.asset = new Asset();
    }
    Game3DScreen.prototype.onWindowResize = function () {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.controls.handleResize();

        this.renderer.setSize(window.innerWidth, window.innerHeight);
    };

    Game3DScreen.prototype.init = function () {
        _super.prototype.init.call(this);
        console.log("Game3DScreen init");

        // Camera initialization
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
        this.camera.position.z = 2500;

        this.asset.init();

        // Scene initialization
        this.scene = new THREE.Scene();

        var light = new THREE.DirectionalLight(0xffffff);
        light.position.set(0, 5000, 0);
        light.target.position.set(0, 0, 0);
        light.castShadow = true;
        light.shadowDarkness = 0.5;

        //light.shadowCameraVisible = true; // only for debugging
        // these six values define the boundaries of the yellow box seen above
        light.shadowCameraNear = 4500;
        light.shadowCameraFar = 5500;
        light.shadowCameraLeft = -500;
        light.shadowCameraRight = 500;
        light.shadowCameraTop = 500;
        light.shadowCameraBottom = -500;
        this.scene.add(light);

        var ambient = new THREE.AmbientLight(0xffffff);
        ambient.color.setHSL(0.1, 0.3, 0.05);
        this.scene.add(ambient);

        var dirLight = new THREE.DirectionalLight(0xffffff, 0.125);
        dirLight.position.set(0, -1, 0).normalize();
        this.scene.add(dirLight);

        dirLight.color.setHSL(0.1, 0.7, 0.5);

        this.addLight(0.995, 0.5, 0.9, 0, 2000, 0);

        //Projector and raycaster initialization
        this.projector = new THREE.Projector();
        this.raycaster = new THREE.Raycaster();

        if (window.WebGLRenderingContext)
            this.renderer = new THREE.WebGLRenderer();
else
            this.renderer = new THREE.CanvasRenderer();

        if (typeof this.renderer == 'undefined' || this.renderer == null)
            if (!Detector.webgl)
                Detector.addGetWebGLMessage();

        this.renderer.setClearColor(0x000000, 1);

        this.renderer.sortObjects = false;
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        //        this.renderer.shadowMapEnabled = true;
        //        this.renderer.shadowMapSoft = true;
        this.renderer.gammaInput = true;
        this.renderer.gammaOutput = true;
        this.renderer.physicallyBasedShading = true;

        // Container initialization
        this.container = document.createElement('div');
        document.body.appendChild(this.container);

        var intro = document.createElement('div');
        intro.innerHTML = '<div id="nav"><div id="pause" title="pause game"></div><div id="reset" title="reset game"></div></div><div id="intro"><div><button>start</button><img src="img/intro.png" alt="intro" /></div></div>';
        this.container.appendChild(intro);

        var info = document.createElement('div');
        info.style.position = 'absolute';
        info.style.bottom = '0px';
        info.style.height = '30px';
        info.style.lineHeight = '30px';
        info.style.width = '100%';
        info.style.textAlign = 'right';
        info.style.backgroundColor = '#000';
        info.innerHTML = '<a href="http://www.facebook.com/" target="_blank"><img src="img/fb_logo.png" alt="fb" /></a><h5><a href="http://threejs.org" target="_blank">three.js</a> webgl</h5> &nbsp;&nbsp; <h3>' + document.title + '</h3> &nbsp;&nbsp;&nbsp;&nbsp; <span class="credits">Marek Salát <i class="white">|</i> Michal Pracuch <i class="white">|</i> Petr Přikryl</span>';
        this.container.appendChild(info);
        this.container.appendChild(this.renderer.domElement);

        window.addEventListener('resize', (function (__this) {
            return function () {
                __this.onWindowResize();
            };
        })(this), false);

        var renderPass = new THREE.RenderPass(this.scene, this.camera);
        var copyPass = new THREE.ShaderPass(THREE.CopyShader);

        this.effectComposer = new THREE.EffectComposer(this.renderer);

        this.effectComposer.addPass(renderPass);

        var colorCorrectionPass = new THREE.ShaderPass(THREE.ColorCorrectionShader);
        this.effectComposer.addPass(colorCorrectionPass);

        this.effectComposer.addPass(copyPass);

        //set last pass in composer chain to renderToScreen
        copyPass.renderToScreen = true;

        // Control initialization
        this.controls = new THREE.TrackballControls(this.camera, this.container);

        this.controls.rotateSpeed = 0.8;
        this.controls.zoomSpeed = 1.2;
        this.controls.panSpeed = 0.8;

        this.controls.noZoom = false;
        this.controls.maxDistance = 2500;
        this.controls.minDistance = 25;
        this.controls.noPan = true;

        this.controls.staticMoving = false;
        this.controls.dynamicDampingFactor = 0.15;
    };

    Game3DScreen.prototype.update = function (delta) {
        _super.prototype.update.call(this, delta);
        this.controls.update();
    };

    Game3DScreen.prototype.render = function (delta) {
        _super.prototype.render.call(this, delta);
        this.renderer.render(this.scene, this.camera);
        //        this.effectComposer.render(delta);
    };

    Game3DScreen.prototype.addLight = function (h, s, l, x, y, z) {
        var light = new THREE.PointLight(0xffffff, 1.5, 4500);
        light.color.setHSL(h, s, l);
        light.position.set(x, y, z);
        this.scene.add(light);

        var textureFlare = this.asset.getFlareTextures();
        var flareColor = new THREE.Color(0xffffff);
        flareColor.setHSL(h, s, l + 0.5);

        var lensFlare = new THREE.LensFlare(textureFlare[0], 256, 0.0, THREE.AdditiveBlending, flareColor);

        lensFlare.add(textureFlare[1], 256, 0.0, THREE.AdditiveBlending);
        lensFlare.add(textureFlare[1], 256, 0.0, THREE.AdditiveBlending);
        lensFlare.add(textureFlare[1], 256, 0.0, THREE.AdditiveBlending);

        lensFlare.add(textureFlare[2], 60, 0.6, THREE.AdditiveBlending);
        lensFlare.add(textureFlare[2], 70, 0.7, THREE.AdditiveBlending);
        lensFlare.add(textureFlare[2], 120, 0.9, THREE.AdditiveBlending);
        lensFlare.add(textureFlare[2], 70, 1.0, THREE.AdditiveBlending);

        lensFlare.customUpdateCallback = (function (__this) {
            return function (object) {
                __this.lensFlareUpdateCallback(object);
            };
        })(this);
        lensFlare.position = light.position;

        this.scene.add(lensFlare);
    };

    Game3DScreen.prototype.lensFlareUpdateCallback = function (object) {
        var f, fl = object.lensFlares.length;
        var flare;
        var vecX = -object.positionScreen.x * 2;
        var vecY = -object.positionScreen.y * 2;

        for (f = 0; f < fl; f++) {
            flare = object.lensFlares[f];

            flare.x = object.positionScreen.x + vecX * flare.distance;
            flare.y = object.positionScreen.y + vecY * flare.distance;

            flare.rotation = 0;
        }
    };

    Game3DScreen.prototype.gameOver = function (text) {
        var gameOver = document.createElement('div');
        gameOver.style.textAlign = "center";
        gameOver.style.marginBottom = "10px";
        gameOver.innerHTML = text;

        var reset = document.getElementById("reset");
        reset.style.margin = "auto auto";
        reset.style.display = "block";

        //gameOver.appendChild(reset);
        var introDiv = document.getElementById("intro").childNodes[0];
        introDiv.removeChild(introDiv.getElementsByTagName("button")[0]);
        var img = introDiv.getElementsByTagName("img")[0];
        introDiv.insertBefore(gameOver, img);
        introDiv.insertBefore(reset, img);

        document.getElementById("pause").click();
    };
    return Game3DScreen;
})(GameScreen);
;

var LevelScreen = (function (_super) {
    __extends(LevelScreen, _super);
    function LevelScreen() {
        _super.call(this);
        console.log("LevelScreen construct");

        this.mouse = new THREE.Vector3();
        this.mouse.z = 1;

        //this.level = this.asset.createLevel(this, _game, 1); // new Level(this, _game, this.asset);
        this.aiWrapper = new AIWrapper(this, AIDifficultyType.EASY);
    }
    LevelScreen.prototype.init = function () {
        _super.prototype.init.call(this);
        console.log("LevelScreen init");

        this.level = this.asset.createLevel(this, _game, 1);

        this.level.init();

        this.aiWrapper.init();

        this.intersects = [];

        this.state = 'looking';

        this.mouseDownListener = (function (__this) {
            return function (event) {
                __this.onMouseDown(event);
            };
        })(this);
        this.container.addEventListener('mousedown', this.mouseDownListener, false);

        this.mouseMoveSelectingListener = (function (__this) {
            return function (event) {
                __this.onMouseMoveSelecting(event);
            };
        })(this);

        this.mouseUpListener = (function (__this) {
            return function (event) {
                __this.onMouseUp(event);
            };
        })(this);
    };

    LevelScreen.prototype.onMouseDown = function (event) {
        this.setMouse(event);

        var intersects = this.getIntersectsObjects(this.mouse);

        if (intersects.length <= 0)
            return;
        if (!this.level.onSelectionStart(intersects))
            return;

        event.preventDefault();
        event.stopPropagation();

        /* this statement fix problem with unreleased trackball. Trackball mouse down event is called
        * before this event and the event registered mouse move event and mose up event.
        * This cause huge rotation after finnish planet selecting. Only solution is unregistered trackball
        * events, this is done by calling mouse up event.
        *
        * but there will be problems with touch events, but we do not support touch screen devices yet. */
        this.controls.mouseup(event);

        this.controls.noRotate = true;

        this.container.addEventListener('mousemove', this.mouseMoveSelectingListener, false);
        this.container.addEventListener('mouseup', this.mouseUpListener, false);

        this.state = 'selecting';
        console.log(this.state);
    };

    LevelScreen.prototype.onMouseMoveSelecting = function (event) {
        event.preventDefault();
        event.stopPropagation();

        this.setMouse(event);

        var intersects = this.getIntersectsObjects(this.mouse);

        this.level.onObjectSelected(intersects);
    };

    LevelScreen.prototype.setMouse = function (event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    LevelScreen.prototype.onMouseUp = function (event) {
        event.preventDefault();
        event.stopPropagation();

        this.controls.noRotate = false;

        this.container.removeEventListener('mousemove', this.mouseMoveSelectingListener);
        this.container.removeEventListener('mouseup', this.mouseUpListener);

        this.setMouse(event);
        var intersects = this.getIntersectsObjects(this.mouse);
        this.level.onSelectionFinish(intersects);

        this.state = 'looking';
        console.log(this.state);
    };

    LevelScreen.prototype.update = function (delta) {
        _super.prototype.update.call(this, delta);
        this.level.update(delta);

        if (this.level.player.planetsOwned == 0 && this.level.player.fleetsOnWay == 0 && !this.level.gameOver) {
            this.level.gameOver = true;
            this.gameOver("<h1 class='red'>Game over</h1>");
        } else if (this.level.competitor.planetsOwned == 0 && this.level.competitor.fleetsOnWay == 0 && !this.level.playerWin) {
            this.level.playerWin = true;
            this.gameOver("<h1 class='green'>You win</h1>");
        }
    };

    LevelScreen.prototype.render = function (delta) {
        _super.prototype.render.call(this, delta);

        for (var i in this.level.planets) {
            var planet = this.level.planets[i];
            switch (planet.rotation) {
                case "x":
                    planet.planetMesh.rotation.x += 1 / 8192 * delta;
                    break;
                case "y":
                    planet.planetMesh.rotation.y += 1 / 8192 * delta;
                    break;
                case "z":
                    planet.planetMesh.rotation.z += 1 / 8192 * delta;
                    break;
            }
        }
    };

    LevelScreen.prototype.getIntersectsObjects = function (vector) {
        // find intersections
        this.projector.unprojectVector(vector, this.camera);
        this.raycaster.set(this.camera.position, vector.sub(this.camera.position).normalize());

        var intersects = this.raycaster.intersectObjects(this.scene.children, true);
        return intersects;
    };
    return LevelScreen;
})(Game3DScreen);
;
//# sourceMappingURL=Screen.js.map
