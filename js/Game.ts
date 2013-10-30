/// <reference path="GameModel.ts" />

declare var THREE;

class Game {
    levelLoader = null;
    assetLoader = null;

    screen = null;
    setScreen(screen){
//        this.screen.pause();
//        this.screen.dispose();
//        screen.resume();
//        screen.update(0);
        this.screen = screen;
        console.log(screen);
    }

    hasScreen(){
        return typeof this.screen != null && typeof this.screen != "undefined";
    }

    init(){
        if(this.hasScreen()) this.screen.init();
    }

    private clock = null;
    animate(){
        if(this.clock == null)
           this.clock = new THREE.Clock(true);
        var delta = this.clock.getDelta() * 1000;

        if(!this.hasScreen()) return;
        var screen = this.screen;

        screen.update(delta);
        screen.render(delta);
    }
};