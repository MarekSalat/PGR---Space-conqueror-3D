/**
 * Created with JetBrains PhpStorm.
 * User: Marek
 * Date: 18.10.13
 * Time: 20:04
 * To change this template use File | Settings | File Templates.
 */

//@todo: jeste je to treba promyslet. ale meli by mu stacit objetky planet a nejaka tovarna na vytvoreni flotily
var Level = Level || function() {

    this.init = function (){
        this.model = new GameModel();
        this.asset = new Asset();
    };

    this.update = function (delta){
        this.model.update(delta);
    };

    //@todo: vrati three.js path k planete
    this.getPath = function (planetA, planetB){
        throw {message: "unimplemented"};
    };

    //@todo: vrati jak dlouho se poleti
    this.getDistance = function (planetA, planetB){
        throw {message: "unimplemented"};
    };
};
