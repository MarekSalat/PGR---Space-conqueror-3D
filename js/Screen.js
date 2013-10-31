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
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
        this.camera.position.z = 250;

        // Control initialization
        this.controls = new THREE.TrackballControls(this.camera);

        this.controls.rotateSpeed = 1.0;
        this.controls.zoomSpeed = 1.2;
        this.controls.panSpeed = 0.8;

        this.controls.noZoom = false;
        this.controls.maxDistance = 1000;
        this.controls.minDistance = 25;
        this.controls.noPan = true;

        this.controls.staticMoving = false;
        this.controls.dynamicDampingFactor = 0.3;

        // Scene initialization
        this.scene = new THREE.Scene();

        var light = new THREE.DirectionalLight(0xffffff);
        light.position.set(0, 5000, 0);
        light.target.position.set(0, 0, 0);
        light.castShadow = true;
        light.shadowDarkness = 0.5;
        light.shadowCameraVisible = true;

        // these six values define the boundaries of the yellow box seen above
        light.shadowCameraNear = 2;
        light.shadowCameraFar = 5500;
        light.shadowCameraLeft = -500;
        light.shadowCameraRight = 500;
        light.shadowCameraTop = 500;
        light.shadowCameraBottom = -500;
        this.scene.add(light);

        light = new THREE.AmbientLight(0x101010);
        this.scene.add(light);

        //        var spotLight;
        //
        //        spotLight = new THREE.SpotLight( 0xbbbbbb );
        //        spotLight.position.set(0, 1500, 0);
        //        spotLight.castShadow = true;
        //        spotLight.shadowCameraFov = 30; //VIEW_ANGLE;
        //        spotLight.shadowBias = 0.0001;
        //        spotLight.shadowDarkness = 0.02;
        //        spotLight.shadowMapWidth = 2048;
        //        spotLight.shadowMapHeight = 2048;
        //
        //        this.scene.add(spotLight);
        //        spotLight = new THREE.SpotLight( 0xbbbbbb );
        //        spotLight.position.set(0, -1500, 0);
        //        //spotLight.castShadow = true;
        //        spotLight.shadowCameraFov = 30; //VIEW_ANGLE;
        //        spotLight.shadowBias = 0.0001;
        //        spotLight.shadowDarkness = 0.2;
        //        spotLight.shadowMapWidth = 2048;
        //        spotLight.shadowMapHeight = 2048;
        //        this.scene.add(spotLight);
        //        spotLight = new THREE.SpotLight( 0xbbbbbb );
        //        spotLight.position.set(1500, -1500, 0);
        //        spotLight.castShadow = true;
        //        spotLight.shadowCameraFov = 30; //VIEW_ANGLE;
        //        spotLight.shadowBias = 0.0001;
        //        spotLight.shadowDarkness = 0.2;
        //        spotLight.shadowMapWidth = 2048;
        //        spotLight.shadowMapHeight = 2048;
        //        this.scene.add(spotLight);
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

        this.renderer.shadowMapEnabled = true;
        this.renderer.shadowMapSoft = true;

        //        this.renderer.shadowMapType = THREE.PCFShadowMap;
        //
        //        this.renderer.shadowCameraNear = 3;
        //        this.renderer.shadowCameraFar = this.camera.far;
        //        this.renderer.shadowCameraFov = 50;
        //
        //        this.renderer.shadowMapBias = 0.0039;
        //        this.renderer.shadowMapDarkness = 0.5;
        //        this.renderer.shadowMapWidth = 1024;
        //        this.renderer.shadowMapHeight = 1024;
        // Container initialization
        this.container = document.createElement('div');
        document.body.appendChild(this.container);

        var info = document.createElement('div');
        info.style.position = 'absolute';
        info.style.top = '10px';
        info.style.width = '100%';
        info.style.textAlign = 'center';
        info.innerHTML = '<a href="http://threejs.org" target="_blank">three.js</a> webgl - ' + document.title;
        this.container.appendChild(info);
        this.container.appendChild(this.renderer.domElement);

        window.addEventListener('resize', (function (__this) {
            return function () {
                __this.onWindowResize();
            };
        })(this), false);
    };

    Game3DScreen.prototype.update = function (delta) {
        _super.prototype.update.call(this, delta);
        this.controls.update();
    };

    Game3DScreen.prototype.render = function (delta) {
        _super.prototype.render.call(this, delta);
        this.renderer.render(this.scene, this.camera);
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

        this.level = new Level(this, _game);
    }
    LevelScreen.prototype.init = function () {
        _super.prototype.init.call(this);
        console.log("LevelScreen init");

        this.level.init();

        this.intersects = [];

        this.mouseDownListener = (function (__this) {
            return function (event) {
                __this.onMouseDown(event);
            };
        })(this);
        document.addEventListener('mousedown', this.mouseDownListener, false);

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

        this.state = 'looking';
    };

    LevelScreen.prototype.onMouseDown = function (event) {
        this.setMouse(event);

        var intersects = this.getIntersectsObjects(this.mouse);
        if (intersects.length <= 0)
            return;
        if (!this.level.onSelectionStart(intersects))
            return;

        this.controls.noRotate = true;

        document.addEventListener('mousemove', this.mouseMoveSelectingListener, false);
        document.addEventListener('mouseup', this.mouseUpListener, false);

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
        document.removeEventListener('mousemove', this.mouseMoveSelectingListener);
        document.removeEventListener('mouseup', this.mouseUpListener);

        this.setMouse(event);
        var intersects = this.getIntersectsObjects(this.mouse);
        this.level.onSelectionFinish(intersects);

        this.state = 'looking';
        console.log(this.state);
    };

    LevelScreen.prototype.update = function (delta) {
        _super.prototype.update.call(this, delta);
        this.level.update(delta);
    };

    LevelScreen.prototype.render = function (delta) {
        _super.prototype.render.call(this, delta);
    };

    LevelScreen.prototype.getIntersectsObjects = function (vector) {
        // find intersections
        this.projector.unprojectVector(vector, this.camera);
        this.raycaster.set(this.camera.position, vector.sub(this.camera.position).normalize());

        var intersects = this.raycaster.intersectObjects(this.scene.children);
        return intersects;
    };
    return LevelScreen;
})(Game3DScreen);
;
//# sourceMappingURL=Screen.js.map
