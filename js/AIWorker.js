/**
 * Created with IntelliJ IDEA.
 * User: Petr
 * Date: 28.10.13
 * Time: 15:08
 * To change this template use File | Settings | File Templates.
 */

importScripts('AI.js');
importScripts('AIWrapper.js');

var ai = new AI();
var sleepResponseMessage = new SleepResponseMessage();
var moveResponseMessage = new MoveResponseMessage();

onmessage = function(e) {

    if (e.data instanceof Object && e.data.hasOwnProperty("type")) {
        if (e.data.type == MessageType.SLEEP_REQUEST) {
            setTimeout(function() {
                postMessage(sleepResponseMessage);
            }, e.data.sleepTime);
        }
        else if (e.data.type == MessageType.MOVE_REQUEST) {
            ai.init(e.data.player, e.data.planets);
            moveResponseMessage.move = ai.getAIMove();
            postMessage(moveResponseMessage);
        }
    }
    else {
        postMessage("Not supported message has come");
    }
}



