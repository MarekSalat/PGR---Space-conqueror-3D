/**
 * Created with JetBrains PhpStorm.
 * User: Marek
 * Date: 18.10.13
 * Time: 20:05
 * To change this template use File | Settings | File Templates.
 */

var Screen = (function () {
    function Screen() {
        console.log("Screen construct");
    }

    Screen.prototype.init = function (){
        console.log("Screen init");
    };

    Screen.prototype.update = function (delta){
    };

    Screen.prototype.render = function (delta){
    };

    return Screen;
})();

Game3DScreen = (function (_super) {
    _extends(Game3DScreen, _super);

    function Game3DScreen () {
        _super.call(this);  console.log("Game3DScreen construct");

        //this.camera; this.scene; this.projector;  this.raycaster; this.renderer;

    };

    Game3DScreen.prototype.onWindowResize = function () {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.controls.handleResize();

        this.renderer.setSize( window.innerWidth, window.innerHeight );
    };

    Game3DScreen.prototype.init = function(){
        _super.prototype.init.call(this);   console.log("Game3DScreen init");

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

        // Light initialization
        var light = new THREE.DirectionalLight( 0xffffff, 2 );
        light.position.set( 1, 1, 1 ).normalize();
        this.scene.add( light );

        var light = new THREE.DirectionalLight( 0xffffff );
        light.position.set( -1, -1, -1 ).normalize();
        this.scene.add( light );

        // Projector and raycaster initialization
        this.projector = new THREE.Projector();
        this.raycaster = new THREE.Raycaster();

        // Renderer initialization
        if (window.WebGLRenderingContext)
            this.renderer = new THREE.WebGLRenderer();
        else
            this.renderer = new THREE.CanvasRenderer();

        if(typeof this.renderer == 'undefined' || this.renderer == null)
            if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

        //this.renderer.setClearColor( 0xFFffFF, 1 );

        this.renderer.sortObjects = false;
        this.renderer.setSize( window.innerWidth, window.innerHeight );

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

    };

    Game3DScreen.prototype.update = function (delta){
        _super.prototype.update.call(this, delta);
        this.controls.update();
    };

    Game3DScreen.prototype.render = function (delta) {
        _super.prototype.render.call(this, delta);
        this.renderer.render( this.scene, this.camera );
    };

    return Game3DScreen;
})(Screen);


var LevelScreen = (function (_super) {
    _extends(TestGame3DScreen, _super);

    function TestGame3DScreen(name) {
        _super.call(this, name);    console.log("LevelScreen construct");

        this.mouse = new THREE.Vector3();
        this.mouse.z = 1;
        this.INTERSECTED = [];

        this.level = new Level(this, game);
    };

    TestGame3DScreen.prototype.init = function (){
        _super.prototype.init.call(this);   console.log("LevelScreen init");

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
    };

    TestGame3DScreen.prototype.onMouseDown = function( event ){
        this.setMouse(event);

        var intersects = this.getIntersectsObjects(this.mouse)
        if( intersects.length <= 0) return;
        if( !this.level.onSelectionStart(intersects) ) return;

        this.controls.noRotate = true;

        document.addEventListener( 'mousemove', this.mouseMoveSelectingListener, false );
        document.addEventListener( 'mouseup', this.mouseUpListener, false );

        this.state = 'selecting';
        console.log(this.state);
    };

    TestGame3DScreen.prototype.onMouseMoveSelecting = function ( event ) {
        event.preventDefault();
        event.stopPropagation();

        this.setMouse(event);

        var intersects = this.getIntersectsObjects(this.mouse);

        this.level.onObjectSelected(intersects);
    };

    TestGame3DScreen.prototype.setMouse = function(event){
        this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    };

    TestGame3DScreen.prototype.onMouseUp = function(){
        event.preventDefault();
        event.stopPropagation();

        this.controls.noRotate = false;
        document.removeEventListener('mousemove', this.mouseMoveSelectingListener);
        document.removeEventListener('mouseup', this.mouseUpListener);

        this.level.onSelectionFinish();

        this.state = 'looking';
        console.log(this.state);
    };

    TestGame3DScreen.prototype.update = function (delta){
        _super.prototype.update.call(this, delta);
        this.level.update(delta);
    };

    TestGame3DScreen.prototype.render = function (delta){
        _super.prototype.render.call(this, delta);
    };

    TestGame3DScreen.prototype.getIntersectsObjects = function(vector){
        // find intersections
        this.projector.unprojectVector( vector, this.camera );
        this.raycaster.set( this.camera.position, vector.sub( this.camera.position ).normalize() );

        var intersects = this.raycaster.intersectObjects( this.scene.children );
        return intersects;
    };

    return TestGame3DScreen;
})(Game3DScreen);


