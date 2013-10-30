/**
 * Created with IntelliJ IDEA.
 * User: Petr
 * Date: 29.10.13
 * Time: 22:17
 * To change this template use File | Settings | File Templates.
 */

onmessage = function(e) {
    if ("sleepTime" in e.data) {
        setTimeout(function() {
            postMessage("AI sleeper was awaken!");
        }, e.data.sleepTime);
    }
    else {
        postMessage("Error while sleeping this thread.");
    }
}
