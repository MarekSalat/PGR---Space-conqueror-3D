var Game = Game || function (){

    this.screen = null;

    this.levelLoader = null;
    this.assetLoader = null;

    this.setScreen = function (screen){
//        this.screen.pause();
//        this.screen.dispose();
//        screen.resume();
//        screen.update(0);

        this.screen = screen;
        console.log(screen);
    };

    this.init = function(){

    };

    this._clock = new THREE.Clock(true);

    this.animate = function (){
        var delta = this._clock.getElapsedTime();

        var screen = this.screen;
        if(screen == null) return;

        screen.update(delta);
        screen.render(delta);
    };
};