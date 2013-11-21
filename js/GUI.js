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

        gui.add(Setting, 'timeShift', 0.0001, 10);

        var aiFolfer = gui.addFolder('AI');
        aiFolfer.add({stopAI:function(){
            _game.screen.level.AISleeperRun(Infinity);
        }}, 'stopAI');

        var planetFolder = gui.addFolder('Planet');
        planetFolder.add(Setting.planet, "generatingSpeed", 0, 5);
        planetFolder.add(Setting.planet, "takeoffInPercent",  0, 1);
        planetFolder.add(Setting.planet, "fleetCapacity",  0, 50);
        planetFolder.open();

        var fleetFolder = gui.addFolder('Fleet');
        fleetFolder.add(Setting.fleet, 'speed', 0.0001, 0.3);
        fleetFolder.open();
    };
};