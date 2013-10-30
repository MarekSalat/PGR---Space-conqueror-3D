/**
 * Created with IntelliJ IDEA.
 * User: Petr
 * Date: 28.10.13
 * Time: 15:08
 * To change this template use File | Settings | File Templates.
 */

importScripts('AI.js');

onmessage = function(e) {
    var planets = null;
    var player = null;

    planets = e.data.planets;
    player = e.data.player;

    //postMessage(player);
    //postMessage(planets);

    var ai = new AI(player);
    ai.initPlanets(planets);

    //postMessage("AI init success");

    postMessage(ai.calculateBestMove());

    delete ai.player;
    delete ai.AIPlanets;
    delete ai.otherPlanets;
    delete ai;
}



