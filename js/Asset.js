/**
 * Created with JetBrains PhpStorm.
 * User: Marek
 * Date: 18.10.13
 * Time: 20:03
 * To change this template use File | Settings | File Templates.
 */

var Asset = Asset || function(){

};

var AssetLoader = AssetLoader || function(){

    this.load = function(onFinish, onStateUpdate){
        var asset = new Asset();
        // ----
        onStateUpdate(100);
        onFinish(asset);
    };
};
