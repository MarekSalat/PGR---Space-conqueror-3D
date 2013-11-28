var Skybox = (function () {
    function Skybox() {
    }
    Skybox.init = //    constructor(public scene: any)
    //    {
    //    }
    function (scene) {
        var path = "res/skybox/";
        var file = 'out';
        var format = '.png';

        //        var array = Skybox.randArray();
        //        var urls = [
        //            path + 'Universe2' + format, path + 'Universe2' + format,
        //            path + 'Universe2' + format, path + 'Universe2' + format,
        //            path + 'Universe2' + format, path + 'Universe2' + format
        //        ];
        //        var urls = [
        //            path + file + array[0] + format, path + file + array[1] + format,
        //            path + file + array[2] + format, path + file + array[3] + format,
        //            path + file + array[4] + format, path + file + array[5] + format
        //        ];
        var urls = [
            path + file + format,
            path + file + format,
            path + file + format,
            path + file + format,
            path + file + format,
            path + file + format
        ];

        //        console.log (urls);
        var textureCube = THREE.ImageUtils.loadTextureCube(urls);

        // init the cube shadder
        var shader = THREE.ShaderLib["cube"];
        var uniforms = THREE.UniformsUtils.clone(shader.uniforms);
        uniforms["tCube"].value = textureCube;

        var material = new THREE.ShaderMaterial({
            fragmentShader: shader.fragmentShader,
            vertexShader: shader.vertexShader,
            uniforms: uniforms,
            depthWrite: false,
            side: THREE.BackSide
        });

        // build the skybox Mesh
        var skyboxMesh = new THREE.Mesh(new THREE.CubeGeometry(10000, 10000, 10000), material);

        // add it to the scene
        scene.add(skyboxMesh);

        file = 'in';

        //        array = Skybox.randArray();
        //
        //        urls = [
        //            path + file + array[0] + format, path + file + array[1] + format,
        //            path + file + array[2] + format, path + file + array[3] + format,
        //            path + file + array[4] + format, path + file + array[5] + format
        //        ];
        //        urls = [
        //            path + 'Universe3' + format, path + 'Universe3' + format,
        //            path + 'Universe3' + format, path + 'Universe3' + format,
        //            path + 'Universe3' + format, path + 'Universe3' + format
        //        ];
        var urls = [
            path + file + format,
            path + file + format,
            path + file + format,
            path + file + format,
            path + file + format,
            path + file + format
        ];

        textureCube = THREE.ImageUtils.loadTextureCube(urls);

        // init the cube shadder
        //        var shader = THREE.ShaderLib[ "cube" ];
        uniforms = THREE.UniformsUtils.clone(shader.uniforms);
        uniforms["tCube"].value = textureCube;

        material = new THREE.ShaderMaterial({
            fragmentShader: shader.fragmentShader,
            vertexShader: shader.vertexShader,
            uniforms: uniforms,
            //            depthWrite: false,
            side: THREE.BackSide,
            transparent: true,
            blending: THREE["AdditiveBlending"]
        });

        // build the skybox Mesh
        //        var skyboxMesh2	= new THREE.Mesh( new THREE.CubeGeometry( 1000, 1000, 1000), material );
        skyboxMesh = new THREE.Mesh(new THREE.CubeGeometry(5000, 5000, 5000), material);

        // add it to the scene
        scene.add(skyboxMesh);
    };

    Skybox.randArray = function () {
        var array = [];

        while (array.length < 6) {
            var rand = THREE.Math.randInt(1, 2);

             {
                //                console.log ("push " + rand);
                array.push(rand);
            }
        }

        //        console.log (array);
        return array;
    };
    return Skybox;
})();
//# sourceMappingURL=Skybox.js.map
