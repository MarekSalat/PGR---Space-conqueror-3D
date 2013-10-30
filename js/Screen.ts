/**
 * Created with JetBrains.
 * User: Marek
 * Date: 18.10.13
 * Time: 20:05
 * To change this template use File | Settings | File Templates.
 */

/// <reference path="Setting.ts" />
/// <reference path="GameModel.ts" />
/// <reference path="Level.ts" />
declare var THREE;
declare var Detector;
declare var _game;
declare var window;

class GameScreen {
    constructor() {
        console.log("Screen construct");
    }

    init(){
        console.log("Screen init");
    }

    update(delta){}

    render(delta){}
};

class Game3DScreen extends GameScreen {

    public camera;
    public scene;
    public projector;
    public raycaster;
    public renderer ;
    public controls ;
    public container;

    constructor() {
        super();  console.log("Game3DScreen construct");
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.controls.handleResize();

        this.renderer.setSize( window.innerWidth, window.innerHeight );
    }

    init(){
        super.init();   console.log("Game3DScreen init");

        // Camera initialization
        this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
        this.camera.position.z = 250;

        // Control initialization
        this.controls = new THREE.TrackballControls( this.camera );

        this.controls.rotateSpeed = 1.0;
        this.controls.zoomSpeed = 1.2;
        this.controls.panSpeed = 0.8;

        this.controls.noZoom = false;   this.controls.maxDistance = 1000;   this.controls.minDistance = 25;
        this.controls.noPan = true;

        this.controls.staticMoving = false;
        this.controls.dynamicDampingFactor = 0.3;

        // Scene initialization
        this.scene = new THREE.Scene();

        var spotLight;

        spotLight = new THREE.SpotLight( 0xbbbbbb );
        spotLight.position.set(0, 1500, 0);
        spotLight.castShadow = true;
        spotLight.shadowCameraFov = 30; //VIEW_ANGLE;
        spotLight.shadowBias = 0.0001;
        spotLight.shadowDarkness = 0.02;
        spotLight.shadowMapWidth = 2048;
        spotLight.shadowMapHeight = 2048;
        this.scene.add(spotLight);

        spotLight = new THREE.SpotLight( 0xbbbbbb );
        spotLight.position.set(-1500, -1500, 0);
        spotLight.castShadow = true;
        spotLight.shadowCameraFov = 30; //VIEW_ANGLE;
        spotLight.shadowBias = 0.0001;
        spotLight.shadowDarkness = 0.2;
        spotLight.shadowMapWidth = 2048;
        spotLight.shadowMapHeight = 2048;
        this.scene.add(spotLight);

        spotLight = new THREE.SpotLight( 0xbbbbbb );
        spotLight.position.set(1500, -1500, 0);
        spotLight.castShadow = true;
        spotLight.shadowCameraFov = 30; //VIEW_ANGLE;
        spotLight.shadowBias = 0.0001;
        spotLight.shadowDarkness = 0.2;
        spotLight.shadowMapWidth = 2048;
        spotLight.shadowMapHeight = 2048;
        this.scene.add(spotLight);

        //Projector and raycaster initialization
        this.projector = new THREE.Projector();
        this.raycaster = new THREE.Raycaster();

        // Renderer initialization
        if (window.WebGLRenderingContext)
            this.renderer = new THREE.WebGLRenderer();
        else
            this.renderer = new THREE.CanvasRenderer();

        if(typeof this.renderer == 'undefined' || this.renderer == null)
            if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

        this.renderer.setClearColor( 0x000000, 1 );

        this.renderer.sortObjects = false;
        this.renderer.setSize( window.innerWidth, window.innerHeight );

        this.renderer.shadowMapEnabled = true;
        this.renderer.shadowMapSoft = true;
        this.renderer.shadowMapType = THREE.PCFShadowMap;

        // Container initialization
        this.container = document.createElement( 'div' );
        document.body.appendChild( this.container );

        var info = document.createElement( 'div' );
        info.style.position = 'absolute';
        info.style.top = '10px';
        info.style.width = '100%';
        info.style.textAlign = 'center';
        info.innerHTML = '<a href="http://threejs.org" target="_blank">three.js</a> webgl - ' + document.title;
        this.container.appendChild( info );
        this.container.appendChild(this.renderer.domElement);

        window.addEventListener( 'resize', (function(__this){
            return function() {__this.onWindowResize()};
        })(this), false );

    }

    update(delta){
        super.update(delta);
        this.controls.update();
    }

    render(delta) {
        super.render(delta);
        this.renderer.render( this.scene, this.camera );
    }
};


class LevelScreen extends Game3DScreen{

    public mouse;
    public state;

    public level;

    public intersects;

    public mouseDownListener;
    public mouseMoveSelectingListener;
    public mouseUpListener;


    constructor() {
        super();    console.log("LevelScreen construct");

        this.mouse = new THREE.Vector3();
        this.mouse.z = 1;

        this.level = new Level(this, _game);
    }

    init(){
        super.init();   console.log("LevelScreen init");

        this.level.init();

        this.intersects = [];

        this.mouseDownListener = (function(__this){
            return function(event) {__this.onMouseDown(event)};
        })(this);
        document.addEventListener( 'mousedown', this.mouseDownListener, false );

        this.mouseMoveSelectingListener = (function(__this){
            return function(event) {__this.onMouseMoveSelecting(event)};
        })(this);

        this.mouseUpListener = (function(__this){
            return function(event) {__this.onMouseUp(event)};
        })(this);

        this.state = 'looking';
    }

    onMouseDown( event ){
        this.setMouse(event);

        var intersects = this.getIntersectsObjects(this.mouse)
        if( intersects.length <= 0) return;
        if( !this.level.onSelectionStart(intersects) ) return;

        this.controls.noRotate = true;

        document.addEventListener( 'mousemove', this.mouseMoveSelectingListener, false );
        document.addEventListener( 'mouseup', this.mouseUpListener, false );

        this.state = 'selecting';
        console.log(this.state);
    }

    onMouseMoveSelecting( event ) {
        event.preventDefault();
        event.stopPropagation();

        this.setMouse(event);

        var intersects = this.getIntersectsObjects(this.mouse);

        this.level.onObjectSelected(intersects);
    }

    setMouse(event){
        this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    }

    onMouseUp(event){
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
    }

    update(delta){
        super.update(delta);
        this.level.update(delta);
    }

    render(delta){
        super.render(delta);
    }

    getIntersectsObjects(vector){
        // find intersections
        this.projector.unprojectVector( vector, this.camera );
        this.raycaster.set( this.camera.position, vector.sub( this.camera.position ).normalize() );

        var intersects = this.raycaster.intersectObjects( this.scene.children );
        return intersects;
    }
};


