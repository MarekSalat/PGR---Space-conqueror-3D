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
/// <reference path="AIWrapper.ts" />
/// <reference path="AI.ts" />
/// <reference path="asset.ts" />

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
    public asset;
    public effectComposer;

    constructor() {
        super();  console.log("Game3DScreen construct");
        this.asset = new Asset();
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
        this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
        this.camera.position.z = 1500;

        // Control initialization
        this.controls = new THREE.TrackballControls( this.camera );

        this.controls.rotateSpeed = 1.0;
        this.controls.zoomSpeed = 1.2;
        this.controls.panSpeed = 0.8;

        this.controls.noZoom = false;   this.controls.maxDistance = 2000;   this.controls.minDistance = 25;

        this.controls.noPan = true;

        this.controls.staticMoving = false;
        this.controls.dynamicDampingFactor = 0.3;

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

        var ambient = new THREE.AmbientLight( 0xffffff );
        ambient.color.setHSL( 0.1, 0.3, 0.05 );
        this.scene.add( ambient );


        var dirLight = new THREE.DirectionalLight( 0xffffff, 0.125 );
        dirLight.position.set( 0, -1, 0 ).normalize();
        this.scene.add( dirLight );

        dirLight.color.setHSL( 0.1, 0.7, 0.5 );


        this.addLight( 0.995, 0.5, 0.9,     0, 5000, 0 );

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

//        this.renderer.shadowMapEnabled = true;
//        this.renderer.shadowMapSoft = true;

        this.renderer.gammaInput = true;
        this.renderer.gammaOutput = true;
        this.renderer.physicallyBasedShading = true;

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

        var renderPass = new THREE.RenderPass( this.scene, this.camera );
        var copyPass = new THREE.ShaderPass( THREE.CopyShader );

        this.effectComposer = new THREE.EffectComposer( this.renderer );

        this.effectComposer.addPass( renderPass );

        var colorCorrectionPass = new THREE.ShaderPass( THREE.ColorCorrectionShader );
        this.effectComposer.addPass( colorCorrectionPass );

        this.effectComposer.addPass( copyPass );
        //set last pass in composer chain to renderToScreen
        copyPass.renderToScreen = true;
    }

    update(delta){
        super.update(delta);
        this.controls.update();
    }

    render(delta) {
        super.render(delta);
        this.renderer.render( this.scene, this.camera );
//        this.effectComposer.render(delta);
    }

    addLight( h, s, l, x, y, z ) {

        var light = new THREE.PointLight( 0xffffff, 1.5, 4500 );
        light.color.setHSL( h, s, l );
        light.position.set( x, y, z );
        this.scene.add( light );

        var textureFlare = this.asset.getFlareTextures();
        var flareColor = new THREE.Color( 0xffffff );
        flareColor.setHSL( h, s, l + 0.5 );

        var lensFlare = new THREE.LensFlare( textureFlare[0], 512, 0.0, THREE.AdditiveBlending, flareColor );

        lensFlare.add( textureFlare[1], 512, 0.0, THREE.AdditiveBlending );
        lensFlare.add( textureFlare[1], 512, 0.0, THREE.AdditiveBlending );
        lensFlare.add( textureFlare[1], 512, 0.0, THREE.AdditiveBlending );

        lensFlare.add( textureFlare[2], 60, 0.6, THREE.AdditiveBlending );
        lensFlare.add( textureFlare[2], 70, 0.7, THREE.AdditiveBlending );
        lensFlare.add( textureFlare[2], 120, 0.9, THREE.AdditiveBlending );
        lensFlare.add( textureFlare[2], 70, 1.0, THREE.AdditiveBlending );

        lensFlare.customUpdateCallback = (function(__this){
            return function(object) {__this.lensFlareUpdateCallback(object)};
        })(this);
        lensFlare.position = light.position;

        this.scene.add( lensFlare );

    }

    lensFlareUpdateCallback( object ) {
        var f, fl = object.lensFlares.length;
        var flare;
        var vecX = -object.positionScreen.x * 2;
        var vecY = -object.positionScreen.y * 2;


        for( f = 0; f < fl; f++ ) {

            flare = object.lensFlares[ f ];

            flare.x = object.positionScreen.x + vecX * flare.distance;
            flare.y = object.positionScreen.y + vecY * flare.distance;

            flare.rotation = 0;
        }
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

    public aiWrapper;


    constructor() {
        super();    console.log("LevelScreen construct");

        this.mouse = new THREE.Vector3();
        this.mouse.z = 1;

        this.level = new Level(this, _game, this.asset);

        this.aiWrapper = new AIWrapper(this, AIDifficultyType.EASY); // TODO: game difficulty parameter
        // this.aiWrapper.setDifficulty(AIDifficultyType.SLEEPER); // for afflicted AI
    }

    init(){
        super.init();   console.log("LevelScreen init");

        this.level.init();

        this.aiWrapper.init();

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

        var intersects = this.getIntersectsObjects(this.mouse);

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

        var intersects = this.raycaster.intersectObjects( this.scene.children, true );
        return intersects;
    }
};


