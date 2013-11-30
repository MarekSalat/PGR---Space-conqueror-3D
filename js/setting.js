var Setting = {
    timeShift: 0,
    app_name: "Space conqueror",
    colors: {
        emerald: 0x2ecc71,
        nephritis: 0x27ae60,
        sun_flower: 0xf1c40f,
        amethyst: 0x9b59b6,
        wisteria: 0x8e44ad,
        pomegranate: 0xc0392b,
        pumpkin: 0xd35400,
        alizarin: 0xe74c3c,
        orange: 0xf39c12,
        carrot: 0xe67e22,
        concrete: 0x95a5a6,
        asbestos: 0x7f8c8d,
        clouds: 0xecf0f1,
        silver: 0xbdc3c7,
        turquoise: 0x1abc9c,
        green_sea: 0x16a085,
        peter_river: 0x3498db,
        belize_hole: 0x2980b9,
        wet_asphalt: 0x34495e,
        midnight_blue: 0x2c3e50
    },
    planet: {
        // @var new ships created per second
        default_newShipsPerSecond: 10,
        default_amountOfShips: 10,
        generatingSpeed: 0.8,
        maximumAmountOfShips: 999,
        // @var how many of ships will take off on one move from this planet in hold
        takeoffInPercent: 0.5,
        // @var how many ships will be in one fleet
        fleetCapacity: 1
    },
    fleet: {
        speed: 0.2
    },
    AI: {
        status: 9000
    }
};

var Levels = {
    level_1: {
        planets: [
            {
                x: -750,
                y: 300,
                z: 0,
                radius: 3,
                amountOfShips: 30,
                newShipsPerSecond: 4,
                owner: 1,
                texture: "pluto",
                rotation: "x"
            },
            {
                x: 900,
                y: 0,
                z: 150,
                radius: 3,
                amountOfShips: 30,
                newShipsPerSecond: 4,
                owner: 2,
                texture: "pluto",
                rotation: "x"
            },
            {
                x: -280,
                y: 10,
                z: 100,
                radius: 1.5,
                amountOfShips: 15,
                newShipsPerSecond: 2,
                owner: 0,
                texture: "earth",
                rotation: "y"
            },
            {
                x: -390,
                y: 300,
                z: 300,
                radius: 1.5,
                amountOfShips: 15,
                newShipsPerSecond: 2,
                owner: 0,
                texture: "earth",
                rotation: "y"
            },
            {
                x: 200,
                y: 0,
                z: 500,
                radius: 1.5,
                amountOfShips: 15,
                newShipsPerSecond: 2,
                owner: 0,
                texture: "earth",
                rotation: "y"
            },
            {
                x: 646,
                y: 359,
                z: 350,
                radius: 1.5,
                amountOfShips: 15,
                newShipsPerSecond: 2,
                owner: 0,
                texture: "earth",
                rotation: "y"
            },
            {
                x: 600,
                y: -350,
                z: -250,
                radius: 1.5,
                amountOfShips: 15,
                newShipsPerSecond: 2,
                owner: 0,
                texture: "earth",
                rotation: "y"
            },
            {
                x: -440,
                y: 60,
                z: -250,
                radius: 1,
                amountOfShips: 10,
                newShipsPerSecond: 1.5,
                owner: 0,
                texture: "neptune",
                rotation: "x"
            },
            {
                x: 525,
                y: 50,
                z: 380,
                radius: 1,
                amountOfShips: 10,
                newShipsPerSecond: 1.5,
                owner: 0,
                texture: "neptune",
                rotation: "x"
            },
            {
                x: 350,
                y: 305,
                z: -440,
                radius: 1,
                amountOfShips: 10,
                newShipsPerSecond: 1.5,
                owner: 0,
                texture: "neptune",
                rotation: "x"
            },
            {
                x: -600,
                y: 50,
                z: 350,
                radius: 1,
                amountOfShips: 10,
                newShipsPerSecond: 1.5,
                owner: 0,
                texture: "neptune",
                rotation: "x"
            },
            {
                x: 30,
                y: 320,
                z: -70,
                radius: 2,
                amountOfShips: 20,
                newShipsPerSecond: 3,
                owner: 0,
                texture: "mars",
                rotation: "x"
            },
            {
                x: 790,
                y: 150,
                z: -200,
                radius: 2,
                amountOfShips: 20,
                newShipsPerSecond: 3,
                owner: 0,
                texture: "mars",
                rotation: "x"
            },
            {
                x: 205,
                y: -195,
                z: 155,
                radius: 2,
                amountOfShips: 20,
                newShipsPerSecond: 3,
                owner: 0,
                texture: "mars",
                rotation: "x"
            },
            {
                x: -580,
                y: -250,
                z: 350,
                radius: 2,
                amountOfShips: 20,
                newShipsPerSecond: 3,
                owner: 0,
                texture: "mars",
                rotation: "x"
            },
            {
                x: -100,
                y: -400,
                z: -400,
                radius: 3,
                amountOfShips: 50,
                newShipsPerSecond: 4,
                owner: 0,
                texture: "pluto",
                rotation: "x"
            },
            {
                x: 312,
                y: 411,
                z: 599,
                radius: 3,
                amountOfShips: 45,
                newShipsPerSecond: 4,
                owner: 0,
                texture: "pluto",
                rotation: "x"
            }
        ]
    }
};
//# sourceMappingURL=Setting.js.map
