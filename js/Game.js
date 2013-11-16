var Game = (function () {
    function Game() {
        this.levelLoader = null;
        this.assetLoader = null;
        this.screen = null;
        this.clock = null;
    }
    Game.prototype.setScreen = function (screen) {
        //        this.screen.pause();
        //        this.screen.dispose();
        //        screen.resume();
        //        screen.update(0);
        this.screen = screen;
        console.log(screen);
    };

    Game.prototype.hasScreen = function () {
        return typeof this.screen != null && typeof this.screen != "undefined";
    };

    Game.prototype.init = function () {
        if (this.hasScreen())
            this.screen.init();
    };

    Game.prototype.animate = function () {
        if (this.clock == null)
            this.clock = new THREE.Clock(true);
        var delta = this.clock.getDelta() * 1000;

        if (!this.hasScreen())
            return;
        var screen = this.screen;

        screen.update(delta);
        screen.render(delta);
    };
    return Game;
})();
;
//# sourceMappingURL=Game.js.map
