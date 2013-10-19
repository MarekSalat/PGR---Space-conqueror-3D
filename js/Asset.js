/**
 * Created with JetBrains PhpStorm.
 * User: Marek
 * Date: 18.10.13
 * Time: 20:03
 * To change this template use File | Settings | File Templates.
 */

// @todo: key => value, playSound, stopSound, setVolume
var Asset = Asset || function(){

};

// @todo: loader bude mit stejne api jako three.js loader at v tom nemame bordel
var AssetLoader = AssetLoader || function(){

    this.load = function(callbackFinished , callbackProgress){
        var asset = new Asset();
        // ----
        callbackProgress(100);
        callbackFinished(asset);
    };
};
