/**
 * Created with JetBrains PhpStorm.
 * User: Marek
 * Date: 18.10.13
 * Time: 20:03
 * To change this template use File | Settings | File Templates.
 */

/// <reference path="Setting.ts" />

declare var THREE;
declare var _game;

class Asset {

    planetGeometry;
    planetMaterial = [];

    planetGlowMaterial = [];
    planetSelectedGlowMaterial = [];

    shiptGeometry;
    shipMaterial;

    shiptMesh = [];

    constructor(){
    }

    init(){
        this.planetGeometry = new THREE.SphereGeometry( 42, 32, 24 );
        this.planetMaterial[0] = new THREE.MeshLambertMaterial( { color:  0xfafafa} );

        this.planetMaterial[1] = new THREE.MeshLambertMaterial( { color:  Setting.colors.emerald  } );
        this.planetMaterial[2] = new THREE.MeshLambertMaterial( { color:  Setting.colors.alizarin } );

        this.planetGlowMaterial[0] = this.createShaderMaterial();
        this.planetGlowMaterial[1] = this.createShaderMaterial(1.0, 3.0, Setting.colors.emerald);
        this.planetGlowMaterial[2] = this.createShaderMaterial(1.0, 3.0, Setting.colors.alizarin);

        this.planetSelectedGlowMaterial[0] = this.createShaderMaterial();
        this.planetSelectedGlowMaterial[1] = this.createShaderMaterial(1.0, 0.5, Setting.colors.emerald);
        this.planetSelectedGlowMaterial[2] = this.createShaderMaterial(1.0, 0.5, Setting.colors.alizarin);



        var loader = new THREE.JSONLoader();
        loader.load( '../asset/ship.js', (function(__this){
            return function ( geometry ) {
                //geometry.applyMatrix( new THREE.Matrix4().makeRotationZ( Math.PI / 2 ) );
                __this.shiptGeometry = geometry;
                __this.shipMaterial = new THREE.MeshLambertMaterial( { color:  0xfafafa} );

                var shipGlowMesh;

                __this.shiptMesh[0] = null ;

                __this.shiptMesh[1] = new THREE.Object3D();
                shipGlowMesh = new THREE.Mesh( __this.shiptGeometry,  __this.createShaderMaterial(1.0, 3.0, Setting.colors.emerald));
                shipGlowMesh.scale.multiplyScalar(1.2);
                __this.shiptMesh[1].add( shipGlowMesh );
                __this.shiptMesh[1].add( new THREE.Mesh( __this.shiptGeometry,  __this.shipMaterial));

                __this.shiptMesh[2] = new THREE.Object3D();
                shipGlowMesh = new THREE.Mesh( __this.shiptGeometry,  __this.createShaderMaterial(1.0, 3.0, Setting.colors.alizarin))
                shipGlowMesh.scale.multiplyScalar(1.2);
                __this.shiptMesh[2].add( shipGlowMesh );
                __this.shiptMesh[2].add( new THREE.Mesh( __this.shiptGeometry,  __this.shipMaterial));

                console.log("ship loaded");
            }
        })(this));

    }

    createShaderMaterial(c = 1.0, p = 3.0, colorHex = 0xffff00){
        return new THREE.ShaderMaterial(
        {
            uniforms:
            {
                "c":   { type: "f", value: c },
                "p":   { type: "f", value: p },
                glowColor: { type: "c", value: new THREE.Color( colorHex ) },
                viewVector: { type: "v3", value: _game.screen.camera.position }
            },
            vertexShader:   [
                "uniform vec3 viewVector;"+
                "uniform float c;"+
                "uniform float p;"+
                "varying float intensity;"+
                "void main()"+
                "{"+
                "    vec3 vNormal = normalize( normalMatrix * normal );"+
                "    vec3 vNormel = normalize( normalMatrix * viewVector );"+
                "    intensity = pow( c - dot(vNormal, vNormel), p );"+
                ""+
                "    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );"+
                "}"
            ].join("\n"),

            fragmentShader: [
                "uniform vec3 glowColor;"+
                "varying float intensity;"+
                "void main()"+
                "{"+
                "    vec3 glow = glowColor * intensity;"+
                "    gl_FragColor = vec4( glow, 1.0 );"+
                "}"
            ].join("\n"),
            side: THREE.FrontSide,
            blending: THREE.AdditiveBlending,
            transparent: true
        }   );
    }

    createPlanetMesh(playerID:number){
        var group = new THREE.Object3D();//create an empty container

        var planetMesh = new THREE.Mesh( this.getPlanetGeometry(),  this.getPlanetMaterial(playerID));
        planetMesh.childOfPlanet = true;

        var glowMesh = new THREE.Mesh(this.getPlanetGeometry(), this.planetGlowMaterial[playerID]);
        glowMesh.childOfPlanet = true;
        glowMesh.scale.multiplyScalar(1.2);
        group.add(planetMesh);
        if(playerID > 0) group.add(glowMesh);

        group.glowMesh = glowMesh;
        group.planetMesh = planetMesh;
        group.id = playerID;

        return group;
    }

    private getPlanetGeometry () {
        return this.planetGeometry;
    }

    private getPlanetMaterial(playerID : number){
        return this.planetMaterial[playerID];
    }

    setPlanetMaterial(planet, playerID : number){
        planet.glowMesh.material = this.planetGlowMaterial[playerID];

        if(playerID >  0) planet.add(planet.glowMesh)
        if(playerID == 0 && planet.playerID > 0) planet.remove(planet.glowMesh);

        planet.id = playerID;
    }

    makePlanetSelected(planet){
        planet.glowMesh.oldMaterial = planet.glowMesh.material;
        planet.glowMesh.material = this.planetSelectedGlowMaterial[planet.id];

        if(planet.id == 0) planet.add(planet.glowMesh);
    }

    makePlanetUnselected(planet){
        planet.glowMesh.material = planet.glowMesh.oldMaterial;

        if(planet.id == 0) planet.remove(planet.glowMesh);
    }

    textureFlare = [];
    getFlareTextures(){
        if(this.textureFlare.length <= 0){
            this.textureFlare[0] = THREE.ImageUtils.loadTexture( "../asset/lensflare0.png" );
            this.textureFlare[1] = THREE.ImageUtils.loadTexture( "../asset/lensflare2.png" );
            this.textureFlare[2] = THREE.ImageUtils.loadTexture( "../asset/lensflare3.png" );
        }

        return this.textureFlare;
    }




    createShipMesh(playerID:number){
        return this.shiptMesh[playerID].clone();
    }

};

// @todo: loader bude mit stejne api jako three.js loader at v tom nemame bordel
class AssetLoader {

    load(callbackFinished , callbackProgress){
        var asset = new Asset();
        // ----
        callbackProgress(100);
        callbackFinished(asset);
    }
};