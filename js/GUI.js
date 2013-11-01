/**
 * Created with IntelliJ IDEA.
 * User: Marek
 * Date: 17.10.13
 * Time: 11:36
 * To change this template use File | Settings | File Templates.
 */


var GUI = function(){
    this.init = function(){
        var gui = new dat.GUI();
        gui.add({message: ""}, 'message');
        gui.add({speed: 2.5}, 'speed', -5, 5);
        gui.add({stopAI:function(){
            _game.screen.level.AISleeperRun(Infinity);
        }}, 'stopAI');

        //return gui;
    };
};