var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/// <reference path="../node_modules/pxt-core/built/pxtsim.d.ts"/>
/// <reference path="../node_modules/pxt-core/localtypings/pxtarget.d.ts"/>
/// <reference path="../built/common-sim.d.ts"/>
var pxsim;
(function (pxsim) {
    var PinName;
    (function (PinName) {
        PinName.LIGHT = -1; // adc
        PinName.TEMPERATURE = -1; // adc
        PinName.SCL = -1; // pwm
        PinName.SDA = -1; // pwm
        PinName.RX = -1; // pwm
        PinName.TX = -1; // pwm
        PinName.AN = -1; // analog
        PinName.RST = -1; // analog
        PinName.CS = -1; // analog
        PinName.PWM = -1; // pwm
        PinName.INT = -1; // pwm
        PinName.SCK = -1; //
        PinName.MISO = -1; //
        PinName.MOSI = -1; // 
        // accelerometer and screen are on the same I2C as external
        PinName.ACCELEROMETER_SDA = -1;
        PinName.ACCELEROMETER_SCL = -1;
        PinName.ACCELEROMETER_INT = -1;
        PinName.SERVO_1 = -1;
        PinName.SERVO_2 = -1;
        function initPins() {
            var v = PinName;
            for (var _i = 0, _a = Object.keys(v); _i < _a.length; _i++) {
                var k = _a[_i];
                var key = pxsim.getConfigKey("PIN_" + k);
                if (key != null) {
                    v[k] = pxsim.getConfig(key);
                }
            }
        }
        PinName.initPins = initPins;
    })(PinName = pxsim.PinName || (pxsim.PinName = {}));
    var paletteSrc = [
        "#000000",
        "#00FFFF",
    ];
    var DalBoard = /** @class */ (function (_super) {
        __extends(DalBoard, _super);
        function DalBoard() {
            var _this = _super.call(this) || this;
            _this.invertAccelerometerYAxis = true;
            PinName.initPins();
            _this._neopixelState = {};
            _this.bus.setNotify(1023 /* DEVICE_ID_NOTIFY */, 1022 /* DEVICE_ID_NOTIFY_ONE */);
            // IDs do matter!
            _this.buttonState = new pxsim.CommonButtonState([
                new pxsim.CommonButton(15),
                new pxsim.CommonButton(45),
                new pxsim.CommonButton(5),
                new pxsim.CommonButton(26) // down
            ]);
            _this.builtinParts["lightbulb"] = _this.lightBulbState = new pxsim.LightBulbState();
            _this.builtinParts["accelerometer"] = _this.accelState = new pxsim.AccelState();
            _this.builtinParts["switch"] = _this.slideSwitchState = new pxsim.SlideSwitchState();
            _this.builtinParts["audio"] = _this.audioState = new pxsim.AudioState();
            _this.builtinParts["lightsensor"] = _this.lightSensorState = new pxsim.AnalogSensorState(17 /* DEVICE_ID_LIGHT_SENSOR */, 0, 255);
            _this.builtinParts["thermometer"] = _this.thermometerState = new pxsim.AnalogSensorState(8 /* DEVICE_ID_THERMOMETER */, -5, 50);
            _this.builtinParts["screen"] = _this.screenState = new pxsim.ScreenState(paletteSrc, 128, 64);
            _this.builtinParts["accelerometer"] = _this.accelerometerState = new pxsim.AccelerometerState(pxsim.runtime);
            _this.builtinParts["edgeconnector"] = _this.edgeConnectorState = new pxsim.EdgeConnectorState({
                pins: [
                    pxsim.PinName.SERVO_1,
                    pxsim.PinName.SERVO_2,
                    pxsim.PinName.SCL,
                    pxsim.PinName.SDA,
                    pxsim.PinName.RX,
                    pxsim.PinName.TX,
                    pxsim.PinName.AN,
                    pxsim.PinName.RST,
                    pxsim.PinName.CS,
                    pxsim.PinName.PWM,
                    pxsim.PinName.INT
                ]
            });
            _this.builtinParts["microservo"] = _this.edgeConnectorState;
            _this.builtinVisuals["microservo"] = function () { return new pxsim.visuals.MicroServoView(); };
            _this.builtinPartVisuals["microservo"] = function (xy) { return pxsim.visuals.mkMicroServoPart(xy); };
            return _this;
        }
        DalBoard.prototype.receiveMessage = function (msg) {
            if (!pxsim.runtime || pxsim.runtime.dead)
                return;
            switch (msg.type || "") {
                case "eventbus": {
                    var ev = msg;
                    this.bus.queue(ev.id, ev.eventid, ev.value);
                    break;
                }
                case "serial": {
                    var data = msg.data || "";
                    // TODO
                    break;
                }
            }
        };
        DalBoard.prototype.initAsync = function (msg) {
            _super.prototype.initAsync.call(this, msg);
            var options = (msg.options || {});
            var boardDef = msg.boardDefinition;
            var cmpsList = msg.parts;
            var cmpDefs = msg.partDefinitions || {};
            var fnArgs = msg.fnArgs;
            var opts = {
                state: this,
                boardDef: boardDef,
                partsList: cmpsList,
                partDefs: cmpDefs,
                fnArgs: fnArgs,
                maxWidth: "100%",
                maxHeight: "100%",
            };
            var viewHost = new pxsim.visuals.BoardHost(pxsim.visuals.mkBoardView({
                visual: boardDef.visual
            }), opts);
            document.body.innerHTML = ""; // clear children
            document.body.appendChild(this.view = viewHost.getView());
            this.accelerometerState.attachEvents(this.view);
            return Promise.resolve();
        };
        DalBoard.prototype.screenshot = function () {
            return pxsim.svg.toDataUri(new XMLSerializer().serializeToString(this.view));
        };
        DalBoard.prototype.tryGetNeopixelState = function (pinId) {
            return this._neopixelState[pinId];
        };
        DalBoard.prototype.neopixelState = function (pinId) {
            var state = this._neopixelState[pinId];
            if (!state)
                state = this._neopixelState[pinId] = new pxsim.CommonNeoPixelState();
            return state;
        };
        DalBoard.prototype.defaultNeopixelPin = function () {
            return undefined;
        };
        DalBoard.prototype.getDefaultPitchPin = function () {
            return undefined;
        };
        return DalBoard;
    }(pxsim.CoreBoard));
    pxsim.DalBoard = DalBoard;
    function initRuntimeWithDalBoard() {
        pxsim.U.assert(!pxsim.runtime.board);
        var b = new DalBoard();
        pxsim.runtime.board = b;
        pxsim.runtime.postError = function (e) {
            // TODO
            pxsim.runtime.updateDisplay();
        };
    }
    pxsim.initRuntimeWithDalBoard = initRuntimeWithDalBoard;
    if (!pxsim.initCurrentRuntime) {
        pxsim.initCurrentRuntime = initRuntimeWithDalBoard;
    }
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var AccelState = /** @class */ (function () {
        function AccelState() {
        }
        AccelState.prototype.GetX = function () {
        };
        AccelState.prototype.GetY = function () {
        };
        AccelState.prototype.GetZ = function () {
        };
        return AccelState;
    }());
    pxsim.AccelState = AccelState;
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var input;
    (function (input) {
        function ReadX() {
            var acc = pxsim.board().accelState;
            acc.GetX();
            pxsim.runtime.queueDisplayUpdate();
        }
        input.ReadX = ReadX;
        function ReadY() {
            var acc = pxsim.board().accelState;
            acc.GetY();
            pxsim.runtime.queueDisplayUpdate();
        }
        input.ReadY = ReadY;
        function ReadZ() {
            var acc = pxsim.board().accelState;
            acc.GetZ();
            pxsim.runtime.queueDisplayUpdate();
        }
        input.ReadZ = ReadZ;
    })(input = pxsim.input || (pxsim.input = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var game;
    (function (game) {
        function takeScreenshot() {
        }
        game.takeScreenshot = takeScreenshot;
    })(game = pxsim.game || (pxsim.game = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var LightBulbState = /** @class */ (function () {
        function LightBulbState() {
        }
        LightBulbState.prototype.setColor = function (r, g, b) {
            this.r = r;
            this.g = g;
            this.b = b;
        };
        LightBulbState.prototype.getColor = function () {
            return [this.r, this.g, this.b];
        };
        return LightBulbState;
    }());
    pxsim.LightBulbState = LightBulbState;
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var lightbulb;
    (function (lightbulb) {
        function __setRGBLed(r, g, b) {
            var led = pxsim.board().lightBulbState;
            led.setColor(r, g, b);
            pxsim.runtime.queueDisplayUpdate();
        }
        lightbulb.__setRGBLed = __setRGBLed;
    })(lightbulb = pxsim.lightbulb || (pxsim.lightbulb = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        var MB_STYLE = "\n        svg.sim {\n            box-sizing: border-box;\n            width: 100%;\n            height: 100%;\n            display: block;\n        }\n        svg.sim.grayscale {\n            -moz-filter: grayscale(1);\n            -webkit-filter: grayscale(1);\n            filter: grayscale(1);\n        }\n        .sim-button {\n            pointer-events: none;\n        }\n\n        .sim-button-outer {\n            cursor: pointer;\n        }\n        .sim-button-outer:hover {\n            stroke-width: 1px;\n            stroke: orange !important;\n        }\n        .sim-button-nut {\n            fill:#704A4A;\n            pointer-events:none;\n        }\n        .sim-button-nut:hover {\n            stroke:1px solid #704A4A;\n        }\n        .sim-pin-touch:hover {\n            stroke:#D4AF37;\n            stroke-width:1px;\n        }\n\n        .sim-pin-touch.touched:hover {\n            stroke:darkorange;\n        }\n\n        .sim-led-back:hover {\n            stroke:#fff;\n            stroke-width:3px;\n        }\n        .sim-led:hover {\n            stroke:#ff7f7f;\n            stroke-width:3px;\n        }\n\n        .sim-systemled {\n            fill:#333;\n            stroke:#555;\n            stroke-width: 1px;\n        }\n          \n         .sim-drawcircle {\n           \n            stroke:#42c5f4;\n            stroke-width: 6px;\n           \n        }\n\n        .sim-light-level-button {\n            stroke:#f1c40f;\n            stroke-width: 1px;\n        }\n\n        .sim-pin-level-button {\n            stroke:darkorange;\n            stroke-width: 1px;\n        }\n\n        .sim-sound-level-button {\n            stroke:#7f8c8d;\n            stroke-width: 1px;\n        }\n\n        .sim-antenna {\n            stroke:#555;\n            stroke-width: 2px;\n        }\n\n        .sim-text {\n            font-family:\"Lucida Console\", Monaco, monospace;\n            font-size: 40px;\n            fill: #000;\n        }\n        .sim-text, svg.sim text {\n            pointer-events: none; user-select: none;\n        }\n        .sim-text.small {\n            font-size:6px;\n        }\n        .sim-text.inverted {\n            fill:#000;\n        }\n\n        .sim-text-pin {\n            font-family:\"Lucida Console\", Monaco, monospace;\n            font-size:5px;\n            fill:#fff;\n            pointer-events: none;\n        }\n\n        .sim-thermometer {\n        }\n\n        #rgbledcircle:hover {\n            r:8px;\n        }\n\n        #SLIDE_HOVER {\n            cursor: pointer;\n        }\n        .sim-slide-switch:hover #SLIDE_HOVER {\n            stroke:orange !important;\n            stroke-width: 1px;\n        }\n\n        .sim-slide-switch-inner.on {\n            fill:#ff0000 !important;\n        }\n\n        /* animations */\n        .sim-theme-glow {\n            animation-name: sim-theme-glow-animation;\n            animation-timing-function: ease-in-out;\n            animation-direction: alternate;\n            animation-iteration-count: infinite;\n            animation-duration: 1.25s;\n        }\n        @keyframes sim-theme-glow-animation {\n            from { opacity: 1; }\n            to   { opacity: 0.75; }\n        }\n\n        .sim-flash {\n            animation-name: sim-flash-animation;\n            animation-duration: 0.1s;\n        }\n\n        @keyframes sim-flash-animation {\n            from { fill: yellow; }\n            to   { fill: default; }\n        }\n\n        .sim-flash-stroke {\n            animation-name: sim-flash-stroke-animation;\n            animation-duration: 0.4s;\n            animation-timing-function: ease-in;\n        }\n\n        @keyframes sim-flash-stroke-animation {\n            from { stroke: yellow; }\n            to   { stroke: default; }\n        }\n\n\n        .sim-sound-stroke {\n            stroke-width: 10px;\n            animation-name: sim-sound-stroke-animation;\n            animation-duration: 0.4s;\n        }\n\n        @keyframes sim-sound-stroke-animation {\n            from { stroke: yellow; }\n            to   { stroke: default; }\n        }\n\n        /* wireframe */\n        .sim-wireframe * {\n            fill: none;\n            stroke: black;\n        }\n        .sim-wireframe .sim-display,\n        .sim-wireframe .sim-led,\n        .sim-wireframe .sim-led-back,\n        .sim-wireframe .sim-head,\n        .sim-wireframe .sim-theme,\n        .sim-wireframe .sim-button-group,\n        .sim-wireframe .sim-button-label,\n        .sim-wireframe .sim-button,\n        .sim-wireframe .sim-text-pin\n        {\n            visibility: hidden;\n        }\n        .sim-wireframe .sim-label\n        {\n            stroke: none;\n            fill: #777;\n        }\n        .sim-wireframe .sim-board {\n            stroke-width: 2px;\n        }\n        *:focus {\n            outline: none;\n        }\n        .sim-button-outer:focus,\n        .sim-slide-switch:focus,\n        .sim-pin:focus,\n        .sim-thermometer:focus,\n        .sim-button-group:focus .sim-button-outer,\n        .sim-light-level-button:focus,\n        .sim-sound-level-button:focus {\n            stroke: #4D90FE;\n            stroke-width: 2px !important;\n         }\n        .no-drag {\n            user-drag: none;\n            user-select: none;\n            -moz-user-select: none;\n            -webkit-user-drag: none;\n            -webkit-user-select: none;\n            -ms-user-select: none;\n        }\n    ";
        var pinNames = [];
        var MB_WIDTH = 1795.6;
        var MB_HEIGHT = 1027.79999;
        visuals.themes = ["#3ADCFE"].map(function (accent) {
            return {
                accent: accent,
                pin: "#D4AF37",
                pinTouched: "#FFA500",
                pinActive: "#FF5500",
                ledOn: "#ff7777",
                ledOff: "transparent",
                buttonOuter: "#979797",
                buttonUps: ["#000", "#000", "#000", "#000"],
                buttonDown: "#FFA500",
                virtualButtonDown: "#FFA500",
                virtualButtonOuter: "#333",
                virtualButtonUp: "#FFF",
                lightLevelOn: "yellow",
                lightLevelOff: "#555",
                soundLevelOn: "#7f8c8d",
                soundLevelOff: "#555",
                gestureButtonOn: "#FFA500",
                gestureButtonOff: "#B4009E"
            };
        });
        function randomTheme() {
            return visuals.themes[Math.floor(Math.random() * visuals.themes.length)];
        }
        visuals.randomTheme = randomTheme;
        var BrainPadBoardSvg = /** @class */ (function () {
            function BrainPadBoardSvg(props) {
                var _this = this;
                this.props = props;
                this.pinNmToCoord = {};
                this.lastFlashTime = 0;
                this.fixPinIds();
                this.buildDom();
                if (props && props.wireframe)
                    pxsim.svg.addClass(this.element, "sim-wireframe");
                if (props && props.theme)
                    this.updateTheme();
                if (props && props.runtime) {
                    this.board = this.props.runtime.board;
                    this.board.updateSubscribers.push(function () { return _this.updateState(); });
                    this.updateState();
                    this.attachEvents();
                    this.initScreen();
                }
            }
            BrainPadBoardSvg.prototype.fixPinIds = function () {
                for (var _i = 0, pinNames_1 = pinNames; _i < pinNames_1.length; _i++) {
                    var pn = pinNames_1[_i];
                    var key = pxsim.getConfigKey(pn.name);
                    if (key != null)
                        pn.id = pxsim.getConfig(key);
                }
            };
            BrainPadBoardSvg.prototype.initScreen = function () {
                var _this = this;
                var requested = false;
                this.screenCanvas.width = this.board.screenState.width;
                this.screenCanvas.height = this.board.screenState.height;
                var ctx = this.screenCanvas.getContext("2d");
                ctx.imageSmoothingEnabled = false;
                var imgdata = ctx.getImageData(0, 0, this.board.screenState.width, this.board.screenState.height);
                var arr = new Uint32Array(imgdata.data.buffer);
                this.board.screenState.onChange = function () {
                    var flush = function () {
                        requested = false;
                        ctx.putImageData(imgdata, 0, 0);
                        _this.lcd.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", _this.screenCanvas.toDataURL());
                    };
                    // after we did one-time setup, redefine ourselves to be quicker
                    _this.board.screenState.onChange = function () {
                        arr.set(_this.board.screenState.screen);
                        // paint rect
                        pxsim.runtime.queueDisplayUpdate();
                        if (!requested) {
                            requested = true;
                            window.requestAnimationFrame(flush);
                        }
                    };
                    // and finally call the redefined self
                    _this.board.screenState.onChange();
                };
            };
            BrainPadBoardSvg.prototype.getView = function () {
                return {
                    el: this.element,
                    y: 0,
                    x: 0,
                    w: MB_WIDTH,
                    h: MB_HEIGHT
                };
            };
            BrainPadBoardSvg.prototype.getCoord = function (pinNm) {
                return this.pinNmToCoord[pinNm];
            };
            BrainPadBoardSvg.prototype.highlightPin = function (pinNm) {
                //TODO: for instructions
            };
            BrainPadBoardSvg.prototype.getPinDist = function () {
                return 10;
            };
            BrainPadBoardSvg.prototype.recordPinCoords = function () {
                var _this = this;
                pinNames.forEach(function (pin, i) {
                    var nm = pin.name;
                    var p = _this.pins[i];
                    var r = p.getBoundingClientRect();
                    _this.pinNmToCoord[nm] = [r.left + r.width / 2, r.top + r.height / 2];
                });
                console.log(JSON.stringify(this.pinNmToCoord, null, 2));
            };
            BrainPadBoardSvg.prototype.updateTheme = function () {
                var theme = this.props.theme;
                pxsim.svg.fills(this.buttonsOuter, theme.buttonOuter);
                pxsim.svg.fill(this.buttons[0], theme.buttonUps[0]);
                pxsim.svg.fill(this.buttons[1], theme.buttonUps[1]);
                pxsim.svg.fill(this.buttons[2], theme.buttonUps[2]);
                pxsim.svg.fill(this.buttons[3], theme.buttonUps[3]);
                // if (this.shakeButtonGroup) {
                //     svg.fill(this.shakeButtonGroup, this.props.theme.gestureButtonOff);
                // }
                pxsim.svg.setGradientColors(this.lightLevelGradient, theme.lightLevelOn, theme.lightLevelOff);
                pxsim.svg.setGradientColors(this.thermometerGradient, theme.ledOff, theme.ledOn);
                // svg.setGradientColors(this.soundLevelGradient, theme.soundLevelOn, theme.soundLevelOff);
                // for (const id in this.pinControls) {
                //     this.pinControls[id].updateTheme();
                // }
            };
            BrainPadBoardSvg.prototype.updateState = function () {
                var state = this.board;
                if (!state)
                    return;
                var theme = this.props.theme;
                var bpState = state.buttonState;
                var buttons = bpState.buttons;
                pxsim.svg.fill(this.buttons[0], buttons[0].pressed ? theme.buttonDown : theme.buttonUps[0]);
                pxsim.svg.fill(this.buttons[1], buttons[1].pressed ? theme.buttonDown : theme.buttonUps[1]);
                pxsim.svg.fill(this.buttons[2], buttons[2].pressed ? theme.buttonDown : theme.buttonUps[1]);
                pxsim.svg.fill(this.buttons[3], buttons[3].pressed ? theme.buttonDown : theme.buttonUps[1]);
                this.updateRgbLed();
                this.updateGestures();
                this.updateSound();
                this.updateLightLevel();
                this.updateTemperature();
                if (!pxsim.runtime || pxsim.runtime.dead)
                    pxsim.svg.addClass(this.element, "grayscale");
                else
                    pxsim.svg.removeClass(this.element, "grayscale");
            };
            BrainPadBoardSvg.prototype.flashSystemLed = function () {
                if (!this.systemLed)
                    this.systemLed = this.element.getElementById("LED_PWR-2");
                var now = Date.now();
                if (now - this.lastFlashTime > 150) {
                    this.lastFlashTime = now;
                    pxsim.svg.animate(this.systemLed, "sim-flash");
                }
            };
            BrainPadBoardSvg.prototype.updateRgbLed = function () {
                var state = this.board;
                if (!state)
                    return;
                var rgb = state.lightBulbState.getColor();
                if (this.rgbLed) {
                    if (!rgb || (rgb.length >= 3 && rgb[0] === 0 && rgb[1] === 0 && rgb[2] === 0)) {
                        // Clear the pixel
                        pxsim.svg.fill(this.rgbLed, "#feffe9");
                        pxsim.svg.filter(this.rgbLed, null);
                        this.rgbLed.style.strokeWidth = "0.28349999";
                        this.rgbLed.style.stroke = "#58595b";
                    }
                    else {
                        var hsl = visuals.rgbToHsl(rgb);
                        var h = hsl[0], s = hsl[1], l = hsl[2];
                        var lx = Math.max(l * 1.3, 85);
                        // at least 10% luminosity
                        l = l * 90 / 100 + 10;
                        this.rgbLed.style.stroke = "hsl(" + h + ", " + s + "%, " + Math.min(l * 3, 75) + "%)";
                        this.rgbLed.style.strokeWidth = "1.5";
                        pxsim.svg.fill(this.rgbLed, "hsl(" + h + ", " + s + "%, " + lx + "%)");
                        pxsim.svg.filter(this.rgbLed, "url(#neopixelglow)");
                        // let transform = l / 100 * 0.5;
                        // this.rgbLed.style.transform = `scale(${0.9 + transform})`;
                        // this.rgbLed.style.transformOrigin = "211.30725px 43.049255px";
                    }
                }
            };
            BrainPadBoardSvg.prototype.updateSound = function () {
                var state = this.board;
                if (!state || !state.audioState)
                    return;
                var audioState = state.audioState;
                var soundBoard = this.element.getElementById('BUZZER-2');
                if (audioState.isPlaying()) {
                    pxsim.svg.addClass(soundBoard, "sim-sound-stroke");
                }
                else {
                    pxsim.svg.removeClass(soundBoard, "sim-sound-stroke");
                }
            };
            BrainPadBoardSvg.prototype.updatePins = function () {
                var _this = this;
                var state = this.board;
                if (!state || !state.edgeConnectorState)
                    return;
                state.edgeConnectorState.pins.forEach(function (pin, i) { return _this.updatePin(pin, i); });
            };
            BrainPadBoardSvg.prototype.updatePin = function (pin, index) {
                if (!pin || !this.pins[index])
                    return;
                if (pin.used) {
                    if (this.pinControls[pin.id] === undefined) {
                        var pinName = pinNames.filter(function (a) { return a.id === pin.id; })[0];
                        if (pinName) {
                            this.pinControls[pin.id] = new visuals.AnalogPinControl(this, this.defs, pin.id, pinName.name);
                        }
                        else {
                            // TODO: Surface pin controls for sensor pins in some way?
                            this.pinControls[pin.id] = null;
                        }
                    }
                    if (this.pinControls[pin.id]) {
                        this.pinControls[pin.id].updateValue();
                    }
                }
            };
            BrainPadBoardSvg.prototype.updateLightLevel = function () {
                var _this = this;
                var state = this.board;
                if (!state || !state.lightSensorState.sensorUsed)
                    return;
                if (!this.lightLevelButton) {
                    var gid = "gradient-light-level";
                    this.lightLevelGradient = pxsim.svg.linearGradient(this.defs, gid);
                    var cy_1 = 590;
                    var r_1 = 50;
                    this.lightLevelButton = pxsim.svg.child(this.g, "circle", {
                        cx: "100px", cy: cy_1 + "px", r: r_1 + "px",
                        class: 'sim-light-level-button no-drag',
                        fill: "url(#" + gid + ")"
                    });
                    var pt_1 = this.element.createSVGPoint();
                    pxsim.svg.buttonEvents(this.lightLevelButton, 
                    // move
                    function (ev) {
                        var pos = pxsim.svg.cursorPoint(pt_1, _this.element, ev);
                        var rs = r_1 / 2;
                        var level = Math.max(0, Math.min(255, Math.floor((pos.y - (cy_1 - rs)) / (2 * rs) * 255)));
                        if (level != _this.board.lightSensorState.getLevel()) {
                            _this.board.lightSensorState.setLevel(level);
                            _this.applyLightLevel();
                        }
                    }, 
                    // start
                    function (ev) { }, 
                    // stop
                    function (ev) { }, 
                    // keydown
                    function (ev) {
                        var charCode = (typeof ev.which == "number") ? ev.which : ev.keyCode;
                        if (charCode === 40 || charCode === 37) {
                            if (_this.board.lightSensorState.getLevel() === 0) {
                                _this.board.lightSensorState.setLevel(255);
                            }
                            else {
                                _this.board.lightSensorState.setLevel(_this.board.lightSensorState.getLevel() - 1);
                            }
                            _this.applyLightLevel();
                        }
                        else if (charCode === 38 || charCode === 39) {
                            if (_this.board.lightSensorState.getLevel() === 255) {
                                _this.board.lightSensorState.setLevel(0);
                            }
                            else {
                                _this.board.lightSensorState.setLevel(_this.board.lightSensorState.getLevel() + 1);
                            }
                            _this.applyLightLevel();
                        }
                    });
                    this.lightLevelText = pxsim.svg.child(this.g, "text", { x: 70, y: cy_1 + r_1 - 130, text: '', class: 'sim-text' });
                    this.updateTheme();
                    pxsim.accessibility.makeFocusable(this.lightLevelButton);
                    pxsim.accessibility.setAria(this.lightLevelButton, "slider", "Light level");
                    this.lightLevelButton.setAttribute("aria-valuemin", "0");
                    this.lightLevelButton.setAttribute("aria-valuemax", "255");
                    this.lightLevelButton.setAttribute("aria-orientation", "vertical");
                    this.lightLevelButton.setAttribute("aria-valuenow", "128");
                }
                pxsim.svg.setGradientValue(this.lightLevelGradient, Math.min(100, Math.max(0, Math.floor(state.lightSensorState.getLevel() * 100 / 255))) + '%');
                this.lightLevelText.textContent = state.lightSensorState.getLevel().toString();
            };
            BrainPadBoardSvg.prototype.applyLightLevel = function () {
                var lv = this.board.lightSensorState.getLevel();
                pxsim.svg.setGradientValue(this.lightLevelGradient, Math.min(100, Math.max(0, Math.floor(lv * 100 / 255))) + '%');
                this.lightLevelText.textContent = lv.toString();
                this.lightLevelButton.setAttribute("aria-valuenow", lv.toString());
                pxsim.accessibility.setLiveContent(lv.toString());
            };
            BrainPadBoardSvg.prototype.updateTemperature = function () {
                var _this = this;
                var state = this.board;
                if (!state || !state.thermometerState || !state.thermometerState.sensorUsed)
                    return;
                // Celsius
                var tmin = -5;
                var tmax = 50;
                if (!this.thermometer) {
                    var gid = "gradient-thermometer";
                    this.thermometerGradient = pxsim.svg.linearGradient(this.defs, gid);
                    this.thermometer = pxsim.svg.child(this.g, "rect", {
                        class: "sim-thermometer no-drag",
                        x: 72,
                        y: 120,
                        width: 39,
                        height: 260,
                        rx: 2, ry: 2,
                        fill: "url(#" + gid + ")"
                    });
                    this.thermometerText = pxsim.svg.child(this.g, "text", { class: 'sim-text', x: 70, y: 100 });
                    this.updateTheme();
                    var pt_2 = this.element.createSVGPoint();
                    pxsim.svg.buttonEvents(this.thermometer, 
                    // move
                    function (ev) {
                        var cur = pxsim.svg.cursorPoint(pt_2, _this.element, ev);
                        var t = Math.max(0, Math.min(1, (380 - cur.y) / 160));
                        state.thermometerState.setLevel(Math.floor(tmin + t * (tmax - tmin)));
                        _this.updateTemperature();
                    }, 
                    // start
                    function (ev) { }, 
                    // stop
                    function (ev) { }, 
                    // keydown
                    function (ev) {
                        var charCode = (typeof ev.which == "number") ? ev.which : ev.keyCode;
                        if (charCode === 40 || charCode === 37) {
                            if (state.thermometerState.getLevel() === -5) {
                                state.thermometerState.setLevel(50);
                            }
                            else {
                                state.thermometerState.setLevel(state.thermometerState.getLevel() - 1);
                            }
                            _this.updateTemperature();
                        }
                        else if (charCode === 38 || charCode === 39) {
                            if (state.thermometerState.getLevel() === 50) {
                                state.thermometerState.setLevel(-5);
                            }
                            else {
                                state.thermometerState.setLevel(state.thermometerState.getLevel() + 1);
                            }
                            _this.updateTemperature();
                        }
                    });
                    pxsim.accessibility.makeFocusable(this.thermometer);
                    pxsim.accessibility.setAria(this.thermometer, "slider", "Thermometer");
                    this.thermometer.setAttribute("aria-valuemin", tmin.toString());
                    this.thermometer.setAttribute("aria-valuemax", tmax.toString());
                    this.thermometer.setAttribute("aria-orientation", "vertical");
                }
                var t = Math.max(tmin, Math.min(tmax, state.thermometerState.getLevel()));
                var per = Math.floor((state.thermometerState.getLevel() - tmin) / (tmax - tmin) * 100);
                pxsim.svg.setGradientValue(this.thermometerGradient, 100 - per + "%");
                var unit = "°C";
                if (state.thermometerUnitState == pxsim.TemperatureUnit.Fahrenheit) {
                    unit = "°F";
                    t = ((t * 18) / 10 + 32) >> 0;
                }
                this.thermometerText.textContent = t + unit;
                this.thermometer.setAttribute("aria-valuenow", t.toString());
                this.thermometer.setAttribute("aria-valuetext", t + unit);
                pxsim.accessibility.setLiveContent(t + unit);
            };
            BrainPadBoardSvg.prototype.updateGestures = function () {
                var _this = this;
                var state = this.board;
                if (state.accelerometerState.useShake && !this.shakeButtonGroup) {
                    var btnr = 2;
                    var width = 22;
                    var height = 10;
                    var btng_1 = pxsim.svg.child(this.g, "g", { class: "sim-button-group" });
                    this.shakeButtonGroup = btng_1;
                    this.shakeText = pxsim.svg.child(this.g, "text", { x: 81, y: 32, class: "sim-text small" });
                    this.shakeText.textContent = "SHAKE";
                    pxsim.svg.child(btng_1, "rect", { class: "sim-button-outer", x: 79, y: 25, rx: btnr, ry: btnr, width: width, height: height });
                    pxsim.svg.fill(btng_1, this.props.theme.gestureButtonOff);
                    pxsim.pointerEvents.down.forEach(function (evid) { return _this.shakeButtonGroup.addEventListener(evid, function (ev) {
                        var state = _this.board;
                        pxsim.svg.fill(btng_1, _this.props.theme.gestureButtonOn);
                        pxsim.svg.addClass(_this.shakeText, "inverted");
                    }); });
                    this.shakeButtonGroup.addEventListener(pxsim.pointerEvents.leave, function (ev) {
                        var state = _this.board;
                        pxsim.svg.fill(btng_1, _this.props.theme.gestureButtonOff);
                        pxsim.svg.removeClass(_this.shakeText, "inverted");
                    });
                    this.shakeButtonGroup.addEventListener(pxsim.pointerEvents.up, function (ev) {
                        var state = _this.board;
                        pxsim.svg.fill(btng_1, _this.props.theme.gestureButtonOff);
                        _this.board.bus.queue(13 /* DEVICE_ID_GESTURE */, 11); // GESTURE_SHAKE
                        pxsim.svg.removeClass(_this.shakeText, "inverted");
                    });
                    pxsim.accessibility.makeFocusable(this.shakeButtonGroup);
                    pxsim.accessibility.enableKeyboardInteraction(this.shakeButtonGroup, function () {
                        _this.board.bus.queue(13 /* DEVICE_ID_GESTURE */, 11);
                    });
                    pxsim.accessibility.setAria(this.shakeButtonGroup, "button", "Shake the board");
                }
            };
            BrainPadBoardSvg.prototype.buildDom = function () {
                var _this = this;
                this.element = new DOMParser().parseFromString(visuals.BOARD_SVG, "image/svg+xml").querySelector("svg");
                pxsim.svg.hydrate(this.element, {
                    "version": "1.0",
                    "viewBox": "0 0 " + MB_WIDTH + " " + MB_HEIGHT,
                    "class": "sim",
                    "x": "0px",
                    "y": "0px",
                    "width": MB_WIDTH + "px",
                    "height": MB_HEIGHT + "px",
                });
                this.style = pxsim.svg.child(this.element, "style", {});
                this.style.textContent = MB_STYLE;
                this.defs = pxsim.svg.child(this.element, "defs", {});
                this.g = pxsim.svg.elt("g");
                this.element.appendChild(this.g);
                // filters
                var glow = pxsim.svg.child(this.defs, "filter", { id: "filterglow", x: "-5%", y: "-5%", width: "120%", height: "120%" });
                pxsim.svg.child(glow, "feGaussianBlur", { stdDeviation: "5", result: "glow" });
                var merge = pxsim.svg.child(glow, "feMerge", {});
                for (var i = 0; i < 3; ++i)
                    pxsim.svg.child(merge, "feMergeNode", { in: "glow" });
                var neopixelglow = pxsim.svg.child(this.defs, "filter", { id: "neopixelglow", x: "-300%", y: "-300%", width: "600%", height: "600%" });
                pxsim.svg.child(neopixelglow, "feGaussianBlur", { stdDeviation: "4.3", result: "coloredBlur" });
                var neopixelmerge = pxsim.svg.child(neopixelglow, "feMerge", {});
                pxsim.svg.child(neopixelmerge, "feMergeNode", { in: "coloredBlur" });
                pxsim.svg.child(neopixelmerge, "feMergeNode", { in: "coloredBlur" });
                pxsim.svg.child(neopixelmerge, "feMergeNode", { in: "SourceGraphic" });
                this.rgbLed = this.element.getElementById("LIGHTBULB_LED");
                var lcdRect = this.element.getElementById("DISPLAY_SCREEN");
                this.lcd = pxsim.svg.child(lcdRect.parentElement, "image", { x: lcdRect.x.baseVal.value, y: lcdRect.y.baseVal.value, width: lcdRect.width.baseVal.value, height: lcdRect.height.baseVal.value });
                var btnids = ["BTN_L", "BTN_R", "BTN_U", "BTN_D"];
                var btnlabels = ["Left", "Right", "Up", "Down"];
                this.buttonsOuter = btnids.map(function (n, i) {
                    var btn = _this.element.getElementById(n + "_OUTER");
                    pxsim.accessibility.makeFocusable(btn);
                    pxsim.accessibility.setAria(btn, "button", btnlabels[i]);
                    return btn;
                });
                this.buttonsOuter.forEach(function (b) { return pxsim.svg.addClass(b, "sim-button-outer"); });
                this.buttons = btnids.map(function (n) { return _this.element.getElementById(n + "_INNER"); });
                this.buttons.forEach(function (b) { return pxsim.svg.addClass(b, "sim-button"); });
                this.screenCanvas = document.createElement("canvas");
            };
            BrainPadBoardSvg.prototype.mkBtn = function (left, top, label) {
                var btnr = 2;
                var btnw = 10;
                var btnn = 1.6;
                var btnnm = 2;
                var btnb = 3;
                var btng = pxsim.svg.child(this.g, "g", { class: "sim-button-group" });
                pxsim.accessibility.makeFocusable(btng);
                pxsim.accessibility.setAria(btng, "button", label);
                pxsim.svg.child(btng, "rect", { class: "sim-button-outer", x: left, y: top, rx: btnr, ry: btnr, width: btnw, height: btnw });
                var outer = btng;
                var inner = pxsim.svg.child(btng, "circle", {
                    class: "sim-button",
                    cx: left + btnw / 2,
                    cy: top + btnw / 2,
                    r: btnb
                });
                return { outer: outer, inner: inner };
            };
            BrainPadBoardSvg.prototype.attachEvents = function () {
                var _this = this;
                pxsim.Runtime.messagePosted = function (msg) {
                    switch (msg.type || "") {
                        case "serial":
                            _this.flashSystemLed();
                            break;
                    }
                };
                var bpState = this.board.buttonState;
                var stateButtons = bpState.buttons;
                this.buttonsOuter.forEach(function (btn, index) {
                    var button = stateButtons[index];
                    pxsim.pointerEvents.down.forEach(function (evid) { return btn.addEventListener(evid, function (ev) {
                        button.setPressed(true);
                        pxsim.svg.fill(_this.buttons[index], _this.props.theme.buttonDown);
                    }); });
                    btn.addEventListener(pxsim.pointerEvents.leave, function (ev) {
                        button.setPressed(false);
                        pxsim.svg.fill(_this.buttons[index], _this.props.theme.buttonUps[index]);
                    });
                    btn.addEventListener(pxsim.pointerEvents.up, function (ev) {
                        button.setPressed(false);
                        pxsim.svg.fill(_this.buttons[index], _this.props.theme.buttonUps[index]);
                    });
                    pxsim.accessibility.enableKeyboardInteraction(btn, function () {
                        button.setPressed(true);
                        pxsim.svg.fill(_this.buttons[index], _this.props.theme.buttonDown);
                    }, function () {
                        button.setPressed(false);
                        pxsim.svg.fill(_this.buttons[index], _this.props.theme.buttonUps[index]);
                    });
                });
            };
            return BrainPadBoardSvg;
        }());
        visuals.BrainPadBoardSvg = BrainPadBoardSvg;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        visuals.BOARD_SVG = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1696.4 929.4\"><defs><style>.cls-1,.cls-13,.cls-20,.cls-6,.cls-65,.cls-70,.cls-73,.cls-74{fill:#fff;}.cls-1,.cls-13,.cls-14,.cls-15,.cls-16,.cls-17,.cls-20,.cls-60,.cls-64,.cls-65,.cls-7,.cls-70,.cls-73,.cls-74,.cls-75{stroke:#000;}.cls-1,.cls-13,.cls-14,.cls-20,.cls-60,.cls-64,.cls-65,.cls-7,.cls-70,.cls-73,.cls-74,.cls-75{stroke-miterlimit:10;}.cls-1,.cls-15{stroke-width:10px;}.cls-2{fill:#ffb83f;}.cls-3{fill:#9a916c;}.cls-4{fill:#b4b4b4;}.cls-5{fill:#dcdcdc;}.cls-14,.cls-15,.cls-16,.cls-17,.cls-60,.cls-7,.cls-75{fill:none;}.cls-7,.cls-74{stroke-width:3px;}.cls-8{font-size:31.2px;}.cls-12,.cls-23,.cls-26,.cls-38,.cls-40,.cls-43,.cls-45,.cls-46,.cls-50,.cls-54,.cls-55,.cls-56,.cls-62,.cls-63,.cls-67,.cls-76,.cls-8{font-family:ArialMT, Arial;}.cls-9{fill:#ffc22a;}.cls-10{fill:#161413;}.cls-11{fill:#150000;}.cls-12{font-size:26px;}.cls-13,.cls-14{stroke-width:5px;}.cls-16,.cls-17{stroke-linejoin:round;}.cls-16{stroke-width:7.5px;}.cls-17{stroke-width:3.83px;}.cls-18{fill:#333;}.cls-19{fill:#777474;}.cls-21{fill:#898888;}.cls-22{fill:#ddd;}.cls-23,.cls-31{font-size:18px;}.cls-23{letter-spacing:-0.02em;}.cls-24,.cls-45{letter-spacing:-0.02em;}.cls-25{letter-spacing:-0.02em;}.cls-26{font-size:13.72px;letter-spacing:-0.03em;}.cls-27{letter-spacing:0em;}.cls-28{letter-spacing:0.03em;}.cls-29{letter-spacing:0.01em;}.cls-30{fill:red;}.cls-31,.cls-71,.cls-72{font-family:ArialNarrow, Arial;}.cls-31{letter-spacing:-0.01em;}.cls-32{letter-spacing:-0.02em;}.cls-33{letter-spacing:0em;}.cls-34{fill:#f0f0f0;}.cls-35{fill:#e29805;}.cls-36{fill:#4c4c4c;}.cls-37{fill:#848383;}.cls-38,.cls-40,.cls-43,.cls-45,.cls-46,.cls-50,.cls-54,.cls-55,.cls-56{font-size:24px;}.cls-38,.cls-44{letter-spacing:-0.01em;}.cls-39,.cls-46,.cls-62{letter-spacing:0.01em;}.cls-40{letter-spacing:0.01em;}.cls-41,.cls-56{letter-spacing:0.01em;}.cls-42{letter-spacing:-0.02em;}.cls-43,.cls-59{letter-spacing:0.02em;}.cls-47{letter-spacing:0em;}.cls-48{fill:#2a2a29;}.cls-49{fill:#595959;}.cls-50{letter-spacing:-0.01em;}.cls-51,.cls-55{letter-spacing:0.01em;}.cls-52{letter-spacing:-0.06em;}.cls-53{letter-spacing:-0.03em;}.cls-54,.cls-57{letter-spacing:0em;}.cls-58{letter-spacing:-0.01em;}.cls-60{stroke-width:9px;}.cls-61{fill:#1e1e1e;}.cls-62,.cls-63{font-size:40px;}.cls-63{letter-spacing:-0.05em;}.cls-64,.cls-65{stroke-width:2px;}.cls-66{fill:#e9e600;}.cls-67{font-size:26.55px;}.cls-68{fill:#400800;}.cls-69{letter-spacing:-0.11em;}.cls-70{stroke-width:6px;}.cls-71,.cls-72{font-size:22px;}.cls-71{letter-spacing:-0.01em;}.cls-73{stroke-width:4px;}.cls-76{font-size:16px;}</style></defs><title>BrainPad_BP2_RevC_5-8-18_MakeCodeStripDown_ID_RENAME10</title><g id=\"BRAINPAD_BASE\"><path id=\"WHITE_BACK\" class=\"cls-1\" d=\"M1692.7,939H117.1c-12.7,0-25.5.4-38.2,0-20.1-.6-35.4-14.2-36.3-34.8-.2-4.6,0-9.3,0-14V290.6c0-69.5-.8-139,0-208.5.3-25.4,18.7-38,41.9-38H1678.5c23.3,0,47.6,5.2,48.9,34.8,2.7,59.4,0,119.6,0,179V877.6C1727.4,903,1729.4,939,1692.7,939Z\" transform=\"translate(-37.2 -15.3)\"/><g id=\"BOARD_COMPONENTS\"><g id=\"Component2\"><g id=\"g2986\"><g id=\"g2988\"><g id=\"g2990\"><g id=\"g2992\"><rect id=\"connector209pin\" class=\"cls-2\" x=\"911.9\" y=\"273.1\" width=\"47.5\" height=\"37.52\"/></g></g></g></g><rect class=\"cls-3\" x=\"905.3\" y=\"279\" width=\"6.6\" height=\"26\"/><rect class=\"cls-3\" x=\"959.3\" y=\"278.8\" width=\"6.5\" height=\"26\"/></g><g id=\"Component1\"><rect id=\"rect4736\" class=\"cls-4\" x=\"730\" y=\"217.5\" width=\"58\" height=\"27.17\"/><path class=\"cls-3\" d=\"M810,233c-7.8,0-19.1-2.3-26.5,0s-8.7,23.7,0,26.5c5.5,1.7,21,1.7,26.5,0C817.6,257.1,819.6,233,810,233Z\" transform=\"translate(-37.2 -15.3)\"/></g><rect id=\"rect4730\" class=\"cls-5\" x=\"916.4\" y=\"214.9\" width=\"83.3\" height=\"13.97\" transform=\"translate(690.4 1162.6) rotate(-89.5)\"/><rect id=\"rect4732\" class=\"cls-5\" x=\"870.8\" y=\"212.5\" width=\"87.2\" height=\"13.97\" transform=\"translate(649.5 1116.6) rotate(-89.5)\"/><rect id=\"rect4734\" class=\"cls-5\" x=\"826.5\" y=\"212.8\" width=\"88.5\" height=\"13.97\" transform=\"translate(606 1073.2) rotate(-89.5)\"/><polyline id=\"rect4736-2\" data-name=\"rect4736\" class=\"cls-4\" points=\"913.6 233.7 914.2 159.9 928.2 160\"/><polyline id=\"rect4740\" class=\"cls-4\" points=\"826.3 232.9 826.9 159.1 840.9 159.2\"/><rect id=\"SLIDE_HOVER\" data-name=\"SLIDE HOVER\" x=\"882.2\" y=\"146.7\" width=\"64.5\" height=\"122.23\" transform=\"matrix(0.01, -1, 1, 0.01, 661.32, 1105.1)\"/><polygon id=\"polygon4744\" points=\"824.8 205.9 824.6 224.3 929.4 225.3 929.5 206.8 938.3 206.9 938.5 179.2 929.8 179.2 930 160.7 903.8 160.5 903.6 178.9 851.2 178.5 851.4 160 825.2 159.8 825 178.2 816.3 178.2 816 205.8 824.8 205.9\"/><rect id=\"SLIDE_INNER\" data-name=\"SLIDE INNER\" class=\"cls-5\" x=\"904.5\" y=\"139.1\" width=\"20.2\" height=\"52.77\" transform=\"translate(703.8 1063.4) rotate(-89.5)\"/></g><path id=\"BOTTOM_RIGHT_HOLE\" d=\"M1700,878.7c-44.7,0-43.6,66.3,0,66S1744.9,878.7,1700,878.7Zm-.2,53.5c-28,0-27.6-40.5,0-40.5S1727.8,932.2,1699.7,932.2Z\" transform=\"translate(-37.2 -15.3)\"/><path id=\"BOTTOM_LEFT_HOLE\" d=\"M77,875.2c-44.7,0-43.6,66.3,0,66S122,875.2,77,875.2Zm-.7,55.5c-28,0-27.6-40.5,0-40.5S104.4,930.7,76.3,930.7Z\" transform=\"translate(-37.2 -15.3)\"/><path id=\"TOP_RIGHT_HOLE\" d=\"M1698.5,41.3c-44.7,0-43.6,66.3,0,66S1743.4,41.3,1698.5,41.3Zm.3,54c-28,0-27.6-40.5,0-40.5S1726.8,95.3,1698.7,95.3Z\" transform=\"translate(-37.2 -15.3)\"/><path id=\"TOP_LEFT_HOLE\" d=\"M75,42.7c-44.7,0-43.8,66,0,66S120,42.7,75,42.7Zm.8,52.5c-27.8,0-27.8-40.5,0-40.5S103.6,95.2,75.8,95.2Z\" transform=\"translate(-37.2 -15.3)\"/></g><g id=\"SERVOS\"><g id=\"SERVOS_BASE\"><rect id=\"SERVO_BASE_OUTLINE\" x=\"1573.8\" y=\"124.1\" width=\"102\" height=\"229.2\"/><rect id=\"BOXFILL\" class=\"cls-6\" x=\"1578.6\" y=\"127.7\" width=\"91.8\" height=\"220.8\"/><rect id=\"DIVIDER\" x=\"1621.2\" y=\"298.3\" width=\"6.4\" height=\"52.4\"/><path id=\"SINEWAVE_ICON\" class=\"cls-7\" d=\"M1673.8,154.3a6.1,6.1,0,0,1-6.3,6.8c-5.1-.1-4-2.6-5.6-5.6s-1.4-6.3-6.5-6.3-6.7,2.3-6,6.4\" transform=\"translate(-37.2 -15.3)\"/><rect id=\"SERVO_ONE_BLACK_FILL\" x=\"1578\" y=\"152.9\" width=\"43.8\" height=\"146.4\"/><rect id=\"SERVO_TWO_BLACK_FILL\" x=\"1626.6\" y=\"152.3\" width=\"43.8\" height=\"146.8\"/></g><g id=\"SERVO_TWO\"><text class=\"cls-8\" transform=\"translate(1639.2 332.7)\">2</text><path id=\"SERVO_TWO_PIN_3\" class=\"cls-9\" d=\"M1701.6,199.4c0-18.6-28.8-18.6-28.8,0S1701.6,218,1701.6,199.4Z\" transform=\"translate(-37.2 -15.3)\"/><path id=\"SERVO_TWO_PIN_2\" class=\"cls-9\" d=\"M1701,244.4c0-18.6-28.8-18.6-28.8,0S1701,263,1701,244.4Z\" transform=\"translate(-37.2 -15.3)\"/><path id=\"SERVO_TWO_PIN_1\" class=\"cls-9\" d=\"M1701.6,290c0-18.6-28.8-18.6-28.8,0S1701.6,308.6,1701.6,290Z\" transform=\"translate(-37.2 -15.3)\"/></g><g id=\"SERVO_ONE\"><text class=\"cls-8\" transform=\"translate(1591.6 334.7)\">1</text><path id=\"SERVO_ONE_PIN_3\" class=\"cls-9\" d=\"M1650.4,200.6c0-18.6-28.8-18.6-28.8,0S1650.4,219.2,1650.4,200.6Z\" transform=\"translate(-37.2 -15.3)\"/><path id=\"SERVO_ONE_PIN_2\" class=\"cls-9\" d=\"M1651.2,245c0-18.6-28.8-18.6-28.8,0S1651.2,263.6,1651.2,245Z\" transform=\"translate(-37.2 -15.3)\"/><path id=\"SERVO_ONE_PIN_1\" class=\"cls-9\" d=\"M1650.6,289.4c0-18.6-28.8-18.6-28.8,0S1650.6,308,1650.6,289.4Z\" transform=\"translate(-37.2 -15.3)\"/></g><g id=\"SERVO_ARROW\"><path class=\"cls-10\" d=\"M1587.5,482.2c2.3-2.3,20.4.6,23.6.7s19-1.6,21.1.7.5,17.5.6,21.2-1.5,22,.6,23.5c-4.3-2.9-7-11-10.3-15.1a142.9,142.9,0,0,0-9.9-10.8c-2.6-2.6-23.8-22-25.7-20.1Z\" transform=\"translate(-37.2 -15.3)\"/><rect x=\"1495.5\" y=\"543.2\" width=\"140.3\" height=\"13\" transform=\"translate(3024.2 -183.8) rotate(135)\"/><path class=\"cls-11\" d=\"M1395.8,579.5H1330c-24,0-49-2-72.9,0-18.5,1.5-26.1,27.9-7.9,36.6,6.7,3.2,16.3,1.8,23.5,1.8h92.9c9.8,0,19.9.8,29.7,0C1418.5,616,1420,579.5,1395.8,579.5Z\" transform=\"translate(-37.2 -15.3)\"/><path class=\"cls-6\" d=\"M1395.9,582.4h-63.3c-24.3,0-49.5-1.8-73.7,0-14.6,1.1-25,20-9.9,29.6,6.2,3.9,16,2.4,23,2.4h87.2c11.5,0,23.3.9,34.7,0,6.4-.5,12.2-1.9,15.3-8.3C1414,596.1,1407.8,582.4,1395.9,582.4Z\" transform=\"translate(-37.2 -15.3)\"/><rect x=\"1066.1\" y=\"575.7\" width=\"137.7\" height=\"13\"/><text class=\"cls-12\" transform=\"translate(1211.8 591.2)\">Servo Motors</text><rect x=\"1375.3\" y=\"575.7\" width=\"107.8\" height=\"13\"/></g><g id=\"SERVO_ICON\"><line class=\"cls-13\" x1=\"1582.5\" y1=\"423.5\" x2=\"1619.4\" y2=\"459.4\"/><line class=\"cls-13\" x1=\"1619.7\" y1=\"485.7\" x2=\"1582.7\" y2=\"448.3\"/><line class=\"cls-13\" x1=\"1583.2\" y1=\"423.9\" x2=\"1583.3\" y2=\"449.7\"/><line class=\"cls-13\" x1=\"1618.8\" y1=\"459.4\" x2=\"1618.8\" y2=\"485.2\"/><line class=\"cls-13\" x1=\"1669.4\" y1=\"408.7\" x2=\"1618.8\" y2=\"459.7\"/><line class=\"cls-13\" x1=\"1668.7\" y1=\"438\" x2=\"1618.4\" y2=\"484.9\"/><line class=\"cls-13\" x1=\"1669.3\" y1=\"409.8\" x2=\"1668.4\" y2=\"438.6\"/><line class=\"cls-13\" x1=\"1599.3\" y1=\"408.1\" x2=\"1583.5\" y2=\"424.4\"/><line class=\"cls-13\" x1=\"1657.4\" y1=\"398\" x2=\"1632.2\" y2=\"374.8\"/><line class=\"cls-13\" x1=\"1607.2\" y1=\"398.7\" x2=\"1633\" y2=\"373.9\"/><path class=\"cls-14\" d=\"M1639.5,423.1c-3.4.2-10.8.6-10.2-4.7s7.1-4.3,11-4.2c8.1.1,19.7,3.4,22.9-6.4,1.3-3.9-1.5-8.8,3.9-10s5.3,5,6.4,8.6c3.8,11.9,13.2,6.5,23,6.6,3.9,0,9.6.3,10.3,5.4,1.1,7.7-8.3,5.8-12.8,5.5-9-.8-20-6.1-21.6,4.7-.5,3.6,1.3,10.1-3.8,11.8-8.1,2.7-4.3-10.2-5.5-13.2C1660.1,418.6,1646.3,422.8,1639.5,423.1Z\" transform=\"translate(-37.2 -15.3)\"/><path class=\"cls-13\" d=\"M1654.2,431.3c5.4,7.6,12.4-.1,8.8-6.1S1649,424,1654.2,431.3Z\" transform=\"translate(-37.2 -15.3)\"/><path class=\"cls-14\" d=\"M1680.6,430.9c-4.1,6.6-11.9.5-7.3-5.3S1684.6,424.4,1680.6,430.9Z\" transform=\"translate(-37.2 -15.3)\"/></g></g><g id=\"LIGHTBULB\"><g id=\"LIGHTBULB_OUTER\"><path class=\"cls-15\" d=\"M1628.1,584.5c-36.4-.5-63.1,23.2-69.8,58.3-2.5,13.1-1.7,26.3,4,38.6,4.8,10.3,12,20.2,19.3,28.9,3.6,4.3,8.1,8.2,10.7,13.3,7.2,14.6-2.7,35.8,12.5,45.6s49.1,9.2,52.7-13.3c1.7-10.5,1-22.3,5.5-32.1,3.8-8.3,11.5-15.4,17-22.7,10.8-14.2,18.9-28.5,18.2-46.7C1696.3,614.9,1668.4,584.9,1628.1,584.5Z\" transform=\"translate(-37.2 -15.3)\"/><path class=\"cls-16\" d=\"M1654.5,766.9c-11.2,18.2-43.8,17.6-55.7.4.3,9.1-1.7,21.9,5.3,28.9s19.1,9.7,29.2,7.7c8.3-1.6,17.7-5.3,20.7-13.9,2-5.8,2.3-17.6.5-23.1Z\" transform=\"translate(-37.2 -15.3)\"/><path class=\"cls-17\" d=\"M1599.2,773.1c13.2,16.1,43.5,20.7,55.9.5\" transform=\"translate(-37.2 -15.3)\"/><path class=\"cls-17\" d=\"M1600.2,780.2c10.6,20.3,42.8,19.3,54.3.4\" transform=\"translate(-37.2 -15.3)\"/><path class=\"cls-16\" d=\"M1654.9,779.5c-11.1,18.9-43.9,18.5-55.7.4-1.2,7.5-.8,20.6,2.7,27.4,5.2,10.2,20.5,13.2,30.6,11.5s19.3-5.6,21.9-14.9c1.9-6.5,2.5-18.1.5-24.4Z\" transform=\"translate(-37.2 -15.3)\"/></g><g id=\"LIGHTBULB_COMPONENT3\"><rect id=\"connector232pin\" class=\"cls-3\" x=\"1570.9\" y=\"790.3\" width=\"13.5\" height=\"13.51\"/><rect id=\"connector233pin\" class=\"cls-3\" x=\"1593.7\" y=\"790.3\" width=\"13.5\" height=\"13.51\"/><g id=\"g4754\"><g id=\"g4756\"><g id=\"_0402\" data-name=\" 0402\"><path id=\"path4759\" class=\"cls-5\" d=\"M1635.3,818c-4.1,0-14.2,2-17.6,0s-4.2-8.7-.4-11.3c1.7-1.1,15.1-.9,17,0S1640.6,818,1635.3,818Z\" transform=\"translate(-37.2 -15.3)\"/><rect id=\"rect4761\" class=\"cls-18\" x=\"1583.4\" y=\"791.5\" width=\"11.3\" height=\"11.26\"/></g></g></g></g><g id=\"LIGHTBULB_COMPONENT2\"><rect id=\"connector232pin-2\" data-name=\"connector232pin\" class=\"cls-3\" x=\"1570.9\" y=\"775.3\" width=\"13.5\" height=\"13.51\"/><rect id=\"connector233pin-2\" data-name=\"connector233pin\" class=\"cls-3\" x=\"1593.7\" y=\"775.3\" width=\"13.5\" height=\"13.51\"/><g id=\"g4754-2\" data-name=\"g4754\"><g id=\"g4756-2\" data-name=\"g4756\"><g id=\"_0402-2\" data-name=\" 0402\"><path id=\"path4759-2\" data-name=\"path4759\" class=\"cls-5\" d=\"M1635.3,803c-4.1,0-14.2,2-17.6,0s-4.2-8.7-.4-11.3c1.7-1.1,15.1-.9,17,0S1640.6,803,1635.3,803Z\" transform=\"translate(-37.2 -15.3)\"/><rect id=\"rect4761-2\" data-name=\"rect4761\" class=\"cls-18\" x=\"1583.4\" y=\"776.5\" width=\"11.3\" height=\"11.26\"/></g></g></g></g><g id=\"LIGHTBULB_COMPONENT1\"><rect id=\"connector232pin-3\" data-name=\"connector232pin\" class=\"cls-3\" x=\"1571.4\" y=\"758.6\" width=\"13.5\" height=\"13.51\"/><rect id=\"connector233pin-3\" data-name=\"connector233pin\" class=\"cls-3\" x=\"1594.2\" y=\"758.6\" width=\"13.5\" height=\"13.51\"/><g id=\"g4754-3\" data-name=\"g4754\"><g id=\"g4756-3\" data-name=\"g4756\"><g id=\"_0402-3\" data-name=\" 0402\"><path id=\"path4759-3\" data-name=\"path4759\" class=\"cls-5\" d=\"M1635.8,786.3c-4.1,0-14.2,2-17.6,0s-4.2-8.7-.4-11.3c1.7-1.1,15.1-.9,17,0S1641,786.3,1635.8,786.3Z\" transform=\"translate(-37.2 -15.3)\"/><rect id=\"rect4761-3\" data-name=\"rect4761\" class=\"cls-18\" x=\"1583.9\" y=\"759.7\" width=\"11.3\" height=\"11.26\"/></g></g></g></g><g id=\"LIGHTBULB_BASE\"><rect class=\"cls-19\" x=\"1543\" y=\"612.7\" width=\"10.8\" height=\"12\"/><rect class=\"cls-19\" x=\"1543\" y=\"635.7\" width=\"10.8\" height=\"12\"/><rect class=\"cls-19\" x=\"1543\" y=\"658.7\" width=\"10.8\" height=\"12\"/><rect class=\"cls-19\" x=\"1628.5\" y=\"611.7\" width=\"10.6\" height=\"12\"/><rect class=\"cls-19\" x=\"1628.5\" y=\"634.7\" width=\"10.6\" height=\"12\"/><rect class=\"cls-19\" x=\"1628.5\" y=\"657.7\" width=\"10.6\" height=\"12\"/></g><path id=\"LIGHTBULB_LED_OUTER\" d=\"M1587,614.7v80.7h82.7V614.7Zm78.7,78H1591V617.3h74.7Z\" transform=\"translate(-37.2 -15.3)\"/><g id=\"LIGHTBULB_ARROW\"><path class=\"cls-10\" d=\"M1519.2,622.3c3.3,0,13.9,14.8,16.1,17.2s14.5,12.3,14.3,15.4-11.9,12.7-14.4,15.4-16.5,14.5-16,17c-1-5.1,2.8-12.7,3.3-17.9a143.8,143.8,0,0,0,.6-14.6c0-3.6-1.3-32.4-3.9-32.4Z\" transform=\"translate(-37.2 -15.3)\"/><rect x=\"1429.4\" y=\"632.7\" width=\"59.4\" height=\"13\"/><rect x=\"1070.3\" y=\"634.2\" width=\"220.5\" height=\"13\"/><path class=\"cls-11\" d=\"M1452.9,636.5h-96c-6.1,0-14.6-1.3-20.4,1.2-13,5.6-13.1,30.4,0,35.9,5.9,2.5,14.3,1.2,20.4,1.2h76.8c7.2,0,16.6,1.5,23.7-.8C1473.9,668.8,1471.9,636.5,1452.9,636.5Z\" transform=\"translate(-37.2 -15.3)\"/><path class=\"cls-6\" d=\"M1453.2,639.4h-52.9c-18.7,0-39-2.3-57.6,0-13.3,1.6-19.3,22.8-6.7,30.2,5.2,3,13.5,1.7,19.2,1.7h73.6c7.8,0,16.2.9,23.9,0C1469.6,669.4,1471.4,639.4,1453.2,639.4Z\" transform=\"translate(-37.2 -15.3)\"/><text class=\"cls-12\" transform=\"translate(1303.8 648.3) scale(0.99 1)\">Light Bulb</text></g><path id=\"LIGHTBULB_LED\" class=\"cls-20\" d=\"M1660.1,655.7c0-40.6-62.7-40.2-62.7,0S1660.1,696.4,1660.1,655.7Z\" transform=\"translate(-37.2 -15.3)\"/></g><g id=\"BTN_RESET\"><g id=\"BTN_RESET_BASE\"><rect class=\"cls-21\" x=\"443.2\" y=\"323.6\" width=\"80.4\" height=\"5.36\" transform=\"translate(117.9 793) rotate(-89.8)\"/><rect class=\"cls-21\" x=\"528.9\" y=\"324\" width=\"80.4\" height=\"5.36\" transform=\"translate(202.8 879) rotate(-89.8)\"/></g><g id=\"BTN_RESET_OUTER\"><rect class=\"cls-19\" x=\"568.8\" y=\"295.5\" width=\"13.3\" height=\"7.2\" transform=\"translate(236.7 858) rotate(-89.8)\"/><rect class=\"cls-19\" x=\"568.5\" y=\"350.2\" width=\"13.3\" height=\"7.2\" transform=\"translate(181.8 912.2) rotate(-89.8)\"/><rect class=\"cls-19\" x=\"470.6\" y=\"294.7\" width=\"13.3\" height=\"7.39\" transform=\"translate(139.6 759) rotate(-89.8)\"/><rect class=\"cls-19\" x=\"470.3\" y=\"349.3\" width=\"13.3\" height=\"7.36\" transform=\"translate(84.7 813.2) rotate(-89.8)\"/><rect class=\"cls-22\" x=\"486.3\" y=\"281.4\" width=\"80.4\" height=\"90.04\" transform=\"translate(-35.8 -17.5) rotate(0.2)\"/></g><path id=\"BTN_RESET_INNER\" d=\"M526.6,302.3c-31.2-.1-31.4,49.7-.2,49.8S557.8,302.5,526.6,302.3Z\" transform=\"translate(-37.2 -15.3)\"/><g id=\"RESET\"><text class=\"cls-23\" transform=\"translate(459.5 261.3) rotate(0.1) scale(1.03 1)\">R<tspan class=\"cls-24\" x=\"12.6\" y=\"0\">ESE</tspan><tspan class=\"cls-25\" x=\"47.6\" y=\"0\">T</tspan></text></g></g><g id=\"BTN_BOOT0\"><g id=\"BTN_BOOT0_BASE\"><rect class=\"cls-21\" x=\"499.4\" y=\"196.3\" width=\"38.4\" height=\"2.56\" transform=\"translate(285.8 701.6) rotate(-90.2)\"/><rect class=\"cls-21\" x=\"543.4\" y=\"196.1\" width=\"38.3\" height=\"2.56\" transform=\"translate(330.1 745.5) rotate(-90.2)\"/></g><g id=\"BTN_BOOT0_OUTER\"><rect class=\"cls-22\" x=\"521.6\" y=\"176\" width=\"38.3\" height=\"42.95\" transform=\"translate(308.1 723.7) rotate(-90.2)\"/></g><path id=\"BTN_BOOT0_INNER\" d=\"M540.7,186c-14.9.1-14.7,23.8.1,23.8S555.7,185.9,540.7,186Z\" transform=\"translate(-37.2 -15.3)\"/><g id=\"BOOT0\"><text class=\"cls-26\" transform=\"translate(478.9 156.4) scale(1.03 1)\">B<tspan class=\"cls-27\" x=\"8.7\" y=\"0\">OO</tspan><tspan class=\"cls-28\" x=\"30.1\" y=\"0\">T</tspan><tspan class=\"cls-29\" x=\"38.8\" y=\"0\">0</tspan></text></g></g><g id=\"LED_PWR\"><path id=\"LED_PWR_BASE\" class=\"cls-5\" d=\"M560.6,82.6V99.9c0,6.5,1.4,7.9-4.7,9.4s-14.4,0-20.6,0c-3.2,0-13.2,1.7-15.6-1.4s0-14.1,0-17.3c0-6.2-1.3-7.6,4.1-9.4C526.9,80.2,560.6,80.5,560.6,82.6Z\" transform=\"translate(-37.2 -15.3)\"/><rect id=\"LED_PWR-2\" data-name=\"LED_PWR\" class=\"cls-30\" x=\"482.4\" y=\"71.2\" width=\"40.9\" height=\"17.59\"/><text class=\"cls-31\" transform=\"translate(486.4 59.1) scale(1.03 1)\">P<tspan class=\"cls-32\" x=\"9.7\" y=\"0\">W</tspan><tspan class=\"cls-33\" x=\"23.3\" y=\"0\">R</tspan></text></g><g id=\"USB\"><g id=\"USB_CONNECT\"><g id=\"_4uconn_20329\" data-name=\"4uconn_20329\"><rect class=\"cls-4\" x=\"778.8\" y=\"31.1\" width=\"135\" height=\"22.36\"/><rect class=\"cls-5\" x=\"844.7\" y=\"74.7\" width=\"3.4\" height=\"19.17\"/><rect class=\"cls-5\" x=\"833.7\" y=\"74.7\" width=\"3.4\" height=\"19.17\"/><rect class=\"cls-5\" x=\"822.7\" y=\"74.7\" width=\"3.4\" height=\"19.17\"/><rect class=\"cls-5\" x=\"855.7\" y=\"74.7\" width=\"3.4\" height=\"19.17\"/><rect class=\"cls-5\" x=\"866.6\" y=\"74.7\" width=\"3.4\" height=\"19.17\"/><rect class=\"cls-4\" x=\"804.2\" y=\"81.4\" width=\"84.4\" height=\"3.99\"/><rect x=\"804.2\" y=\"67.1\" width=\"84.4\" height=\"16.77\"/><polygon class=\"cls-5\" points=\"812.6 86.2 812.6 74.3 826.1 74.3 826.1 70.3 834.6 70.3 834.6 84.6 858.2 84.6 858.2 70.3 866.6 70.3 866.6 74.3 880.1 74.3 880.1 86.2 910.5 86.2 910.5 9.6 782.2 9.6 782.2 86.2 812.6 86.2\"/><polygon points=\"879.3 25.6 891.1 25.6 889.4 49.5 881 49.5 879.3 25.6\"/><polygon points=\"801.6 25.6 813.5 25.6 811.8 49.5 803.3 49.5 801.6 25.6\"/><polygon class=\"cls-34\" points=\"789 0 903.8 0 907.1 9.6 785.6 9.6 789 0\"/><polygon class=\"cls-4\" points=\"910.5 0 913.9 0 910.5 9.6 907.1 9.6 910.5 0\"/><polygon class=\"cls-4\" points=\"778.8 0 782.2 0 785.6 9.6 782.2 9.6 778.8 0\"/></g></g></g><g id=\"CPU\"><path d=\"M751,646.1l-.5,1.1-.3-.2.8-.9h0Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M918,559.9c3.5-5.2,8.7-7.5,6-14.5s-10.6-14.9-14.6-21.6c-1.7-2.8-7.5-17.9,1.3-12.9,1.1.6,1.4,4.3,2.8,5.6s5.9.9,6.9,2.8c-1.4,1.6-5.4.6-6.9.4V522c6.3-.9,6.3,11,10.2,15.3,1.8,1.9,16.8,9.1,16.7,9.5-.4,2.6-9.8-1.2-11.3-1.6,2.3,4.8,8.4,8.9,11.9,12.8s9,11.1,11.6,17.9c2,5.1,5.4,39.8-8.4,30.9-6.6-4.3,1.6-14.8,3.2-19.6,2.4-7.6.8-11.2-3.6-17.8-1.9-2.9-9.7-14.2-13.1-15.3s-8.6,3.9-12.2,6.2A.5.5,0,0,1,918,559.9Zm7.9-7.1c1.6-.2,3.3-2.5,1.1-3.5l-1.1,3.5Z\" transform=\"translate(-37.2 -15.3)\"/><rect class=\"cls-6\" x=\"740.9\" y=\"509.7\" width=\"212.9\" height=\"200.51\"/><g id=\"BRAIN_IMAGE\"><path d=\"M824.9,777.6c-11.5,3-21.2-9.2-33.4-5s-9.7,18.2-19.5,24.2c-1.5-.7,3.1-9.8,1.3-11.7s-13.8,3.2-18.5.3c20.4-1.9,31.3-13.6,28.4-34.7-2.6-18.9-11.6-40.4-33.9-38.2-8.5.8-13.7,3.4-21.9-1.2-6.7-3.8-11.9-10.3-16.8-16.1-1.8-2.1-12.1-12.5-8.8-15.4s12.4,12.3,9.8,12.8c.4,1.5.9,3,2.5,3.9,1.4,4.2,17.7,14.4,24.9,16.5,9.9,2.9,22.1,1,28.8-7.5,10.5-13.3-3.6-29-17.8-18.8a226.8,226.8,0,0,1-29.5-43l-11.4-21.4c-1.4-2.6-6.4-9-6.1-12,.1-1.2,16.9,8.9,18.3,9.9,9.3,7,7.8,15.2,8.9,26s9.5,23.5,21.6,23.5c9.1,0,14.8-11.3,21.1-16.5.8,1.3-2.7,9.3-3.1,11.1-1,5-1.9,9.8.2,14.6,4.9,11.1,21,17.9,32.2,13.5-.7-1.1-3.3-5-2-6.3,5.6,7.9,10.7,4.3,18.5,5.4a70.8,70.8,0,0,1,19.5,6.2c8.7,4.3,14.2,14.3,18,22.9,5.7,13.1-4.9,5.5-9.5-.9s-5.3-18-14.4-22.3c-24.5-11.6-58.5,20.3-44.7,44.9,7.7,13.8,35.7,18.7,37.3,35.2Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M817.6,444.6a4.3,4.3,0,0,1-3.7-1.6c-7.9,5.8-8.1-9.2-9.2-15.1-1.7-9,4.9-12.5,9.4-19.8s6.7-14.6-2.6-14.4c-2.4.1-9,.9-9.2,3.8s7.3-1.7,8.4-1.2c-1.7,6.2-7.9,22.1-14,25.6s-13.1,1.8-16.7,9.5c3.3-1.2,8.1-6.1,11.3-6s6.3,7,7.8,11.2c4.1,11.5,2.5,18.5-5.3,27.5-2.7,3.1-4.7,6.9-7.3,9.9-4.1,4.8-8.7,5.5-13.5,8.2s-5.6,6.2-13.2,5.1c-5.3-.8-9.8-3.9-14.8-5,3.5,7.1,16.6,5.9,22.2,8.8,10.9,5.7,4.6,24.8,5.1,35.2,3.9-.4,6,12.4,8.7-.4s3.9-25.2,7.5-37.7a106.2,106.2,0,0,1,11.4-25.8c2.2-3.7,5.2-8.1,8.4-10.9s7.7-4,11.3-7.1Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M1035,735.5c-12,1.2-21.9-4.9-31.9-10.6-8.2-4.7-16.4-9-24.9-2.7s-7.2,14.1-6.4,23.7,1.7,20.9-9.8,21.5c-.7-12.6,10.2-20.8,3-33.7-1.2-2.1-17.3-21.5-17.9-20.6s19.3-2.1,21.3-2.8c5-1.8,22.5-8.6,13.5-16,22.1,18.1,19.2,30.8,53.1,40.8A1.5,1.5,0,0,0,1035,735.5Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M953.7,803.5c23.2,7.3,10.8-5,23.7-13,3.7-2.3,6.1-12.1,10.3-15.5,9.3-7.6,3.6,6,.1,10-6,6.8-17.9,15.1-11,25.7s13.6-4.1,21.4,3.1c-3.3-3-45,24.7-44.8,25.2-.6-2.6,10.2-9.7,10.6-13.2.9-7.8-8.7-.6-8.9-3.3s11.4-3.7,12.5-6.8-2.1-5-4.4-6.5S953.5,803.5,953.7,803.5Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M1039.8,756c-2.2-3.4,4-7.2,5.2-9.7,1.8-4-1-6.8.2-10.2s12.2-7.7,14.2-3.9c.1.1-18,21.5-19.6,23.9Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M1048.3,516.1c-6.8,6-1.1,19.8-5.1,28-1.6-3.3.8-9.9,1-13.5.2-5.4-1.5-11.4,3.9-14.8l.2.3Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M772.7,567.4a26.1,26.1,0,0,0,.4,10.8A76.1,76.1,0,0,0,772.7,567.4Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M900.4,440.1c-2.1-1.9-4.3-4-6.8-6.3l-.2.2A17.2,17.2,0,0,0,900.4,440.1Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M675.4,614.8l-4-2.8A7,7,0,0,0,675.4,614.8Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M779.5,559.5a17.3,17.3,0,0,1,.9,9.4c1.9-4.2,5.2-18.3,1.3-22s-7,.9-9,3.9c-3.4,5.1-2.3,11.3.1,16.6A10.1,10.1,0,0,1,779.5,559.5Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M688,612.9c-5.6,2.3-9.7,2.8-12.6,1.9C682,619.1,688.6,621.4,688,612.9Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M1050.2,515.1c.2,1.9,1.4,2.5,3.2,2.4C1051.5,516.4,1050.2,515.5,1050.2,515.1Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M722.1,763.3h0Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M1047.7,464.3a29.7,29.7,0,0,0-3.9-2.2Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M1034.9,760.6l.2.9C1035.3,761,1035.3,760.6,1034.9,760.6Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M971.8,840.5v0Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M971.7,840.1v0Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M821.8,551c-6.8-26.4,4.7-33.9,20.4-52.4-2.7-2-9.3,4.7-11.5,6,1.7-8.7,5.1-15.6,9.5-23.1,2.9-5.1,10-13.6.5-12.5s-19,18.9-30.3,18c-.1,6.8,4.6,13.7,5.2,20.6.3,3,.7,7.1-1.7,9.4s-8.8.5-9.3,1.2c7.7,7.8,12.7,20.7,16.1,32.8Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M971.7,839.7a3.6,3.6,0,0,1,0-.6A3.4,3.4,0,0,0,971.7,839.7Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M1113.1,644.2c-1.7-40.6-11.4-81-24.3-119.5a530.4,530.4,0,0,0-24.3-60.5c-6.7-14-13.6-29.8-23.4-41.9-12.1-14.9-30.8-26.3-46.8-36.4-20.3-13-42.6-25.8-66.2-31.6-8.4-2.1-19.3-4-27.3.6a17.2,17.2,0,0,0-7.4,8.9c-2.4,6.2-1.6,6.2-8.4,8.4-8.6-12.6-38.6-10.4-51.2-10.3h0c-53.4,0-98.9,46-121.6,90.6-28.4,55.6-46.3,119.8-55.6,181.3-4.4,29.2-6.2,57.7,1.9,86.5s22.7,53.3,40,76.4c24.2,32.3,52.2,61.6,86.1,83.7,30.7,20,80.2,39.7,95-8.5,14.1,52.5,73.2,26.4,104.4,6.7,47.4-29.9,83.4-75.3,106.1-126.2C1105.2,718.6,1114.7,681.3,1113.1,644.2ZM883.7,460.9c.7-9.3,2.6-20.3,9.6-27-3.8-6.2-3.8-28.9-2-35,6.8,3.6,9.3,11.1,17.4,13.3,1.9-7.6-5-11.6-8.7-17.1-5.5-8.2-2.1-17.1,4.6-23.9,12.3-12.5,43.7-15.7,52.2,3,1.2-1.5.5-3,.6-4.4,17.1-1.2,14.7,32,16.6,41.4-8.8,1.9-15.7,3.5-23.4-1.8-1.1-.8-4.3-2.8-4.7-4-1.3-3.6-.7.5,1.5-3.3s7.6-7.5,9.2-13.7c-.8-.4-10.2,5.2-12.9,5.2a13.7,13.7,0,0,1-9.9-4.5c-1-1-8.4-12-6.4-13.6-.9.7-.3,15.2-.5,17-.4,5.1-2.4,12.2-1.6,17.2,1.2,7.1,2.1,12.7,11.5,15.4.4-3.2-2.2-11.7-1-13.9,2.2-4.2,15-2.6,18.5-1.8,12,2.8,33.1,12.1,21.4,27.5-7.8,10.3-26.5,9.9-37.9,9.5s-26.6-1.1-37.3-6.6a42.9,42.9,0,0,0,10.9,7.3c-13.6,3-19.5,19-26.5,29.1A27.7,27.7,0,0,1,883.7,460.9ZM694.1,532.1c1.8-5.8,3-15.8,10.7-10.8,4.9,3.2,7,12.5,8.6,17.5s9.9,30.4,6.7,33C705.4,561.1,692.5,553.6,694.1,532.1Zm381.6,226.7-.4-.3.4-.4.4.4Zm31.2-134.4c-.4,9-25.6,52-3.9,37.7,3.6,14.8-2.1,55.4-23.8,54.4-1-7.5-15.3-3.7-2.8,4.1-4.8,1.9-9.4,3.5-12.7,7.2,4.9-2.9,20.8-8.5,24-2.1,1.2,2.3-.8,7.5-1.4,9.8a115.9,115.9,0,0,1-13.9,31c-4.2,6.7-11.1,17.8-19.9,18.8-11.6,1.3-15.6-15.5-17.5-23.8-2.4,5.6-14.1,10.7-15,16.1-.4,2.9,4,4.1,5.2,7.3,1.9,5.1-.6,9.6-3,14.3,3.4-.5,5.4-6.3,6.3-9.1,49.9-2.6-25.4,45.1-26.7,37.5,1.1,6.6,9.7-.2,12.9.3,6.7,1.1,3,9.5.5,14.4-6.8,13.2-23.8,28.2-39,30.2.4-1.1,7.5-23.5,6.3-22.6,3.5-2.8,15.9.6,17.3-4.1-3-.2-26.1,1.3-28.2-5.3.7,2.8,4,5.9,5.7,7.5-6.1,2.7-12.4,3.7-19,4.6,5.1,3.6,13.4.7,18.7-1,0,8.3-8.1,8.9-13.1,12.5,4.2-1.3,6.7,2.3,11.5.7-3.6,6.8-24.8,27.8-26.1,10-.3-3.9,1.9-9.8-1.5-13s-10.1-.1-11.1,4.7,3.2,12.1,1.7,17.9c-2.1,7.7-10.3,6.7-16.8,4.7-18.3-5.4-34.2-27.3-33.4-46.4,4.8,1.9,9.2,3.6,14,5.2v-.2c-4.5-3.3-17.9-18.8-14.2-24.7,11,3.9,12.8-1.9,19-2.7-40.3-8.4,1-29.1,28.4-18.4l.2-.3c-6.5-6-43.6-15.1-42.9-13.8-7.8-13.8-.6-39.4,20.4-26.5l.6-1.4a46.4,46.4,0,0,0,10.2,9.5c-4.5-6.9.2-22.2-6.2-27.5s-9.7,5.2-14.2,9c-16.9,14.2-23.8-24.8-12.6-24,.9,3.2,4.1,8.3,8,8.9-6.3-25.8,5.4-16.8,26.5-18.8.5,1.1-9.4-3.2-14.1-7.4,2.3-1.5,4.6-2.9,6.9-4.1-6,0-14.8-1.8-20.4,0s-16.1,15.1-15.2,0h-7.2c.5,9.2,3.7,34.9-9.2,38.4-8.6,2.3-19.6-6.7-27-9.9-4.6-2-25.3-8.2-24.2,2.9.8,8.4,23.9,15,30.6,16.8-2.6,9.2,2.3,5.5,8.7,8.1,4.9,2,6.5,4.7,9.4,9.6,2.4-1.9,4.1-4.2,4.1-7.5,10.7,5.5,8.7,21.5,4.2,28.8,6.6,2.5,6.8,12,4.3,17.4-3.5,7.4-11.3,7.7-18.2,4.8,46,36.7-62.3,32.6-53.9,24.8-5,4.6,39,22.5,42.4,26.3,2.7-3.5,18.9-18.3,23-12.3s-8.4,20.2-11.7,24.1c-18.8,21.9-38.8-11-56.4-16.7,3.2,3.7,15.1,11.3,14.4,16.9s-9,4.7-13.2,3.2c-15.8-5.5-30.4-24.4-36.5-39.4-7.3-17.8,4.4-21.4,20.3-22.2,8-.4,44-2.4,47.2,8.6-1-3.6-11.5-6.2-14.4-7.3-9.9-3.8-20-7-30.1-10-7.1-2.1-39.3-15.1-43.6-5.5-5,11.1,29.9,37.5,12.7,45.4-14.2,6.6-35.4-27.6-36.2-38.9a15.4,15.4,0,0,1,11.5-.3c-5.8.2-32.6-26.3-33.7-28.5,11.1-.5,21.7-.7,32.5-3.2.9,12.7-2.4,4.3-6.3,13.8,5.3-1.1,10.5,4.6,15.1,3.4,1.5-5.5-.1-12,.4-17.7a23.3,23.3,0,0,0,4.6,3.8c-1.1,2.8,5.5-29.5,6.5-24.1-3.7-21.1-54.7-8.6-22.8-37.2-21.2,2.2-33.8-24.5-53.8-26.1-.6-6.7,56.6,74.3,46,67.1.9,1.3,7.5-2.3,7.8-2.5,1.6,6.4,2.7,11.5-2.9,15.3-2,1.3-9.3,5.6-10.9,6-11.2,2.9-26.3-13.9-32.1-21.2-8.8-11.1-16.2-24.5-18.9-38.5-1-5.2-1.7-11.1-.2-16.3.7-2.5,8-9.9,8-10.7-18-4.4-16-15.6-9-29.2,8-15.6,11.2-33.4,5.1-50.5,3.6,10.1-2-7.2,2.5-3.8-8.8-12.8,14.5-59.7,17.2-65.7l.7.4,2-6.4c7.5,8.6,8.6,15.4,8.5,26.2s7.3,16.8,16.9,22.2c25.9,14.5,59.2,10.9,79.7,35.3,1.5-6.1-8.4-13.6-11.5-18.5a86.3,86.3,0,0,1-11.6-27.3c-1.2,23.1-28.4,10.5-39,2.2-16-12.7-16.9-38.6-15.9-57.4.8-15.3,7.5-39.2,18.7-50,3.3-3.2,33.5-19.3,34.5-12.7-1.3-8.2-30,4.1-34,5.2-1.5-4.6-1.7-10.7-4.9-14.6,4.2,5.2-19.1,37.7-9.6,49.2-2.9,4.6-8.2,7.3-11.1,12.1-11.6-2.7-15.3-7.9-9.6-19.3,1.3,2.1,5.1,1.2,8.5-1-8.6-10.6-5.2-16.8,1.6-27.3-.3,4.3,4.2-.3,8,1q2.9-13.2,5.5-26.4a16.5,16.5,0,0,0,2.4,4.2c9-16.7,21-36.1,39.8-42.6,4.9-1.7,14.3-2.6,18.2-6.1s-2.1-4-6.8-4.8c1-4.6,31.6-19.9,34.7-20.8l.2.3c8.8-5.7,18.8,8.4,16.4,17.7,14.5-1.4,18.8-22.6,35-17,19.7,6.7,8.6,30.9,9.7,45.5-5.1-1.3-19.8-16.9-22.9-15.1.7-.4,7.7,9.1,8.2,11.6l-6.4,1.9v.4c16.4,2.8,24.8,2.7,22,21.6q-3.4-1.4-6.8-3a12,12,0,0,1,0,1.5c11.9,3.7,2,24.2,2.6,34.3-3.6-.5-7.3-1.4-10.9-.9,24.2,12.9,6,22.8-11.3,29.5,21.5,21.5,20.5,7.6,14.4,51l3.7-3a29.3,29.3,0,0,1,2.9,5.9h7.8c.4-16.1-3.1-47.8,12.6-58.8,7.5-5.3,19.4-3.3,27.5-8.1s2-10.4-5.8-7.3c-6,2.4-17,13.4-21.5,4.7-6.9-13.2,9.8-26,19.6-30.1s25.1-7.5,36.3-3c36,14.2-7.8,49.3-14.9,67.9,6.4,0,10.6-.9,15.9-3.7.7-.3.6-3.2,0-3.5,8.6,3.8,16.2,12.8,21.6,20.3,2.2,3.1,19.4,25.4,16.1,28.9,15.8-16.5-11.7-41.6-19-55.8-4.5-8.7-8.3-22.6.7-30.2,7.1-6,17.2.1,24.2,3.6s18.5,13,26.8,11.9c2.1-.3,6.9-1.8,6-5.2s-6.2-1.4-8.5-1.2c-6.3.5-21.4,5-21.5-5,0-4.5,15.3-23.3,16.3-21.2s-23.2-3.2-25.8-4.3c-17.4-7.5,1.8-14.4,11.5-16.8-5.2-13.4-8.2-13,9.3-11.7-4.1-4.4-12.1-4.4-17.5-2.8-3-4.6-12.6-17.2-5.2-21.5s23,5,28,7.5c22.4,11.5,34.8,37.9,42.9,60.6a13.9,13.9,0,0,1-6.5-1.9c7.8,5.3,9.7,11.5,2.5,17.9-2.2,2-14.9,7.4-14.5,10.8.7,6.3,15.9-4.6,19.5-4,11.4,2.1,17,28,19,37.1-17.5-11.8-1.5-10.2-20.7-8.7,9.1,5.2,47.3,60.2,22.8,54.6,8.2,19.9,38.8,10.4,21.3,41.8,2.3,1.5,5.8-1.5,7.8-2.4C1107.3,616,1107.1,619.7,1106.9,624.4ZM843.7,861v.2h-.3v-.3Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M1055.3,613.1c-6.4-3.8-.7,16.1.1,12.2-4.7,23.7-13.1,45-39.8,45.8-9.7.3-59.5-2.1-54.5,15.4,21.7-12.1,40.3-8.6,53.4,13.4C1021.5,688.9,1086,631.4,1055.3,613.1Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M796.3,663.8c-2.7,5.5-4,11,0,17.2Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M734.7,810.7a1.2,1.2,0,0,1-1.1,1.1A1.1,1.1,0,0,0,734.7,810.7Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M858.3,814.8a13,13,0,0,0-4.8-2.4Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M823.8,801.2c-6.3-4-9.3-9.3-14.1-14.3-15.8,14.8,42.8,25.3,43.9,25.6C842.7,806.6,830,797,823.8,801.2Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M846.8,866c-1.2,1.6,1.2,1.3,0,0Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M932.3,837.9c-1.3-4.1-5.4-7.3-6.8-11.8,2.4.3,4.5.9,7,0-4.2-1.9-11.5-3.1-19-4.4C920.1,825.7,929.3,838.4,932.3,837.9Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M971.8,840.5h0Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M910.8,820.5a12.1,12.1,0,0,0-3.4,0l6.2,1.2A7.7,7.7,0,0,0,910.8,820.5Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M1058.2,581.8c-5-4.7-7.6-13.2-10.1-19.4-.5-1.3-4.7-15.2-5.2-15.3s-20.1,19.5-22.3,21.3c-8.2,6.7-16.3,14-25,20-3.9-4.6-3.8-8.4-6.8-13.8,4.7,19.3-14.8,41.6-31.4,38.1,5.2,10.7-4,19.1-5,31.4,4.2-5.9,47-25.8,47-23.2,0-4.3-3-7.9-2.8-12,.2-6.9,8.2-14.4,12.8-18.7,14.7-13.7,34.9-17,51.9-5.2A25.1,25.1,0,0,0,1058.2,581.8Zm-82,42.6a111.5,111.5,0,0,0-15.5,9.2c2.4-3.2,12-13.6,16.6-9.8Z\" transform=\"translate(-37.2 -15.3)\"/></g><g id=\"CPU-2\" data-name=\"CPU\"><rect class=\"cls-6\" x=\"740.3\" y=\"508.7\" width=\"210.8\" height=\"197.59\"/><g id=\"g1499\"><g id=\"g1501\"><g id=\"g1503\"><g id=\"g1505\"><g id=\"g1507\"><g id=\"g1509\"><g id=\"g1511\"><rect id=\"connector48pin\" class=\"cls-3\" x=\"785\" y=\"503.5\" width=\"5.9\" height=\"30.09\"/></g></g></g></g></g></g></g><g id=\"g1499-2\" data-name=\"g1499\"><g id=\"g1501-2\" data-name=\"g1501\"><g id=\"g1503-2\" data-name=\"g1503\"><g id=\"g1505-2\" data-name=\"g1505\"><g id=\"g1507-2\" data-name=\"g1507\"><g id=\"g1509-2\" data-name=\"g1509\"><g id=\"g1511-2\" data-name=\"g1511\"><rect id=\"connector48pin-2\" data-name=\"connector48pin\" class=\"cls-3\" x=\"796.8\" y=\"503.5\" width=\"5.9\" height=\"30.09\"/></g></g></g></g></g></g></g><g id=\"g1499-3\" data-name=\"g1499\"><g id=\"g1501-3\" data-name=\"g1501\"><g id=\"g1503-3\" data-name=\"g1503\"><g id=\"g1505-3\" data-name=\"g1505\"><g id=\"g1507-3\" data-name=\"g1507\"><g id=\"g1509-3\" data-name=\"g1509\"><g id=\"g1511-3\" data-name=\"g1511\"><rect id=\"connector48pin-3\" data-name=\"connector48pin\" class=\"cls-3\" x=\"808.5\" y=\"503.5\" width=\"5.9\" height=\"30.09\"/></g></g></g></g></g></g></g><g id=\"g1499-4\" data-name=\"g1499\"><g id=\"g1501-4\" data-name=\"g1501\"><g id=\"g1503-4\" data-name=\"g1503\"><g id=\"g1505-4\" data-name=\"g1505\"><g id=\"g1507-4\" data-name=\"g1507\"><g id=\"g1509-4\" data-name=\"g1509\"><g id=\"g1511-4\" data-name=\"g1511\"><rect id=\"connector48pin-4\" data-name=\"connector48pin\" class=\"cls-3\" x=\"820.2\" y=\"503.5\" width=\"5.9\" height=\"30.09\"/></g></g></g></g></g></g></g><g id=\"g1499-5\" data-name=\"g1499\"><g id=\"g1501-5\" data-name=\"g1501\"><g id=\"g1503-5\" data-name=\"g1503\"><g id=\"g1505-5\" data-name=\"g1505\"><g id=\"g1507-5\" data-name=\"g1507\"><g id=\"g1509-5\" data-name=\"g1509\"><g id=\"g1511-5\" data-name=\"g1511\"><rect id=\"connector48pin-5\" data-name=\"connector48pin\" class=\"cls-3\" x=\"831.9\" y=\"503.5\" width=\"5.9\" height=\"30.09\"/></g></g></g></g></g></g></g><g id=\"g1499-6\" data-name=\"g1499\"><g id=\"g1501-6\" data-name=\"g1501\"><g id=\"g1503-6\" data-name=\"g1503\"><g id=\"g1505-6\" data-name=\"g1505\"><g id=\"g1507-6\" data-name=\"g1507\"><g id=\"g1509-6\" data-name=\"g1509\"><g id=\"g1511-6\" data-name=\"g1511\"><rect id=\"connector48pin-6\" data-name=\"connector48pin\" class=\"cls-3\" x=\"843.6\" y=\"503.5\" width=\"5.9\" height=\"30.09\"/></g></g></g></g></g></g></g><g id=\"g1499-7\" data-name=\"g1499\"><g id=\"g1501-7\" data-name=\"g1501\"><g id=\"g1503-7\" data-name=\"g1503\"><g id=\"g1505-7\" data-name=\"g1505\"><g id=\"g1507-7\" data-name=\"g1507\"><g id=\"g1509-7\" data-name=\"g1509\"><g id=\"g1511-7\" data-name=\"g1511\"><rect id=\"connector48pin-7\" data-name=\"connector48pin\" class=\"cls-3\" x=\"855.3\" y=\"503.5\" width=\"5.9\" height=\"30.09\"/></g></g></g></g></g></g></g><g id=\"g1499-8\" data-name=\"g1499\"><g id=\"g1501-8\" data-name=\"g1501\"><g id=\"g1503-8\" data-name=\"g1503\"><g id=\"g1505-8\" data-name=\"g1505\"><g id=\"g1507-8\" data-name=\"g1507\"><g id=\"g1509-8\" data-name=\"g1509\"><g id=\"g1511-8\" data-name=\"g1511\"><rect id=\"connector48pin-8\" data-name=\"connector48pin\" class=\"cls-3\" x=\"867\" y=\"503.5\" width=\"5.9\" height=\"30.09\"/></g></g></g></g></g></g></g><g id=\"g1499-9\" data-name=\"g1499\"><g id=\"g1501-9\" data-name=\"g1501\"><g id=\"g1503-9\" data-name=\"g1503\"><g id=\"g1505-9\" data-name=\"g1505\"><g id=\"g1507-9\" data-name=\"g1507\"><g id=\"g1509-9\" data-name=\"g1509\"><g id=\"g1511-9\" data-name=\"g1511\"><rect id=\"connector48pin-9\" data-name=\"connector48pin\" class=\"cls-3\" x=\"878.7\" y=\"503.5\" width=\"5.9\" height=\"30.09\"/></g></g></g></g></g></g></g><g id=\"g1499-10\" data-name=\"g1499\"><g id=\"g1501-10\" data-name=\"g1501\"><g id=\"g1503-10\" data-name=\"g1503\"><g id=\"g1505-10\" data-name=\"g1505\"><g id=\"g1507-10\" data-name=\"g1507\"><g id=\"g1509-10\" data-name=\"g1509\"><g id=\"g1511-10\" data-name=\"g1511\"><rect id=\"connector48pin-10\" data-name=\"connector48pin\" class=\"cls-3\" x=\"890.4\" y=\"503.5\" width=\"5.9\" height=\"30.09\"/></g></g></g></g></g></g></g><g id=\"g1499-11\" data-name=\"g1499\"><g id=\"g1501-11\" data-name=\"g1501\"><g id=\"g1503-11\" data-name=\"g1503\"><g id=\"g1505-11\" data-name=\"g1505\"><g id=\"g1507-11\" data-name=\"g1507\"><g id=\"g1509-11\" data-name=\"g1509\"><g id=\"g1511-11\" data-name=\"g1511\"><rect id=\"connector48pin-11\" data-name=\"connector48pin\" class=\"cls-3\" x=\"902.2\" y=\"503.5\" width=\"5.9\" height=\"30.09\"/></g></g></g></g></g></g></g><g id=\"g1499-12\" data-name=\"g1499\"><g id=\"g1501-12\" data-name=\"g1501\"><g id=\"g1503-12\" data-name=\"g1503\"><g id=\"g1505-12\" data-name=\"g1505\"><g id=\"g1507-12\" data-name=\"g1507\"><g id=\"g1509-12\" data-name=\"g1509\"><g id=\"g1511-12\" data-name=\"g1511\"><rect id=\"connector48pin-12\" data-name=\"connector48pin\" class=\"cls-3\" x=\"773.3\" y=\"503.5\" width=\"5.9\" height=\"30.09\"/></g></g></g></g></g></g></g><g id=\"g1499-13\" data-name=\"g1499\"><g id=\"g1501-13\" data-name=\"g1501\"><g id=\"g1503-13\" data-name=\"g1503\"><g id=\"g1505-13\" data-name=\"g1505\"><g id=\"g1507-13\" data-name=\"g1507\"><g id=\"g1509-13\" data-name=\"g1509\"><g id=\"g1511-13\" data-name=\"g1511\"><rect id=\"connector48pin-13\" data-name=\"connector48pin\" class=\"cls-3\" x=\"913.9\" y=\"503.5\" width=\"5.9\" height=\"30.09\"/></g></g></g></g></g></g></g><g id=\"g1499-14\" data-name=\"g1499\"><g id=\"g1501-14\" data-name=\"g1501\"><g id=\"g1503-14\" data-name=\"g1503\"><g id=\"g1505-14\" data-name=\"g1505\"><g id=\"g1507-14\" data-name=\"g1507\"><g id=\"g1509-14\" data-name=\"g1509\"><g id=\"g1511-14\" data-name=\"g1511\"><rect id=\"connector48pin-14\" data-name=\"connector48pin\" class=\"cls-3\" x=\"926.7\" y=\"660.8\" width=\"32.1\" height=\"5.52\"/></g></g></g></g></g></g></g><g id=\"g1499-15\" data-name=\"g1499\"><g id=\"g1501-15\" data-name=\"g1501\"><g id=\"g1503-15\" data-name=\"g1503\"><g id=\"g1505-15\" data-name=\"g1505\"><g id=\"g1507-15\" data-name=\"g1507\"><g id=\"g1509-15\" data-name=\"g1509\"><g id=\"g1511-15\" data-name=\"g1511\"><rect id=\"connector48pin-15\" data-name=\"connector48pin\" class=\"cls-3\" x=\"926.7\" y=\"649.8\" width=\"32.1\" height=\"5.52\"/></g></g></g></g></g></g></g><g id=\"g1499-16\" data-name=\"g1499\"><g id=\"g1501-16\" data-name=\"g1501\"><g id=\"g1503-16\" data-name=\"g1503\"><g id=\"g1505-16\" data-name=\"g1505\"><g id=\"g1507-16\" data-name=\"g1507\"><g id=\"g1509-16\" data-name=\"g1509\"><g id=\"g1511-16\" data-name=\"g1511\"><rect id=\"connector48pin-16\" data-name=\"connector48pin\" class=\"cls-3\" x=\"926.7\" y=\"638.9\" width=\"32.1\" height=\"5.52\"/></g></g></g></g></g></g></g><g id=\"g1499-17\" data-name=\"g1499\"><g id=\"g1501-17\" data-name=\"g1501\"><g id=\"g1503-17\" data-name=\"g1503\"><g id=\"g1505-17\" data-name=\"g1505\"><g id=\"g1507-17\" data-name=\"g1507\"><g id=\"g1509-17\" data-name=\"g1509\"><g id=\"g1511-17\" data-name=\"g1511\"><rect id=\"connector48pin-17\" data-name=\"connector48pin\" class=\"cls-3\" x=\"926.7\" y=\"627.9\" width=\"32.1\" height=\"5.52\"/></g></g></g></g></g></g></g><g id=\"g1499-18\" data-name=\"g1499\"><g id=\"g1501-18\" data-name=\"g1501\"><g id=\"g1503-18\" data-name=\"g1503\"><g id=\"g1505-18\" data-name=\"g1505\"><g id=\"g1507-18\" data-name=\"g1507\"><g id=\"g1509-18\" data-name=\"g1509\"><g id=\"g1511-18\" data-name=\"g1511\"><rect id=\"connector48pin-18\" data-name=\"connector48pin\" class=\"cls-3\" x=\"926.7\" y=\"616.9\" width=\"32.1\" height=\"5.52\"/></g></g></g></g></g></g></g><g id=\"g1499-19\" data-name=\"g1499\"><g id=\"g1501-19\" data-name=\"g1501\"><g id=\"g1503-19\" data-name=\"g1503\"><g id=\"g1505-19\" data-name=\"g1505\"><g id=\"g1507-19\" data-name=\"g1507\"><g id=\"g1509-19\" data-name=\"g1509\"><g id=\"g1511-19\" data-name=\"g1511\"><rect id=\"connector48pin-19\" data-name=\"connector48pin\" class=\"cls-3\" x=\"926.7\" y=\"605.9\" width=\"32.1\" height=\"5.52\"/></g></g></g></g></g></g></g><g id=\"g1499-20\" data-name=\"g1499\"><g id=\"g1501-20\" data-name=\"g1501\"><g id=\"g1503-20\" data-name=\"g1503\"><g id=\"g1505-20\" data-name=\"g1505\"><g id=\"g1507-20\" data-name=\"g1507\"><g id=\"g1509-20\" data-name=\"g1509\"><g id=\"g1511-20\" data-name=\"g1511\"><rect id=\"connector48pin-20\" data-name=\"connector48pin\" class=\"cls-3\" x=\"926.7\" y=\"595\" width=\"32.1\" height=\"5.52\"/></g></g></g></g></g></g></g><g id=\"g1499-21\" data-name=\"g1499\"><g id=\"g1501-21\" data-name=\"g1501\"><g id=\"g1503-21\" data-name=\"g1503\"><g id=\"g1505-21\" data-name=\"g1505\"><g id=\"g1507-21\" data-name=\"g1507\"><g id=\"g1509-21\" data-name=\"g1509\"><g id=\"g1511-21\" data-name=\"g1511\"><rect id=\"connector48pin-21\" data-name=\"connector48pin\" class=\"cls-3\" x=\"926.7\" y=\"584\" width=\"32.1\" height=\"5.52\"/></g></g></g></g></g></g></g><g id=\"g1499-22\" data-name=\"g1499\"><g id=\"g1501-22\" data-name=\"g1501\"><g id=\"g1503-22\" data-name=\"g1503\"><g id=\"g1505-22\" data-name=\"g1505\"><g id=\"g1507-22\" data-name=\"g1507\"><g id=\"g1509-22\" data-name=\"g1509\"><g id=\"g1511-22\" data-name=\"g1511\"><rect id=\"connector48pin-22\" data-name=\"connector48pin\" class=\"cls-3\" x=\"926.7\" y=\"573\" width=\"32.1\" height=\"5.52\"/></g></g></g></g></g></g></g><g id=\"g1499-23\" data-name=\"g1499\"><g id=\"g1501-23\" data-name=\"g1501\"><g id=\"g1503-23\" data-name=\"g1503\"><g id=\"g1505-23\" data-name=\"g1505\"><g id=\"g1507-23\" data-name=\"g1507\"><g id=\"g1509-23\" data-name=\"g1509\"><g id=\"g1511-23\" data-name=\"g1511\"><rect id=\"connector48pin-23\" data-name=\"connector48pin\" class=\"cls-3\" x=\"926.7\" y=\"562\" width=\"32.1\" height=\"5.52\"/></g></g></g></g></g></g></g><g id=\"g1499-24\" data-name=\"g1499\"><g id=\"g1501-24\" data-name=\"g1501\"><g id=\"g1503-24\" data-name=\"g1503\"><g id=\"g1505-24\" data-name=\"g1505\"><g id=\"g1507-24\" data-name=\"g1507\"><g id=\"g1509-24\" data-name=\"g1509\"><g id=\"g1511-24\" data-name=\"g1511\"><rect id=\"connector48pin-24\" data-name=\"connector48pin\" class=\"cls-3\" x=\"926.7\" y=\"551\" width=\"32.1\" height=\"5.52\"/></g></g></g></g></g></g></g><g id=\"g1499-25\" data-name=\"g1499\"><g id=\"g1501-25\" data-name=\"g1501\"><g id=\"g1503-25\" data-name=\"g1503\"><g id=\"g1505-25\" data-name=\"g1505\"><g id=\"g1507-25\" data-name=\"g1507\"><g id=\"g1509-25\" data-name=\"g1509\"><g id=\"g1511-25\" data-name=\"g1511\"><rect id=\"connector48pin-25\" data-name=\"connector48pin\" class=\"cls-3\" x=\"926.7\" y=\"671.8\" width=\"32.1\" height=\"5.52\"/></g></g></g></g></g></g></g><g id=\"g1499-26\" data-name=\"g1499\"><g id=\"g1501-26\" data-name=\"g1501\"><g id=\"g1503-26\" data-name=\"g1503\"><g id=\"g1505-26\" data-name=\"g1505\"><g id=\"g1507-26\" data-name=\"g1507\"><g id=\"g1509-26\" data-name=\"g1509\"><g id=\"g1511-26\" data-name=\"g1511\"><rect id=\"connector48pin-26\" data-name=\"connector48pin\" class=\"cls-3\" x=\"926.7\" y=\"540.1\" width=\"32.1\" height=\"5.52\"/></g></g></g></g></g></g></g><g id=\"g1499-27\" data-name=\"g1499\"><g id=\"g1501-27\" data-name=\"g1501\"><g id=\"g1503-27\" data-name=\"g1503\"><g id=\"g1505-27\" data-name=\"g1505\"><g id=\"g1507-27\" data-name=\"g1507\"><g id=\"g1509-27\" data-name=\"g1509\"><g id=\"g1511-27\" data-name=\"g1511\"><rect id=\"connector48pin-27\" data-name=\"connector48pin\" class=\"cls-3\" x=\"785\" y=\"683.8\" width=\"5.9\" height=\"30.09\"/></g></g></g></g></g></g></g><g id=\"g1499-28\" data-name=\"g1499\"><g id=\"g1501-28\" data-name=\"g1501\"><g id=\"g1503-28\" data-name=\"g1503\"><g id=\"g1505-28\" data-name=\"g1505\"><g id=\"g1507-28\" data-name=\"g1507\"><g id=\"g1509-28\" data-name=\"g1509\"><g id=\"g1511-28\" data-name=\"g1511\"><rect id=\"connector48pin-28\" data-name=\"connector48pin\" class=\"cls-3\" x=\"796.8\" y=\"683.8\" width=\"5.9\" height=\"30.09\"/></g></g></g></g></g></g></g><g id=\"g1499-29\" data-name=\"g1499\"><g id=\"g1501-29\" data-name=\"g1501\"><g id=\"g1503-29\" data-name=\"g1503\"><g id=\"g1505-29\" data-name=\"g1505\"><g id=\"g1507-29\" data-name=\"g1507\"><g id=\"g1509-29\" data-name=\"g1509\"><g id=\"g1511-29\" data-name=\"g1511\"><rect id=\"connector48pin-29\" data-name=\"connector48pin\" class=\"cls-3\" x=\"808.5\" y=\"683.8\" width=\"5.9\" height=\"30.09\"/></g></g></g></g></g></g></g><g id=\"g1499-30\" data-name=\"g1499\"><g id=\"g1501-30\" data-name=\"g1501\"><g id=\"g1503-30\" data-name=\"g1503\"><g id=\"g1505-30\" data-name=\"g1505\"><g id=\"g1507-30\" data-name=\"g1507\"><g id=\"g1509-30\" data-name=\"g1509\"><g id=\"g1511-30\" data-name=\"g1511\"><rect id=\"connector48pin-30\" data-name=\"connector48pin\" class=\"cls-3\" x=\"820.2\" y=\"683.8\" width=\"5.9\" height=\"30.09\"/></g></g></g></g></g></g></g><g id=\"g1499-31\" data-name=\"g1499\"><g id=\"g1501-31\" data-name=\"g1501\"><g id=\"g1503-31\" data-name=\"g1503\"><g id=\"g1505-31\" data-name=\"g1505\"><g id=\"g1507-31\" data-name=\"g1507\"><g id=\"g1509-31\" data-name=\"g1509\"><g id=\"g1511-31\" data-name=\"g1511\"><rect id=\"connector48pin-31\" data-name=\"connector48pin\" class=\"cls-3\" x=\"831.9\" y=\"683.8\" width=\"5.9\" height=\"30.09\"/></g></g></g></g></g></g></g><g id=\"g1499-32\" data-name=\"g1499\"><g id=\"g1501-32\" data-name=\"g1501\"><g id=\"g1503-32\" data-name=\"g1503\"><g id=\"g1505-32\" data-name=\"g1505\"><g id=\"g1507-32\" data-name=\"g1507\"><g id=\"g1509-32\" data-name=\"g1509\"><g id=\"g1511-32\" data-name=\"g1511\"><rect id=\"connector48pin-32\" data-name=\"connector48pin\" class=\"cls-3\" x=\"843.6\" y=\"683.8\" width=\"5.9\" height=\"30.09\"/></g></g></g></g></g></g></g><g id=\"g1499-33\" data-name=\"g1499\"><g id=\"g1501-33\" data-name=\"g1501\"><g id=\"g1503-33\" data-name=\"g1503\"><g id=\"g1505-33\" data-name=\"g1505\"><g id=\"g1507-33\" data-name=\"g1507\"><g id=\"g1509-33\" data-name=\"g1509\"><g id=\"g1511-33\" data-name=\"g1511\"><rect id=\"connector48pin-33\" data-name=\"connector48pin\" class=\"cls-3\" x=\"855.3\" y=\"683.8\" width=\"5.9\" height=\"30.09\"/></g></g></g></g></g></g></g><g id=\"g1499-34\" data-name=\"g1499\"><g id=\"g1501-34\" data-name=\"g1501\"><g id=\"g1503-34\" data-name=\"g1503\"><g id=\"g1505-34\" data-name=\"g1505\"><g id=\"g1507-34\" data-name=\"g1507\"><g id=\"g1509-34\" data-name=\"g1509\"><g id=\"g1511-34\" data-name=\"g1511\"><rect id=\"connector48pin-34\" data-name=\"connector48pin\" class=\"cls-3\" x=\"867\" y=\"683.8\" width=\"5.9\" height=\"30.09\"/></g></g></g></g></g></g></g><g id=\"g1499-35\" data-name=\"g1499\"><g id=\"g1501-35\" data-name=\"g1501\"><g id=\"g1503-35\" data-name=\"g1503\"><g id=\"g1505-35\" data-name=\"g1505\"><g id=\"g1507-35\" data-name=\"g1507\"><g id=\"g1509-35\" data-name=\"g1509\"><g id=\"g1511-35\" data-name=\"g1511\"><rect id=\"connector48pin-35\" data-name=\"connector48pin\" class=\"cls-3\" x=\"878.7\" y=\"683.8\" width=\"5.9\" height=\"30.09\"/></g></g></g></g></g></g></g><g id=\"g1499-36\" data-name=\"g1499\"><g id=\"g1501-36\" data-name=\"g1501\"><g id=\"g1503-36\" data-name=\"g1503\"><g id=\"g1505-36\" data-name=\"g1505\"><g id=\"g1507-36\" data-name=\"g1507\"><g id=\"g1509-36\" data-name=\"g1509\"><g id=\"g1511-36\" data-name=\"g1511\"><rect id=\"connector48pin-36\" data-name=\"connector48pin\" class=\"cls-3\" x=\"890.4\" y=\"683.8\" width=\"5.9\" height=\"30.09\"/></g></g></g></g></g></g></g><g id=\"g1499-37\" data-name=\"g1499\"><g id=\"g1501-37\" data-name=\"g1501\"><g id=\"g1503-37\" data-name=\"g1503\"><g id=\"g1505-37\" data-name=\"g1505\"><g id=\"g1507-37\" data-name=\"g1507\"><g id=\"g1509-37\" data-name=\"g1509\"><g id=\"g1511-37\" data-name=\"g1511\"><rect id=\"connector48pin-37\" data-name=\"connector48pin\" class=\"cls-3\" x=\"902.2\" y=\"683.8\" width=\"5.9\" height=\"30.09\"/></g></g></g></g></g></g></g><g id=\"g1499-38\" data-name=\"g1499\"><g id=\"g1501-38\" data-name=\"g1501\"><g id=\"g1503-38\" data-name=\"g1503\"><g id=\"g1505-38\" data-name=\"g1505\"><g id=\"g1507-38\" data-name=\"g1507\"><g id=\"g1509-38\" data-name=\"g1509\"><g id=\"g1511-38\" data-name=\"g1511\"><rect id=\"connector48pin-38\" data-name=\"connector48pin\" class=\"cls-3\" x=\"773.3\" y=\"683.8\" width=\"5.9\" height=\"30.09\"/></g></g></g></g></g></g></g><g id=\"g1499-39\" data-name=\"g1499\"><g id=\"g1501-39\" data-name=\"g1501\"><g id=\"g1503-39\" data-name=\"g1503\"><g id=\"g1505-39\" data-name=\"g1505\"><g id=\"g1507-39\" data-name=\"g1507\"><g id=\"g1509-39\" data-name=\"g1509\"><g id=\"g1511-39\" data-name=\"g1511\"><rect id=\"connector48pin-39\" data-name=\"connector48pin\" class=\"cls-3\" x=\"913.9\" y=\"683.8\" width=\"5.9\" height=\"30.09\"/></g></g></g></g></g></g></g><g id=\"g1499-40\" data-name=\"g1499\"><g id=\"g1501-40\" data-name=\"g1501\"><g id=\"g1503-40\" data-name=\"g1503\"><g id=\"g1505-40\" data-name=\"g1505\"><g id=\"g1507-40\" data-name=\"g1507\"><g id=\"g1509-40\" data-name=\"g1509\"><g id=\"g1511-40\" data-name=\"g1511\"><rect id=\"connector48pin-40\" data-name=\"connector48pin\" class=\"cls-3\" x=\"733.5\" y=\"660.8\" width=\"32.1\" height=\"5.52\"/></g></g></g></g></g></g></g><g id=\"g1499-41\" data-name=\"g1499\"><g id=\"g1501-41\" data-name=\"g1501\"><g id=\"g1503-41\" data-name=\"g1503\"><g id=\"g1505-41\" data-name=\"g1505\"><g id=\"g1507-41\" data-name=\"g1507\"><g id=\"g1509-41\" data-name=\"g1509\"><g id=\"g1511-41\" data-name=\"g1511\"><rect id=\"connector48pin-41\" data-name=\"connector48pin\" class=\"cls-3\" x=\"733.5\" y=\"649.8\" width=\"32.1\" height=\"5.52\"/></g></g></g></g></g></g></g><g id=\"g1499-42\" data-name=\"g1499\"><g id=\"g1501-42\" data-name=\"g1501\"><g id=\"g1503-42\" data-name=\"g1503\"><g id=\"g1505-42\" data-name=\"g1505\"><g id=\"g1507-42\" data-name=\"g1507\"><g id=\"g1509-42\" data-name=\"g1509\"><g id=\"g1511-42\" data-name=\"g1511\"><rect id=\"connector48pin-42\" data-name=\"connector48pin\" class=\"cls-3\" x=\"733.5\" y=\"638.9\" width=\"32.1\" height=\"5.52\"/></g></g></g></g></g></g></g><g id=\"g1499-43\" data-name=\"g1499\"><g id=\"g1501-43\" data-name=\"g1501\"><g id=\"g1503-43\" data-name=\"g1503\"><g id=\"g1505-43\" data-name=\"g1505\"><g id=\"g1507-43\" data-name=\"g1507\"><g id=\"g1509-43\" data-name=\"g1509\"><g id=\"g1511-43\" data-name=\"g1511\"><rect id=\"connector48pin-43\" data-name=\"connector48pin\" class=\"cls-3\" x=\"733.5\" y=\"627.9\" width=\"32.1\" height=\"5.52\"/></g></g></g></g></g></g></g><g id=\"g1499-44\" data-name=\"g1499\"><g id=\"g1501-44\" data-name=\"g1501\"><g id=\"g1503-44\" data-name=\"g1503\"><g id=\"g1505-44\" data-name=\"g1505\"><g id=\"g1507-44\" data-name=\"g1507\"><g id=\"g1509-44\" data-name=\"g1509\"><g id=\"g1511-44\" data-name=\"g1511\"><rect id=\"connector48pin-44\" data-name=\"connector48pin\" class=\"cls-3\" x=\"733.5\" y=\"616.9\" width=\"32.1\" height=\"5.52\"/></g></g></g></g></g></g></g><g id=\"g1499-45\" data-name=\"g1499\"><g id=\"g1501-45\" data-name=\"g1501\"><g id=\"g1503-45\" data-name=\"g1503\"><g id=\"g1505-45\" data-name=\"g1505\"><g id=\"g1507-45\" data-name=\"g1507\"><g id=\"g1509-45\" data-name=\"g1509\"><g id=\"g1511-45\" data-name=\"g1511\"><rect id=\"connector48pin-45\" data-name=\"connector48pin\" class=\"cls-3\" x=\"733.5\" y=\"605.9\" width=\"32.1\" height=\"5.52\"/></g></g></g></g></g></g></g><g id=\"g1499-46\" data-name=\"g1499\"><g id=\"g1501-46\" data-name=\"g1501\"><g id=\"g1503-46\" data-name=\"g1503\"><g id=\"g1505-46\" data-name=\"g1505\"><g id=\"g1507-46\" data-name=\"g1507\"><g id=\"g1509-46\" data-name=\"g1509\"><g id=\"g1511-46\" data-name=\"g1511\"><rect id=\"connector48pin-46\" data-name=\"connector48pin\" class=\"cls-3\" x=\"733.5\" y=\"595\" width=\"32.1\" height=\"5.52\"/></g></g></g></g></g></g></g><g id=\"g1499-47\" data-name=\"g1499\"><g id=\"g1501-47\" data-name=\"g1501\"><g id=\"g1503-47\" data-name=\"g1503\"><g id=\"g1505-47\" data-name=\"g1505\"><g id=\"g1507-47\" data-name=\"g1507\"><g id=\"g1509-47\" data-name=\"g1509\"><g id=\"g1511-47\" data-name=\"g1511\"><rect id=\"connector48pin-47\" data-name=\"connector48pin\" class=\"cls-3\" x=\"733.5\" y=\"584\" width=\"32.1\" height=\"5.52\"/></g></g></g></g></g></g></g><g id=\"g1499-48\" data-name=\"g1499\"><g id=\"g1501-48\" data-name=\"g1501\"><g id=\"g1503-48\" data-name=\"g1503\"><g id=\"g1505-48\" data-name=\"g1505\"><g id=\"g1507-48\" data-name=\"g1507\"><g id=\"g1509-48\" data-name=\"g1509\"><g id=\"g1511-48\" data-name=\"g1511\"><rect id=\"connector48pin-48\" data-name=\"connector48pin\" class=\"cls-3\" x=\"733.5\" y=\"573\" width=\"32.1\" height=\"5.52\"/></g></g></g></g></g></g></g><g id=\"g1499-49\" data-name=\"g1499\"><g id=\"g1501-49\" data-name=\"g1501\"><g id=\"g1503-49\" data-name=\"g1503\"><g id=\"g1505-49\" data-name=\"g1505\"><g id=\"g1507-49\" data-name=\"g1507\"><g id=\"g1509-49\" data-name=\"g1509\"><g id=\"g1511-49\" data-name=\"g1511\"><rect id=\"connector48pin-49\" data-name=\"connector48pin\" class=\"cls-3\" x=\"733.5\" y=\"562\" width=\"32.1\" height=\"5.52\"/></g></g></g></g></g></g></g><g id=\"g1499-50\" data-name=\"g1499\"><g id=\"g1501-50\" data-name=\"g1501\"><g id=\"g1503-50\" data-name=\"g1503\"><g id=\"g1505-50\" data-name=\"g1505\"><g id=\"g1507-50\" data-name=\"g1507\"><g id=\"g1509-50\" data-name=\"g1509\"><g id=\"g1511-50\" data-name=\"g1511\"><rect id=\"connector48pin-50\" data-name=\"connector48pin\" class=\"cls-3\" x=\"733.5\" y=\"551\" width=\"32.1\" height=\"5.52\"/></g></g></g></g></g></g></g><g id=\"g1499-51\" data-name=\"g1499\"><g id=\"g1501-51\" data-name=\"g1501\"><g id=\"g1503-51\" data-name=\"g1503\"><g id=\"g1505-51\" data-name=\"g1505\"><g id=\"g1507-51\" data-name=\"g1507\"><g id=\"g1509-51\" data-name=\"g1509\"><g id=\"g1511-51\" data-name=\"g1511\"><rect id=\"connector48pin-51\" data-name=\"connector48pin\" class=\"cls-3\" x=\"733.5\" y=\"671.8\" width=\"32.1\" height=\"5.52\"/></g></g></g></g></g></g></g><g id=\"g1499-52\" data-name=\"g1499\"><g id=\"g1501-52\" data-name=\"g1501\"><g id=\"g1503-52\" data-name=\"g1503\"><g id=\"g1505-52\" data-name=\"g1505\"><g id=\"g1507-52\" data-name=\"g1507\"><g id=\"g1509-52\" data-name=\"g1509\"><g id=\"g1511-52\" data-name=\"g1511\"><rect id=\"connector48pin-52\" data-name=\"connector48pin\" class=\"cls-3\" x=\"733.5\" y=\"540.1\" width=\"32.1\" height=\"5.52\"/></g></g></g></g></g></g></g><g id=\"g3713\"><g id=\"g3715\"><g id=\"tqfn44_7mm\" data-name=\"tqfn44 7mm\"><g id=\"g3718\"><g id=\"g3720\"><g id=\"g3722\"><g id=\"g3724\"><rect id=\"rect3726\" class=\"cls-18\" x=\"764\" y=\"531.9\" width=\"164.8\" height=\"154.49\"/></g></g></g></g></g></g></g></g></g><g id=\"BUZZER\"><g id=\"BUZZER_OUTER\"><path class=\"cls-7\" d=\"M1483,720.5c15.6,31.6,23.9,77.4.5,121.8\" transform=\"translate(-37.2 -15.3)\"/><path class=\"cls-7\" d=\"M1502.7,729.1c31,27.2,36.7,81.1-.3,106.4\" transform=\"translate(-37.2 -15.3)\"/><path class=\"cls-7\" d=\"M1513.1,709.5c48,29.4,48.6,116-.5,144.4\" transform=\"translate(-37.2 -15.3)\"/><path class=\"cls-7\" d=\"M1523.5,689.5c10.6,9.7,20.5,17.1,27.9,29.7,10.8,18.5,17.4,37,18.2,58.5,1.5,36-11.5,77-44.2,96.3\" transform=\"translate(-37.2 -15.3)\"/><rect x=\"1468\" y=\"861\" width=\"3.5\" height=\"35.5\" transform=\"translate(3050.5 302.4) rotate(130)\"/><rect x=\"1444.8\" y=\"825.7\" width=\"3\" height=\"51\"/><rect x=\"1470\" y=\"670.5\" width=\"3.5\" height=\"35.5\" transform=\"translate(2119.6 2146.2) rotate(-140)\"/><rect x=\"1444.5\" y=\"657.9\" width=\"3\" height=\"48.5\"/><rect id=\"BUZZER_BASE4\" class=\"cls-19\" x=\"1228.3\" y=\"671.7\" width=\"20.5\" height=\"15.5\"/><rect id=\"BUZZER_BASE3\" class=\"cls-19\" x=\"1395.8\" y=\"672.7\" width=\"20.5\" height=\"15.5\"/><rect id=\"BUZZER_BASE2\" class=\"cls-19\" x=\"1226.8\" y=\"854.7\" width=\"20.5\" height=\"15.5\"/><rect id=\"BUZZER_BASE1\" class=\"cls-19\" x=\"1395.8\" y=\"854.7\" width=\"20.5\" height=\"15.5\"/></g><rect id=\"BUZZER-2\" data-name=\"BUZZER\" x=\"1226.8\" y=\"681.7\" width=\"200\" height=\"180\"/><path id=\"BUZZER_CIRCLE\" class=\"cls-5\" d=\"M1445.8,731c0-20.4-31.7-20.4-31.7,0S1445.8,751.4,1445.8,731Z\" transform=\"translate(-37.2 -15.3)\"/><g id=\"BUZZER_ARROW\"><path class=\"cls-10\" d=\"M1226,843.3c3.3,0,14,14.8,16.2,17.2s14.6,12.4,14.4,15.4-12,12.7-14.5,15.4-16.6,14.5-16.2,17c-1-5.1,2.8-12.7,3.4-17.9a142.9,142.9,0,0,0,.6-14.6c0-3.6-1.3-32.4-4-32.4Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M970.5,871c-2.1,2.9-4.8,7.5-9,7.9V884H1060V871Z\" transform=\"translate(-37.2 -15.3)\"/><rect x=\"1148.3\" y=\"854.7\" width=\"48.5\" height=\"13\"/><path class=\"cls-11\" d=\"M1168.4,858h-80c-6.3,0-13.5-.8-19.3,1.9-15,7.1-14.2,29.4,1.5,35.2,5.6,2.1,12.8,1.2,18.7,1.2h64.4c7.2,0,16.2,1.2,22.9-1.9C1194.5,885.9,1188.5,858,1168.4,858Z\" transform=\"translate(-37.2 -15.3)\"/><path class=\"cls-6\" d=\"M1169.5,860.9h-47.8c-15.1,0-33.7-3.1-48.5.3s-17.4,24.3-3,30.4c5.1,2.1,11.8,1.3,17.2,1.3h64.6c6.2,0,12.9.8,19.1-.2C1190.1,889.6,1189.7,860.9,1169.5,860.9Z\" transform=\"translate(-37.2 -15.3)\"/><text class=\"cls-12\" transform=\"translate(1047.8 869.7)\">Buzzer</text></g></g><g id=\"DISPLAY\"><path id=\"DISPLAY_COMPONENT4\" class=\"cls-19\" d=\"M1348.5,56.6c-18-3.2-19.8,28.8-5.8,32.8C1362.1,95.1,1361.1,56.6,1348.5,56.6Z\" transform=\"translate(-37.2 -15.3)\"/><path id=\"DISPLAY_COMPONENT3\" class=\"cls-19\" d=\"M1379.7,57.2c-18-3.2-19.8,28.8-5.8,32.8C1393.4,95.7,1392.3,57.2,1379.7,57.2Z\" transform=\"translate(-37.2 -15.3)\"/><path id=\"DISPLAY_COMPONENT2\" class=\"cls-19\" d=\"M1409.4,56.6c-18-3.2-19.8,28.8-5.8,32.8C1423,95.1,1422,56.6,1409.4,56.6Z\" transform=\"translate(-37.2 -15.3)\"/><path id=\"DISPLAY_COMPONENT1\" class=\"cls-19\" d=\"M1440.6,57.2c-18-3.2-19.8,28.8-5.8,32.8C1454.2,95.7,1453.2,57.2,1440.6,57.2Z\" transform=\"translate(-37.2 -15.3)\"/><path id=\"DISPLAY_BASE2\" class=\"cls-35\" d=\"M1214.3,364.1v17.1c0,6-2.3,17.2,0,22.9s17.8,11,23.9,14.2l44.7,23.5c2,1.1,8.1,3,9.4,4.9s0,13.1,0,17.1h199.5c0-4-2-13.8,0-17.1,1-1.7,5.9-3.4,7.5-4.3l42.2-24.5c5.8-3.4,19.6-8.3,22.3-14.2s0-16.1,0-21.4V364.6Z\" transform=\"translate(-37.2 -15.3)\"/><path id=\"DISPLAY_BASE1\" class=\"cls-36\" d=\"M1178.3,343.8c1.6,5.3,2.7,16.3,6.5,20s11.5,4.7,15.5,6.3l64,26.1,28.5,11.6c2.6,1,11.2,2.8,12.9,5.2s.1,17.7.1,22.6v27.6h165V435.7c0-4.5-2.6-18.9.1-22.6s10.5-4,13-5l28.9-11,64.8-24.7c4.1-1.5,12.5-2.9,15.7-6s4.9-15.2,6.5-20.5\" transform=\"translate(-37.2 -15.3)\"/><rect id=\"DISPLAY_OUTER\" class=\"cls-37\" x=\"1139\" y=\"76.8\" width=\"425.6\" height=\"247.81\"/><rect id=\"DISPLAY_SCREEN\" x=\"1146.3\" y=\"81\" width=\"411\" height=\"239.32\"/><g id=\"DISPLAY_ARROW\"><path class=\"cls-10\" d=\"M1347.3,498.1c0-3.3,14.8-14,17.2-16.2s12.4-14.6,15.4-14.4,12.7,12,15.4,14.5,14.5,16.6,17,16.2c-5.1,1-12.7-2.8-17.9-3.4a142.9,142.9,0,0,0-14.6-.6c-3.6,0-32.4,1.3-32.4,4Z\" transform=\"translate(-37.2 -15.3)\"/><rect x=\"1347\" y=\"525.9\" width=\"39.6\" height=\"13\" transform=\"translate(2718.8 46.4) rotate(140)\"/><rect x=\"1363.8\" y=\"502.1\" width=\"31.8\" height=\"13\" transform=\"translate(1851.1 -886.3) rotate(90)\"/><rect x=\"1254.1\" y=\"521.7\" width=\"64.2\" height=\"13\"/><rect x=\"1053.3\" y=\"523.7\" width=\"75.5\" height=\"13\"/><path class=\"cls-11\" d=\"M1276.5,525h-83.6c-5.8,0-13.5-1.1-18.9,1.5-11.9,5.8-11.9,29.4,0,35.3,5.4,2.6,13.1,1.5,18.9,1.5h67.7c6.7,0,16.3,1.5,22.5-1.5C1297.4,554.8,1294.2,525,1276.5,525Z\" transform=\"translate(-37.2 -15.3)\"/><path class=\"cls-6\" d=\"M1277,527.9h-48.3c-15.5,0-34.7-3.2-50,.2-12,2.7-16,23.3-4.7,30,4.9,2.8,12.5,1.7,17.9,1.7H1259c5.8,0,12.2.8,18,0C1293.4,557.7,1294.8,527.9,1277,527.9Z\" transform=\"translate(-37.2 -15.3)\"/><text class=\"cls-12\" transform=\"translate(1150.4 537.3)\">Display</text></g></g><g id=\"LEFT_HEADER\"><path id=\"LEFT_HEADER_BASE\" d=\"M588.3,49.7v325h134V49.7Zm85,318h-78V56h78Z\" transform=\"translate(-37.2 -15.3)\"/><g id=\"LEFT_HEADER_LABELS\"><g id=\"GND_\" data-name=\"GND\n\n  \"><text class=\"cls-38\" transform=\"translate(568.9 344.3) scale(1.03 1)\">G<tspan class=\"cls-39\" x=\"18.4\" y=\"0\">ND</tspan></text></g><g id=\"_3.3V_\" data-name=\"3.3V\n  \n  \"><text class=\"cls-40\" transform=\"translate(570.9 304.3) scale(1.03 1)\">3<tspan class=\"cls-41\" x=\"13.6\" y=\"0\">.</tspan><tspan x=\"20.4\" y=\"0\">3</tspan><tspan class=\"cls-42\" x=\"34\" y=\"0\">V</tspan></text></g><g id=\"MISI_\" data-name=\"MISI\n  \n  \"><text class=\"cls-43\" transform=\"translate(570.9 266.7) scale(1.03 1)\">M<tspan class=\"cls-41\" x=\"20.4\" y=\"0\">I</tspan><tspan class=\"cls-42\" x=\"27.2\" y=\"0\">S</tspan><tspan class=\"cls-41\" x=\"42.7\" y=\"0\">I</tspan></text></g><g id=\"MISO_\" data-name=\"MISO\n  \"><text class=\"cls-43\" transform=\"translate(564.9 226.7) scale(1.03 1)\">M<tspan class=\"cls-41\" x=\"20.4\" y=\"0\">I</tspan><tspan class=\"cls-42\" x=\"27.2\" y=\"0\">S</tspan><tspan class=\"cls-44\" x=\"42.7\" y=\"0\">O</tspan></text></g><g id=\"SCK_\" data-name=\"SCK\n  \"><text class=\"cls-45\" transform=\"translate(569.8 186.7) scale(1.03 1)\">S<tspan class=\"cls-39\" x=\"15.5\" y=\"0\">C</tspan><tspan class=\"cls-42\" x=\"33\" y=\"0\">K</tspan></text></g><g id=\"CS_\" data-name=\"CS\n  \"><text class=\"cls-46\" transform=\"translate(577.8 149.1) scale(1.03 1)\">C<tspan class=\"cls-42\" x=\"17.5\" y=\"0\">S</tspan></text></g><g id=\"RST\"><text class=\"cls-46\" transform=\"translate(570.3 109.1) scale(1.03 1)\">R<tspan class=\"cls-42\" x=\"17.5\" y=\"0\">S</tspan><tspan class=\"cls-47\" x=\"33\" y=\"0\">T</tspan></text></g><g id=\"AN\"><text class=\"cls-45\" transform=\"translate(581 67.5) scale(1.03 1)\">A<tspan class=\"cls-39\" x=\"15.5\" y=\"0\">N</tspan></text></g></g><g id=\"GND_PIN\"><rect x=\"687\" y=\"339\" width=\"20.9\" height=\"20.57\" transform=\"translate(311 1031.5) rotate(-90)\"/><path class=\"cls-48\" d=\"M682.5,364.5h30V334h-30ZM705,341.6v15.2H690V341.6Z\" transform=\"translate(-37.2 -15.3)\"/><path class=\"cls-49\" d=\"M690,341.6h14.9c0,4.1-1.4,11,0,14.8s5.3,5.9,7.5,8.1V334H682.6Z\" transform=\"translate(-37.2 -15.3)\"/></g><g id=\"_3V_PIN\" data-name=\"3V_PIN\"><rect x=\"687\" y=\"299\" width=\"20.9\" height=\"20.57\" transform=\"translate(351 991.5) rotate(-90)\"/><path class=\"cls-48\" d=\"M682.5,324.5h30V294h-30ZM705,301.6v15.2H690V301.6Z\" transform=\"translate(-37.2 -15.3)\"/><path class=\"cls-49\" d=\"M690,301.6h14.9c0,4.1-1.4,11,0,14.8s5.3,5.9,7.5,8.1V294H682.6Z\" transform=\"translate(-37.2 -15.3)\"/></g><g id=\"MISI_PIN\"><rect x=\"686.5\" y=\"260.5\" width=\"20.9\" height=\"20.57\" transform=\"translate(389 952.5) rotate(-90)\"/><path class=\"cls-48\" d=\"M682,286h30V255.5H682Zm22.5-22.9v15.2h-15V263.1Z\" transform=\"translate(-37.2 -15.3)\"/><path class=\"cls-49\" d=\"M689.5,263.1h14.9c0,4.1-1.4,11,0,14.8s5.3,5.9,7.5,8.1V255.5H682.1Z\" transform=\"translate(-37.2 -15.3)\"/></g><g id=\"MISO_PIN\"><rect x=\"687.1\" y=\"221.5\" width=\"20.9\" height=\"20.57\" transform=\"translate(428.6 914) rotate(-90)\"/><path class=\"cls-48\" d=\"M682.6,247h30V216.5h-30Zm22.5-22.9v15.2h-15V224.1Z\" transform=\"translate(-37.2 -15.3)\"/><path class=\"cls-49\" d=\"M690.1,224.1H705c0,4.1-1.4,11,0,14.8s5.3,5.9,7.5,8.1V216.5H682.6Z\" transform=\"translate(-37.2 -15.3)\"/></g><g id=\"SCK_PIN\"><rect x=\"687\" y=\"181\" width=\"20.9\" height=\"20.57\" transform=\"translate(469 873.5) rotate(-90)\"/><path class=\"cls-48\" d=\"M682.5,206.5h30V176h-30ZM705,183.6v15.2H690V183.6Z\" transform=\"translate(-37.2 -15.3)\"/><path class=\"cls-49\" d=\"M690,183.6h14.9c0,4.1-1.4,11,0,14.8s5.3,5.9,7.5,8.1V176H682.6Z\" transform=\"translate(-37.2 -15.3)\"/></g><g id=\"CS_PIN\"><rect x=\"686.5\" y=\"143\" width=\"20.9\" height=\"20.57\" transform=\"translate(506.5 835) rotate(-90)\"/><path class=\"cls-48\" d=\"M682,168.5h30V138H682Zm22.5-22.9v15.2h-15V145.6Z\" transform=\"translate(-37.2 -15.3)\"/><path class=\"cls-49\" d=\"M689.5,145.6h14.9c0,4.1-1.4,11,0,14.8s5.3,5.9,7.5,8.1V138H682.1Z\" transform=\"translate(-37.2 -15.3)\"/></g><g id=\"RST_PIN\"><rect x=\"686.5\" y=\"104.2\" width=\"20.9\" height=\"20.57\" transform=\"translate(545.3 796.2) rotate(-90)\"/><path class=\"cls-48\" d=\"M682,129.7h30V99.3H682Zm22.5-22.9v15.2h-15V106.9Z\" transform=\"translate(-37.2 -15.3)\"/><path class=\"cls-49\" d=\"M689.5,106.9h14.9c0,4.1-1.4,11,0,14.8s5.3,5.9,7.5,8.1V99.3H682.1Z\" transform=\"translate(-37.2 -15.3)\"/></g><g id=\"AN_PIN\"><rect x=\"686.5\" y=\"65.5\" width=\"20.9\" height=\"20.57\" transform=\"translate(584 757.5) rotate(-90)\"/><path class=\"cls-48\" d=\"M682,91h30V60.5H682Zm22.5-22.9V83.4h-15V68.1Z\" transform=\"translate(-37.2 -15.3)\"/><path class=\"cls-49\" d=\"M689.5,68.1h14.9c0,4.1-1.4,11,0,14.8s5.3,5.9,7.5,8.1V60.5H682.1Z\" transform=\"translate(-37.2 -15.3)\"/></g></g><g id=\"RIGHT_HEADER\"><path id=\"RIGHT_HEADER_BASE\" d=\"M1033,49.7v325h134V49.7Zm127,320h-78V56.7h78Z\" transform=\"translate(-37.2 -15.3)\"/><g id=\"RIGHT_HEADER_LABELS\"><g id=\"GND_2\" data-name=\"GND\n  \"><text class=\"cls-50\" transform=\"translate(1056.9 344.3) scale(1.03 1)\">G<tspan class=\"cls-51\" x=\"18.4\" y=\"0\">ND</tspan></text></g><g id=\"_5V\" data-name=\"5V\"><text class=\"cls-40\" transform=\"translate(1069.4 304.3) scale(1.03 1)\">5<tspan class=\"cls-24\" x=\"13.6\" y=\"0\">V</tspan></text></g><g id=\"SDA\"><text class=\"cls-45\" transform=\"translate(1059.9 266.7) scale(1.03 1)\">S<tspan class=\"cls-51\" x=\"15.5\" y=\"0\">D</tspan><tspan class=\"cls-52\" x=\"33\" y=\"0\">A</tspan></text></g><g id=\"SCL\"><text class=\"cls-45\" transform=\"translate(1060.9 226.7) scale(1.03 1)\">S<tspan class=\"cls-51\" x=\"15.5\" y=\"0\">C</tspan><tspan class=\"cls-53\" x=\"33\" y=\"0\">L</tspan></text></g><g id=\"TX\"><text class=\"cls-54\" transform=\"translate(1067.3 186.7) scale(1.03 1)\">T<tspan class=\"cls-24\" x=\"14.6\" y=\"0\">X</tspan></text></g><g id=\"RX\"><text class=\"cls-55\" transform=\"translate(1065.8 149.1) scale(1.03 1)\">R<tspan class=\"cls-24\" x=\"17.5\" y=\"0\">X</tspan></text></g><g id=\"INT\"><text class=\"cls-56\" transform=\"translate(1062.8 109.1) scale(1.03 1)\">I<tspan class=\"cls-51\" x=\"6.8\" y=\"0\">N</tspan><tspan class=\"cls-57\" x=\"24.3\" y=\"0\">T</tspan></text></g><g id=\"PWM\"><text class=\"cls-45\" transform=\"translate(1056 67.5) scale(1.03 1)\">P<tspan class=\"cls-58\" x=\"15.5\" y=\"0\">W</tspan><tspan class=\"cls-59\" x=\"37.9\" y=\"0\">M</tspan></text></g></g><g id=\"GND_PIN-2\" data-name=\"GND_PIN\"><rect x=\"1048.1\" y=\"336.8\" width=\"20.9\" height=\"20.57\" transform=\"translate(674.3 1390.4) rotate(-90)\"/><path class=\"cls-48\" d=\"M1043.6,362.4h30V331.9h-30Zm22.5-22.9v15.2h-15V339.5Z\" transform=\"translate(-37.2 -15.3)\"/><path class=\"cls-49\" d=\"M1051.1,339.5H1066c0,4.1-1.4,11,0,14.8s5.3,5.9,7.5,8.1V331.9h-29.9Z\" transform=\"translate(-37.2 -15.3)\"/></g><g id=\"_5V_PIN\" data-name=\"5V_PIN\"><rect x=\"1048.1\" y=\"296.8\" width=\"20.9\" height=\"20.57\" transform=\"translate(714.2 1350.4) rotate(-90)\"/><path class=\"cls-48\" d=\"M1043.5,322.4h30V291.9h-30Zm22.5-22.9v15.2h-15V299.5Z\" transform=\"translate(-37.2 -15.3)\"/><path class=\"cls-49\" d=\"M1051.1,299.5H1066c0,4.1-1.4,11,0,14.8s5.3,5.9,7.5,8.1V291.9h-29.9Z\" transform=\"translate(-37.2 -15.3)\"/></g><g id=\"SDA_PIN\"><rect x=\"1047.6\" y=\"258.3\" width=\"20.9\" height=\"20.57\" transform=\"translate(752.3 1311.4) rotate(-90)\"/><path class=\"cls-48\" d=\"M1043.1,283.9h30V253.4h-30Zm22.5-22.9v15.2h-15V261Z\" transform=\"translate(-37.2 -15.3)\"/><path class=\"cls-49\" d=\"M1050.6,261h14.9c0,4.1-1.4,11,0,14.8s5.3,5.9,7.5,8.1V253.4h-29.9Z\" transform=\"translate(-37.2 -15.3)\"/></g><g id=\"SCL_PIN\"><rect x=\"1048.1\" y=\"219.3\" width=\"20.9\" height=\"20.57\" transform=\"translate(791.8 1272.9) rotate(-90)\"/><path class=\"cls-48\" d=\"M1043.6,244.9h30V214.4h-30Zm22.5-22.9v15.2h-15V222Z\" transform=\"translate(-37.2 -15.3)\"/><path class=\"cls-49\" d=\"M1051.1,222H1066c0,4.1-1.4,11,0,14.8s5.3,5.9,7.5,8.1V214.4h-29.9Z\" transform=\"translate(-37.2 -15.3)\"/></g><g id=\"TX_PIN\"><rect x=\"1048.1\" y=\"178.8\" width=\"20.9\" height=\"20.57\" transform=\"translate(832.3 1232.4) rotate(-90)\"/><path class=\"cls-48\" d=\"M1043.6,204.4h30V173.9h-30Zm22.5-22.9v15.2h-15V181.5Z\" transform=\"translate(-37.2 -15.3)\"/><path class=\"cls-49\" d=\"M1051.1,181.5H1066c0,4.1-1.4,11,0,14.8s5.3,5.9,7.5,8.1V173.9h-29.9Z\" transform=\"translate(-37.2 -15.3)\"/></g><g id=\"RX_PIN\"><rect x=\"1047.6\" y=\"140.8\" width=\"20.9\" height=\"20.57\" transform=\"translate(869.8 1193.9) rotate(-90)\"/><path class=\"cls-48\" d=\"M1043.1,166.4h30V135.9h-30Zm22.5-22.9v15.2h-15V143.5Z\" transform=\"translate(-37.2 -15.3)\"/><path class=\"cls-49\" d=\"M1050.6,143.5h14.9c0,4.1-1.4,11,0,14.8s5.3,5.9,7.5,8.1V135.9h-29.9Z\" transform=\"translate(-37.2 -15.3)\"/></g><g id=\"INT_PIN\"><rect x=\"1047.6\" y=\"101.8\" width=\"20.9\" height=\"20.57\" transform=\"translate(908.8 1154.9) rotate(-90)\"/><path class=\"cls-48\" d=\"M1043.1,127.4h30V96.9h-30Zm22.5-22.9v15.2h-15V104.5Z\" transform=\"translate(-37.2 -15.3)\"/><path class=\"cls-49\" d=\"M1050.6,104.5h14.9c0,4.1-1.4,11,0,14.8s5.3,5.9,7.5,8.1V96.9h-29.9Z\" transform=\"translate(-37.2 -15.3)\"/></g><g id=\"PWM_PIN\"><rect x=\"1047.6\" y=\"63.3\" width=\"20.9\" height=\"20.57\" transform=\"translate(947.3 1116.4) rotate(-90)\"/><path class=\"cls-48\" d=\"M1043.1,88.9h30V58.4h-30ZM1065.6,66V81.2h-15V66Z\" transform=\"translate(-37.2 -15.3)\"/><path class=\"cls-49\" d=\"M1050.6,66h14.9c0,4.1-1.4,11,0,14.8s5.3,5.9,7.5,8.1V58.4h-29.9Z\" transform=\"translate(-37.2 -15.3)\"/></g></g><g id=\"BTN_BASE\"><path class=\"cls-60\" d=\"M359.2,632.2c0,48.7,63.3,81.6,146.8,81.6\" transform=\"translate(-37.2 -15.3)\"/><path class=\"cls-60\" d=\"M504.5,795.2c-71-12.2-135.9,24.1-145.9,82.3\" transform=\"translate(-37.2 -15.3)\"/><path class=\"cls-60\" d=\"M277.1,625.6c0,48.7-66.2,88.1-148.1,88.1\" transform=\"translate(-37.2 -15.3)\"/><path class=\"cls-60\" d=\"M132.5,795.2c77.3,0,140,20.6,150,78.9\" transform=\"translate(-37.2 -15.3)\"/><g id=\"BTN_ARROWS\"><path class=\"cls-10\" d=\"M612,609.3c3.3,0,14,14.8,16.2,17.2s14.6,12.4,14.4,15.4-12,12.7-14.5,15.4-16.6,14.5-16.2,17c-1-5.1,2.8-12.7,3.4-17.9a142.9,142.9,0,0,0,.6-14.6c0-3.6-1.3-32.4-4-32.4Z\" transform=\"translate(-37.2 -15.3)\"/><rect x=\"381.5\" y=\"619.1\" width=\"24.3\" height=\"13\"/><rect x=\"531.3\" y=\"617.7\" width=\"48.5\" height=\"13\"/><path class=\"cls-11\" d=\"M551.4,621h-80c-6.3,0-13.5-.8-19.3,1.9-15,7.1-14.2,29.4,1.5,35.2,5.6,2.1,12.8,1.2,18.7,1.2h64.4c7.2,0,16.2,1.2,22.9-1.9C577.5,648.9,571.5,621,551.4,621Z\" transform=\"translate(-37.2 -15.3)\"/><path class=\"cls-6\" d=\"M552.5,623.9H504.7c-15.1,0-33.7-3.1-48.5.3s-17.4,24.3-3,30.4c5.1,2.1,11.8,1.3,17.2,1.3h64.6c6.2,0,12.9.8,19.1-.2C573.1,652.6,572.7,623.9,552.5,623.9Z\" transform=\"translate(-37.2 -15.3)\"/><text class=\"cls-12\" transform=\"translate(425.4 633.3)\">Buttons</text><rect x=\"399.6\" y=\"633.2\" width=\"15.1\" height=\"53.9\" transform=\"translate(482.4 -122.5) rotate(40)\"/></g></g><g id=\"BTN_D\"><polygon id=\"BTN_D_OUTER\" class=\"cls-22\" points=\"298.9 878.2 314.5 878.2 314.5 863.4 328.5 863.4 328.5 759.6 314.5 759.6 314.5 744.7 298.9 744.7 298.9 759.6 264.5 759.6 264.5 744.7 248.9 744.7 248.9 759.6 234.9 759.6 234.9 863.4 248.9 863.4 248.9 878.2 264.5 878.2 264.5 863.4 298.9 863.4 298.9 878.2\"/><path id=\"BTN_D_INNER\" class=\"cls-61\" d=\"M344.8,826.8c0,33.4-51.9,33.3-51.9,0S344.8,793.1,344.8,826.8Z\" transform=\"translate(-37.2 -15.3)\"/><g id=\"D\"><text class=\"cls-62\" transform=\"translate(268.7 908.9) scale(1.03 1)\">D</text></g></g><g id=\"BTN_R\"><polygon id=\"BTN_R_OUTER\" class=\"cls-22\" points=\"352.9 755.2 352.9 770.8 367.8 770.8 367.8 784.8 471.6 784.8 471.6 770.8 486.4 770.8 486.4 755.2 471.6 755.2 471.6 720.8 486.4 720.8 486.4 705.2 471.6 705.2 471.6 691.2 367.8 691.2 367.8 705.2 352.9 705.2 352.9 720.8 367.8 720.8 367.8 755.2 352.9 755.2\"/><path id=\"BTN_R_INNER\" class=\"cls-61\" d=\"M456.9,779.2c-33.4,0-33.3-51.9,0-51.9S490.5,779.2,456.9,779.2Z\" transform=\"translate(-37.2 -15.3)\"/><g id=\"R\"><text class=\"cls-62\" transform=\"translate(496.3 753.1) scale(1.03 1)\">R</text></g></g><g id=\"BTN_L\"><polygon id=\"BTN_L_OUTER\" class=\"cls-22\" points=\"77 757.6 77 773.2 91.8 773.2 91.8 787.3 195.6 787.3 195.6 773.2 210.5 773.2 210.5 757.6 195.6 757.6 195.6 723.3 210.5 723.3 210.5 707.7 195.6 707.7 195.6 693.7 91.8 693.7 91.8 707.7 77 707.7 77 723.3 91.8 723.3 91.8 757.6 77 757.6\"/><path id=\"BTN_L_INNER\" class=\"cls-61\" d=\"M180.9,781.7c-33.4,0-33.3-51.9,0-51.9S214.5,781.7,180.9,781.7Z\" transform=\"translate(-37.2 -15.3)\"/><g id=\"L\"><text class=\"cls-63\" transform=\"translate(46.6 751.5) scale(1.03 1)\">L</text></g></g><g id=\"BTN_U\"><polygon id=\"BTN_U_OUTER\" class=\"cls-22\" points=\"298.8 728.2 314.4 728.2 314.4 713.4 328.5 713.4 328.5 609.6 314.4 609.6 314.4 594.8 298.8 594.8 298.8 609.6 264.5 609.6 264.5 594.8 248.9 594.8 248.9 609.6 234.9 609.6 234.9 713.4 248.9 713.4 248.9 728.2 264.5 728.2 264.5 713.4 298.8 713.4 298.8 728.2\"/><path id=\"BTN_U_INNER\" class=\"cls-61\" d=\"M344.8,676.8c0,33.4-51.9,33.3-51.9,0S344.8,643.2,344.8,676.8Z\" transform=\"translate(-37.2 -15.3)\"/><g id=\"U\"><text class=\"cls-62\" transform=\"translate(268.7 590.9) scale(1.03 1)\">U</text></g></g><g id=\"LIGHTSENSOR\"><path id=\"a\" class=\"cls-64\" d=\"M141.3,531.2l6.5,25.8a48.2,48.2,0,0,0-13,0Z\" transform=\"translate(-37.2 -15.3)\"/><path id=\"a-2\" data-name=\"a\" class=\"cls-64\" d=\"M164,534.8l-1.9,26.5a48.1,48.1,0,0,0-12.3-4Z\" transform=\"translate(-37.2 -15.3)\"/><path id=\"a-3\" data-name=\"a\" class=\"cls-64\" d=\"M118.6,534.8l14.2,22.6a48.1,48.1,0,0,0-12.3,4Z\" transform=\"translate(-37.2 -15.3)\"/><path id=\"a-4\" data-name=\"a\" class=\"cls-64\" d=\"M184.4,545.1l-10.1,24.7a47.7,47.7,0,0,0-10.5-7.5Z\" transform=\"translate(-37.2 -15.3)\"/><path id=\"a-5\" data-name=\"a\" class=\"cls-64\" d=\"M200.6,561.1l-17.3,20.4a47.2,47.2,0,0,0-7.6-10.4Z\" transform=\"translate(-37.2 -15.3)\"/><path id=\"a-6\" data-name=\"a\" class=\"cls-64\" d=\"M214.6,603.7l-26.1,6.4a46.6,46.6,0,0,0,0-12.8Z\" transform=\"translate(-37.2 -15.3)\"/><path id=\"a-7\" data-name=\"a\" class=\"cls-64\" d=\"M211,626.2l-26.8-1.9a46.7,46.7,0,0,0,4-12.2Z\" transform=\"translate(-37.2 -15.3)\"/><path id=\"a-8\" data-name=\"a\" class=\"cls-64\" d=\"M211,581.3l-22.8,14.1a46.7,46.7,0,0,0-4-12.2Z\" transform=\"translate(-37.2 -15.3)\"/><path id=\"a-9\" data-name=\"a\" class=\"cls-64\" d=\"M200.6,646.4l-24.9-10a47.2,47.2,0,0,0,7.6-10.4Z\" transform=\"translate(-37.2 -15.3)\"/><path id=\"a-10\" data-name=\"a\" class=\"cls-64\" d=\"M184.4,662.4l-20.6-17.1a47.7,47.7,0,0,0,10.5-7.5Z\" transform=\"translate(-37.2 -15.3)\"/><path id=\"a-11\" data-name=\"a\" class=\"cls-64\" d=\"M141.3,676.2l-6.5-25.8a48.2,48.2,0,0,0,13,0Z\" transform=\"translate(-37.2 -15.3)\"/><path id=\"a-12\" data-name=\"a\" class=\"cls-64\" d=\"M118.6,672.7l1.9-26.5a48.1,48.1,0,0,0,12.3,4Z\" transform=\"translate(-37.2 -15.3)\"/><path id=\"a-13\" data-name=\"a\" class=\"cls-64\" d=\"M164,672.7l-14.2-22.6a48.1,48.1,0,0,0,12.3-4Z\" transform=\"translate(-37.2 -15.3)\"/><path id=\"a-14\" data-name=\"a\" class=\"cls-64\" d=\"M98.2,662.4l10.1-24.7a47.7,47.7,0,0,0,10.5,7.5Z\" transform=\"translate(-37.2 -15.3)\"/><path id=\"a-15\" data-name=\"a\" class=\"cls-64\" d=\"M82,646.4,99.3,626a47.2,47.2,0,0,0,7.6,10.4Z\" transform=\"translate(-37.2 -15.3)\"/><path id=\"a-16\" data-name=\"a\" class=\"cls-64\" d=\"M68,603.7l26.1-6.4a46.6,46.6,0,0,0,0,12.8Z\" transform=\"translate(-37.2 -15.3)\"/><path id=\"a-17\" data-name=\"a\" class=\"cls-64\" d=\"M71.5,581.3l26.8,1.9a46.7,46.7,0,0,0-4,12.2Z\" transform=\"translate(-37.2 -15.3)\"/><path id=\"a-18\" data-name=\"a\" class=\"cls-64\" d=\"M71.5,626.2l22.8-14.1a46.7,46.7,0,0,0,4,12.2Z\" transform=\"translate(-37.2 -15.3)\"/><path id=\"a-19\" data-name=\"a\" class=\"cls-64\" d=\"M82,561.1l24.9,10a47.2,47.2,0,0,0-7.6,10.4Z\" transform=\"translate(-37.2 -15.3)\"/><path id=\"a-20\" data-name=\"a\" class=\"cls-64\" d=\"M98.2,545.1l20.6,17.1a47.7,47.7,0,0,0-10.5,7.5Z\" transform=\"translate(-37.2 -15.3)\"/><path class=\"cls-64\" d=\"M141.3,560.1c23.8,0,44,19.7,44,43.6s-20.2,43.6-44,43.6-43.1-18.6-43.9-41.9S116.8,560.1,141.3,560.1Z\" transform=\"translate(-37.2 -15.3)\"/><path class=\"cls-65\" d=\"M141.2,561.7c54.6,0,54.3,84.1,0,84.1S86.6,561.7,141.2,561.7Z\" transform=\"translate(-37.2 -15.3)\"/><path id=\"a-21\" data-name=\"a\" class=\"cls-65\" d=\"M141.3,534.9l6.5,25.8a48.2,48.2,0,0,0-13,0Z\" transform=\"translate(-37.2 -15.3)\"/><path id=\"a-22\" data-name=\"a\" class=\"cls-65\" d=\"M162.9,538,161,564.5a48.1,48.1,0,0,0-12.3-4Z\" transform=\"translate(-37.2 -15.3)\"/><path id=\"a-23\" data-name=\"a\" class=\"cls-65\" d=\"M182.3,547.8l-10.1,24.7a47.7,47.7,0,0,0-10.5-7.5Z\" transform=\"translate(-37.2 -15.3)\"/><path id=\"a-24\" data-name=\"a\" class=\"cls-65\" d=\"M198,563.2l-17.3,20.4a47.2,47.2,0,0,0-7.6-10.4Z\" transform=\"translate(-37.2 -15.3)\"/><path id=\"a-25\" data-name=\"a\" class=\"cls-65\" d=\"M119.7,538l14.2,22.6a48.1,48.1,0,0,0-12.3,4Z\" transform=\"translate(-37.2 -15.3)\"/><path id=\"a-26\" data-name=\"a\" class=\"cls-65\" d=\"M100.2,547.8,120.8,565a47.7,47.7,0,0,0-10.5,7.5Z\" transform=\"translate(-37.2 -15.3)\"/><path id=\"a-27\" data-name=\"a\" class=\"cls-65\" d=\"M84.7,563.2l24.9,10a47.2,47.2,0,0,0-7.6,10.4Z\" transform=\"translate(-37.2 -15.3)\"/><path id=\"a-28\" data-name=\"a\" class=\"cls-65\" d=\"M74.9,582.5l26.8,1.9a46.7,46.7,0,0,0-4,12.2Z\" transform=\"translate(-37.2 -15.3)\"/><path id=\"a-29\" data-name=\"a\" class=\"cls-65\" d=\"M71.5,603.7l26.1-6.4a46.6,46.6,0,0,0,0,12.8Z\" transform=\"translate(-37.2 -15.3)\"/><path id=\"a-30\" data-name=\"a\" class=\"cls-65\" d=\"M74.9,625.1l22.8-14.1a46.7,46.7,0,0,0,4,12.2Z\" transform=\"translate(-37.2 -15.3)\"/><path id=\"a-31\" data-name=\"a\" class=\"cls-65\" d=\"M84.9,644.3,102.2,624a47.2,47.2,0,0,0,7.6,10.4Z\" transform=\"translate(-37.2 -15.3)\"/><path id=\"a-32\" data-name=\"a\" class=\"cls-65\" d=\"M100.4,659.5l10.1-24.7a47.7,47.7,0,0,0,10.5,7.5Z\" transform=\"translate(-37.2 -15.3)\"/><path id=\"a-33\" data-name=\"a\" class=\"cls-65\" d=\"M119.8,669.5l1.9-26.5a48.1,48.1,0,0,0,12.3,4Z\" transform=\"translate(-37.2 -15.3)\"/><path id=\"a-34\" data-name=\"a\" class=\"cls-65\" d=\"M141.3,672.9l-6.5-25.8a48.2,48.2,0,0,0,13,0Z\" transform=\"translate(-37.2 -15.3)\"/><path id=\"a-35\" data-name=\"a\" class=\"cls-65\" d=\"M162.9,669.5l-14.2-22.6a48.1,48.1,0,0,0,12.3-4Z\" transform=\"translate(-37.2 -15.3)\"/><path id=\"a-36\" data-name=\"a\" class=\"cls-65\" d=\"M182.2,659.6l-20.6-17.1a47.7,47.7,0,0,0,10.5-7.5Z\" transform=\"translate(-37.2 -15.3)\"/><path id=\"a-37\" data-name=\"a\" class=\"cls-65\" d=\"M197.8,644.6l-24.9-10a47.2,47.2,0,0,0,7.6-10.4Z\" transform=\"translate(-37.2 -15.3)\"/><path id=\"a-38\" data-name=\"a\" class=\"cls-65\" d=\"M208,625.3l-26.8-1.9a46.7,46.7,0,0,0,4-12.2Z\" transform=\"translate(-37.2 -15.3)\"/><path id=\"a-39\" data-name=\"a\" class=\"cls-65\" d=\"M185.1,597.3l26.1,6.4-26.1,6.4\" transform=\"translate(-37.2 -15.3)\"/><path id=\"a-40\" data-name=\"a\" class=\"cls-65\" d=\"M207.8,582.4,185,596.4a46.7,46.7,0,0,0-4-12.2Z\" transform=\"translate(-37.2 -15.3)\"/><g id=\"LIGHTSENSOR_SENSOR\"><rect class=\"cls-5\" x=\"91.2\" y=\"599.3\" width=\"11.8\" height=\"10.5\"/><rect class=\"cls-5\" x=\"105.2\" y=\"599.3\" width=\"11.4\" height=\"10.5\"/><rect class=\"cls-66\" x=\"93.7\" y=\"600.3\" width=\"20.9\" height=\"8.5\"/></g><g id=\"LIGHTSENSOR_ARROW\"><path class=\"cls-10\" d=\"M631.4,527.2c3.5,0,13.2,14,15.7,16.6s15.6,13.1,15.6,16.6S649.2,574.7,647,577s-16.1,13.9-15.6,16.5c-1-5.2,2.9-13,3.4-18.3a145.9,145.9,0,0,0,.6-14.9c0-3.7-1.3-33.1-4.1-33.1Z\" transform=\"translate(-37.2 -15.3)\"/><rect x=\"234.5\" y=\"537.7\" width=\"133.7\" height=\"13\"/><rect x=\"549.7\" y=\"537.6\" width=\"49.5\" height=\"13.28\"/><path class=\"cls-11\" d=\"M571.8,541H503.1c-25.7,0-52.2-1.9-77.9,0-19.1,1.4-29,27-9,36.4,6.9,3.3,16.7,1.9,24.2,1.9h96.2c11.2,0,22.7.7,33.9,0C595.2,577.8,598.1,541,571.8,541Z\" transform=\"translate(-37.2 -15.3)\"/><path class=\"cls-6\" d=\"M572,543.9c-48.3,0-97.5-3-145.6,0-15.4,1-26.6,20.7-9.5,29.9,6.5,3.5,16.5,2,23.6,2h94.1c11.8,0,23.8.8,35.6,0C590.8,574.5,594.6,543.9,572,543.9Z\" transform=\"translate(-37.2 -15.3)\"/><text class=\"cls-67\" transform=\"translate(386.8 553.9)\">Light Sensor</text><rect x=\"146.3\" y=\"582.1\" width=\"39.5\" height=\"13\"/><rect x=\"239.8\" y=\"544.3\" width=\"15.1\" height=\"74.57\" transform=\"translate(516.2 13.3) rotate(52)\"/></g></g><g id=\"TEMP\"><g id=\"TEMP_GAUGE\"><path d=\"M155.8,394.9V166.2c0-10.1,3.2-24.9-2.2-34.1s-19.7-12.9-29-7.9c-11,5.9-11.5,19.4-11.6,30.3-.2,19.8,0,39.5,0,59.3q0,54,0,108.1v53.6c0,4.4,1,10.4,0,14.6-1.7,7.5.4,2.8-4.3,7.1s-10.5,6.7-14.9,11.5c-12.1,13.3-15.7,32.5-7.7,48.9,9.4,19.3,30.9,27.9,51.4,27s42.8-13.6,48.1-35.7-9.5-44.3-30-53.9Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M147.4,399V282.1H121.4V399c-50.8,12.1-35.4,78.5,13,78.6S198.1,411.1,147.4,399Z\" transform=\"translate(-37.2 -15.3)\"/><rect class=\"cls-6\" x=\"80.5\" y=\"122.9\" width=\"33.6\" height=\"143.9\"/><path class=\"cls-6\" d=\"M151.1,142.1c0-20.2-33.4-20.2-33.6,0S151.1,162.5,151.1,142.1Z\" transform=\"translate(-37.2 -15.3)\"/><rect class=\"cls-6\" x=\"93.4\" y=\"374\" width=\"21.7\" height=\"3.19\"/><rect class=\"cls-6\" x=\"101.9\" y=\"369\" width=\"12.6\" height=\"2.72\"/><rect class=\"cls-6\" x=\"101.9\" y=\"363.4\" width=\"12.6\" height=\"2.72\"/><rect class=\"cls-6\" x=\"101.9\" y=\"357.8\" width=\"12.6\" height=\"2.72\"/><rect class=\"cls-6\" x=\"102\" y=\"352.1\" width=\"12.6\" height=\"2.72\"/><rect class=\"cls-6\" x=\"92.9\" y=\"346.1\" width=\"21.7\" height=\"3.19\"/><rect class=\"cls-6\" x=\"101.4\" y=\"341.1\" width=\"12.6\" height=\"2.72\"/><rect class=\"cls-6\" x=\"101.4\" y=\"335.5\" width=\"12.6\" height=\"2.72\"/><rect class=\"cls-6\" x=\"101.4\" y=\"329.9\" width=\"12.6\" height=\"2.72\"/><rect class=\"cls-6\" x=\"101.6\" y=\"324.2\" width=\"12.6\" height=\"2.72\"/><rect class=\"cls-6\" x=\"92.9\" y=\"317.7\" width=\"21.7\" height=\"3.19\"/><rect class=\"cls-6\" x=\"101.4\" y=\"312.7\" width=\"12.6\" height=\"2.72\"/><rect class=\"cls-6\" x=\"101.4\" y=\"307.1\" width=\"12.6\" height=\"2.72\"/><rect class=\"cls-6\" x=\"101.4\" y=\"301.6\" width=\"12.6\" height=\"2.72\"/><rect class=\"cls-6\" x=\"101.6\" y=\"295.9\" width=\"12.6\" height=\"2.72\"/><rect class=\"cls-6\" x=\"92.9\" y=\"290.2\" width=\"21.7\" height=\"3.19\"/><rect class=\"cls-6\" x=\"101.4\" y=\"285.2\" width=\"12.6\" height=\"2.72\"/><rect class=\"cls-6\" x=\"101.4\" y=\"279.6\" width=\"12.6\" height=\"2.72\"/><rect class=\"cls-6\" x=\"101.4\" y=\"274\" width=\"12.6\" height=\"2.72\"/><rect class=\"cls-6\" x=\"101.6\" y=\"268.4\" width=\"12.6\" height=\"2.72\"/><rect x=\"92.9\" y=\"261.4\" width=\"21.7\" height=\"3.19\"/><rect x=\"101.4\" y=\"256.4\" width=\"12.6\" height=\"2.72\"/><rect x=\"101.4\" y=\"250.8\" width=\"12.6\" height=\"2.72\"/><rect x=\"101.4\" y=\"245.2\" width=\"12.6\" height=\"2.72\"/><rect x=\"101.6\" y=\"239.5\" width=\"12.6\" height=\"2.72\"/><rect x=\"92.7\" y=\"233.4\" width=\"21.7\" height=\"3.19\"/><rect x=\"101.2\" y=\"228.4\" width=\"12.6\" height=\"2.72\"/><rect x=\"101.2\" y=\"222.8\" width=\"12.6\" height=\"2.72\"/><rect x=\"101.2\" y=\"217.2\" width=\"12.6\" height=\"2.72\"/><rect x=\"101.3\" y=\"211.5\" width=\"12.6\" height=\"2.72\"/><rect x=\"92.9\" y=\"205\" width=\"21.7\" height=\"3.19\"/><polygon points=\"114 200 101.4 200 101.4 202.7 114 202.6 114 200\"/><rect x=\"101.4\" y=\"194.3\" width=\"12.6\" height=\"2.72\"/><rect x=\"101.4\" y=\"188.8\" width=\"12.6\" height=\"2.72\"/><rect x=\"101.6\" y=\"183.1\" width=\"12.6\" height=\"2.81\"/><rect x=\"92.6\" y=\"177.1\" width=\"21.7\" height=\"3.19\"/><polygon points=\"113.7 172 101.1 172 101.1 174.8 113.7 174.7 113.7 172\"/><rect x=\"101.1\" y=\"166.4\" width=\"12.6\" height=\"2.72\"/><rect x=\"101.1\" y=\"160.8\" width=\"12.6\" height=\"2.72\"/><rect x=\"101.2\" y=\"155.1\" width=\"12.6\" height=\"2.81\"/><rect x=\"93.8\" y=\"148.2\" width=\"21.7\" height=\"3.19\"/><polygon points=\"114.9 143.2 102.3 143.2 102.3 145.9 114.9 145.8 114.9 143.2\"/><rect x=\"102.3\" y=\"137.5\" width=\"12.6\" height=\"2.72\"/><rect x=\"102.3\" y=\"132\" width=\"12.6\" height=\"2.72\"/><rect x=\"102.4\" y=\"126.3\" width=\"12.6\" height=\"2.81\"/><line x1=\"115.1\" y1=\"263.8\" x2=\"93.4\" y2=\"263.8\"/><rect x=\"94.3\" y=\"120.5\" width=\"21.7\" height=\"3.19\"/><rect id=\"rect4732-2\" data-name=\"rect4732\" class=\"cls-3\" x=\"90.4\" y=\"393.6\" width=\"12.7\" height=\"43.85\"/><rect id=\"rect4734-2\" data-name=\"rect4734\" class=\"cls-3\" x=\"110.3\" y=\"408.3\" width=\"12.2\" height=\"40.6\"/><rect id=\"rect4740-2\" data-name=\"rect4740\" class=\"cls-4\" x=\"112.2\" y=\"406\" width=\"7.8\" height=\"40.13\"/><rect id=\"rect4734-3\" data-name=\"rect4734\" class=\"cls-3\" x=\"71\" y=\"408.6\" width=\"12.2\" height=\"40.6\"/><rect id=\"rect4740-3\" data-name=\"rect4740\" class=\"cls-4\" x=\"72.9\" y=\"406.2\" width=\"7.8\" height=\"40.13\"/><rect id=\"SLIDE_HOVER-2\" data-name=\"SLIDE HOVER\" class=\"cls-19\" x=\"64.1\" y=\"406\" width=\"63.8\" height=\"34.48\"/><rect id=\"SLIDE_INNER-2\" data-name=\"SLIDE INNER\" class=\"cls-68\" x=\"66.6\" y=\"409.1\" width=\"59.4\" height=\"28.38\"/><rect id=\"connector232pin-4\" data-name=\"connector232pin\" class=\"cls-3\" x=\"77.9\" y=\"482\" width=\"13.5\" height=\"13.51\"/><rect id=\"connector233pin-4\" data-name=\"connector233pin\" class=\"cls-3\" x=\"100.8\" y=\"482\" width=\"13.5\" height=\"13.51\"/><g id=\"g4754-4\" data-name=\"g4754\"><g id=\"g4756-4\" data-name=\"g4756\"><g id=\"_0402-4\" data-name=\" 0402\"><rect id=\"rect4761-4\" data-name=\"rect4761\" class=\"cls-18\" x=\"90.5\" y=\"483.2\" width=\"11.3\" height=\"11.26\"/></g></g></g></g><g id=\"TEMP_ARROW\"><path class=\"cls-10\" d=\"M660.5,459.8c3.3,0,14,14.8,16.2,17.2s14.6,12.4,14.4,15.4-12,12.7-14.5,15.4-16.6,14.5-16.2,17c-1-5.1,2.8-12.7,3.4-17.9a142.9,142.9,0,0,0,.6-14.6c0-3.6-1.3-32.4-4-32.4Z\" transform=\"translate(-37.2 -15.3)\"/><rect x=\"168.3\" y=\"468.7\" width=\"105.8\" height=\"13\"/><rect x=\"543.3\" y=\"469.7\" width=\"88.8\" height=\"13\"/><path class=\"cls-11\" d=\"M563.8,472H336.7c-2.8,0-5.6-.2-8.4,0-16.8,1.4-26.5,21.9-12.3,33.8,8.5,7.2,24.6,4.5,34.9,4.5h204c4,0,8.4.5,12.4-.3C589.4,505.6,586.6,472,563.8,472Z\" transform=\"translate(-37.2 -15.3)\"/><path class=\"cls-6\" d=\"M562.6,474.9h-223c-3.1,0-6.4-.3-9.4,0-13.3,1.3-22,16.6-11.4,27.3,7.5,7.5,23.9,4.7,33.4,4.7H552.4c3.3,0,6.8.3,10.1,0C582.7,504.8,583.6,474.9,562.6,474.9Z\" transform=\"translate(-37.2 -15.3)\"/><text class=\"cls-12\" transform=\"translate(289.8 483.7)\"><tspan class=\"cls-69\">T</tspan><tspan x=\"13\" y=\"0\">emperature Sensor</tspan></text><rect x=\"180.3\" y=\"452\" width=\"15.1\" height=\"51.15\" transform=\"translate(656.8 547.3) rotate(121)\"/></g></g><g id=\"ACCEL\"><path id=\"ACCEL_BASE\" class=\"cls-70\" d=\"M438.8,377.4c3.3-18.2.9-38.5.9-56.9s1.2-35.7-.1-53.3c-2.2-29.8-27.1-49.3-55.8-49.5-21.4-.2-42.8,0-64.2,0-19,0-40.4-2.7-57.4,7.6-22.5,13.6-25.8,36-25.8,59.7v68.7c0,23.7,3.4,46.2,25.8,59.7,19.1,11.4,45.7,7.6,67.1,7.6s42.8,2.1,63.6-.4C394.8,396.9,414.5,378.3,438.8,377.4Z\" transform=\"translate(-37.2 -15.3)\"/><g id=\"ACCEL_CHIP\"><g id=\"g3781\"><g id=\"g3783\"><g id=\"lga16_3x3mm\" data-name=\"lga16 3x3mm\"><g id=\"g3786\"><g id=\"g3788\"><g id=\"g3790\"><g id=\"g3792\"><g id=\"g3794\"><g id=\"g3796\"><g id=\"g3798\"><rect id=\"rect3800\" class=\"cls-18\" x=\"277.2\" y=\"286.2\" width=\"42.2\" height=\"42.22\"/></g></g></g></g></g></g></g></g></g></g><g id=\"g2023\"><g id=\"g2025\"><g id=\"g2027\"><g id=\"g2029\"><g id=\"g2031\"><g id=\"g2033\"><g id=\"g2035\"><rect id=\"connector98pin\" class=\"cls-3\" x=\"310.8\" y=\"282\" width=\"3.5\" height=\"4.25\"/></g></g></g></g></g></g></g><g id=\"g2038\"><g id=\"g2040\"><g id=\"g2042\"><g id=\"g2044\"><g id=\"g2046\"><g id=\"g2048\"><g id=\"g2050\"><rect id=\"connector99pin\" class=\"cls-3\" x=\"303.8\" y=\"282\" width=\"3.5\" height=\"4.25\"/></g></g></g></g></g></g></g><g id=\"g2053\"><g id=\"g2055\"><g id=\"g2057\"><g id=\"g2059\"><g id=\"g2061\"><g id=\"g2063\"><g id=\"g2065\"><rect id=\"connector100pin\" class=\"cls-3\" x=\"296.8\" y=\"282\" width=\"3.5\" height=\"4.25\"/></g></g></g></g></g></g></g><g id=\"g2068\"><g id=\"g2070\"><g id=\"g2072\"><g id=\"g2074\"><g id=\"g2076\"><g id=\"g2078\"><g id=\"g2080\"><rect id=\"connector101pin\" class=\"cls-3\" x=\"289.7\" y=\"282\" width=\"3.5\" height=\"4.25\"/></g></g></g></g></g></g></g><g id=\"g2083\"><g id=\"g2085\"><g id=\"g2087\"><g id=\"g2089\"><g id=\"g2091\"><g id=\"g2093\"><g id=\"g2095\"><rect id=\"connector102pin\" class=\"cls-3\" x=\"282.7\" y=\"282\" width=\"3.5\" height=\"4.25\"/></g></g></g></g></g></g></g><g id=\"g2023-2\" data-name=\"g2023\"><g id=\"g2025-2\" data-name=\"g2025\"><g id=\"g2027-2\" data-name=\"g2027\"><g id=\"g2029-2\" data-name=\"g2029\"><g id=\"g2031-2\" data-name=\"g2031\"><g id=\"g2033-2\" data-name=\"g2033\"><g id=\"g2035-2\" data-name=\"g2035\"><rect id=\"connector98pin-2\" data-name=\"connector98pin\" class=\"cls-3\" x=\"310.8\" y=\"328.2\" width=\"3.5\" height=\"4.29\"/></g></g></g></g></g></g></g><g id=\"g2038-2\" data-name=\"g2038\"><g id=\"g2040-2\" data-name=\"g2040\"><g id=\"g2042-2\" data-name=\"g2042\"><g id=\"g2044-2\" data-name=\"g2044\"><g id=\"g2046-2\" data-name=\"g2046\"><g id=\"g2048-2\" data-name=\"g2048\"><g id=\"g2050-2\" data-name=\"g2050\"><rect id=\"connector99pin-2\" data-name=\"connector99pin\" class=\"cls-3\" x=\"303.8\" y=\"328.2\" width=\"3.5\" height=\"4.29\"/></g></g></g></g></g></g></g><g id=\"g2053-2\" data-name=\"g2053\"><g id=\"g2055-2\" data-name=\"g2055\"><g id=\"g2057-2\" data-name=\"g2057\"><g id=\"g2059-2\" data-name=\"g2059\"><g id=\"g2061-2\" data-name=\"g2061\"><g id=\"g2063-2\" data-name=\"g2063\"><g id=\"g2065-2\" data-name=\"g2065\"><rect id=\"connector100pin-2\" data-name=\"connector100pin\" class=\"cls-3\" x=\"296.8\" y=\"328.2\" width=\"3.5\" height=\"4.29\"/></g></g></g></g></g></g></g><g id=\"g2068-2\" data-name=\"g2068\"><g id=\"g2070-2\" data-name=\"g2070\"><g id=\"g2072-2\" data-name=\"g2072\"><g id=\"g2074-2\" data-name=\"g2074\"><g id=\"g2076-2\" data-name=\"g2076\"><g id=\"g2078-2\" data-name=\"g2078\"><g id=\"g2080-2\" data-name=\"g2080\"><rect id=\"connector101pin-2\" data-name=\"connector101pin\" class=\"cls-3\" x=\"289.7\" y=\"328.2\" width=\"3.5\" height=\"4.29\"/></g></g></g></g></g></g></g><g id=\"g2083-2\" data-name=\"g2083\"><g id=\"g2085-2\" data-name=\"g2085\"><g id=\"g2087-2\" data-name=\"g2087\"><g id=\"g2089-2\" data-name=\"g2089\"><g id=\"g2091-2\" data-name=\"g2091\"><g id=\"g2093-2\" data-name=\"g2093\"><g id=\"g2095-2\" data-name=\"g2095\"><rect id=\"connector102pin-2\" data-name=\"connector102pin\" class=\"cls-3\" x=\"282.7\" y=\"328.2\" width=\"3.5\" height=\"4.29\"/></g></g></g></g></g></g></g><g id=\"g2023-3\" data-name=\"g2023\"><g id=\"g2025-3\" data-name=\"g2025\"><g id=\"g2027-3\" data-name=\"g2027\"><g id=\"g2029-3\" data-name=\"g2029\"><g id=\"g2031-3\" data-name=\"g2031\"><g id=\"g2033-3\" data-name=\"g2033\"><g id=\"g2035-3\" data-name=\"g2035\"><rect id=\"connector98pin-3\" data-name=\"connector98pin\" class=\"cls-3\" x=\"272.6\" y=\"291.9\" width=\"5\" height=\"3.52\"/></g></g></g></g></g></g></g><g id=\"g2038-3\" data-name=\"g2038\"><g id=\"g2040-3\" data-name=\"g2040\"><g id=\"g2042-3\" data-name=\"g2042\"><g id=\"g2044-3\" data-name=\"g2044\"><g id=\"g2046-3\" data-name=\"g2046\"><g id=\"g2048-3\" data-name=\"g2048\"><g id=\"g2050-3\" data-name=\"g2050\"><rect id=\"connector99pin-3\" data-name=\"connector99pin\" class=\"cls-3\" x=\"272.6\" y=\"298.9\" width=\"5\" height=\"3.52\"/></g></g></g></g></g></g></g><g id=\"g2053-3\" data-name=\"g2053\"><g id=\"g2055-3\" data-name=\"g2055\"><g id=\"g2057-3\" data-name=\"g2057\"><g id=\"g2059-3\" data-name=\"g2059\"><g id=\"g2061-3\" data-name=\"g2061\"><g id=\"g2063-3\" data-name=\"g2063\"><g id=\"g2065-3\" data-name=\"g2065\"><rect id=\"connector100pin-3\" data-name=\"connector100pin\" class=\"cls-3\" x=\"272.6\" y=\"305.9\" width=\"5\" height=\"3.52\"/></g></g></g></g></g></g></g><g id=\"g2068-3\" data-name=\"g2068\"><g id=\"g2070-3\" data-name=\"g2070\"><g id=\"g2072-3\" data-name=\"g2072\"><g id=\"g2074-3\" data-name=\"g2074\"><g id=\"g2076-3\" data-name=\"g2076\"><g id=\"g2078-3\" data-name=\"g2078\"><g id=\"g2080-3\" data-name=\"g2080\"><rect id=\"connector101pin-3\" data-name=\"connector101pin\" class=\"cls-3\" x=\"272.6\" y=\"313\" width=\"5\" height=\"3.52\"/></g></g></g></g></g></g></g><g id=\"g2083-3\" data-name=\"g2083\"><g id=\"g2085-3\" data-name=\"g2085\"><g id=\"g2087-3\" data-name=\"g2087\"><g id=\"g2089-3\" data-name=\"g2089\"><g id=\"g2091-3\" data-name=\"g2091\"><g id=\"g2093-3\" data-name=\"g2093\"><g id=\"g2095-3\" data-name=\"g2095\"><rect id=\"connector102pin-3\" data-name=\"connector102pin\" class=\"cls-3\" x=\"272.6\" y=\"320\" width=\"5\" height=\"3.52\"/></g></g></g></g></g></g></g><g id=\"g2023-4\" data-name=\"g2023\"><g id=\"g2025-4\" data-name=\"g2025\"><g id=\"g2027-4\" data-name=\"g2027\"><g id=\"g2029-4\" data-name=\"g2029\"><g id=\"g2031-4\" data-name=\"g2031\"><g id=\"g2033-4\" data-name=\"g2033\"><g id=\"g2035-4\" data-name=\"g2035\"><rect id=\"connector98pin-4\" data-name=\"connector98pin\" class=\"cls-3\" x=\"319.3\" y=\"292.1\" width=\"4.3\" height=\"3.52\"/></g></g></g></g></g></g></g><g id=\"g2038-4\" data-name=\"g2038\"><g id=\"g2040-4\" data-name=\"g2040\"><g id=\"g2042-4\" data-name=\"g2042\"><g id=\"g2044-4\" data-name=\"g2044\"><g id=\"g2046-4\" data-name=\"g2046\"><g id=\"g2048-4\" data-name=\"g2048\"><g id=\"g2050-4\" data-name=\"g2050\"><rect id=\"connector99pin-4\" data-name=\"connector99pin\" class=\"cls-3\" x=\"319.3\" y=\"299.2\" width=\"4.3\" height=\"3.52\"/></g></g></g></g></g></g></g><g id=\"g2053-4\" data-name=\"g2053\"><g id=\"g2055-4\" data-name=\"g2055\"><g id=\"g2057-4\" data-name=\"g2057\"><g id=\"g2059-4\" data-name=\"g2059\"><g id=\"g2061-4\" data-name=\"g2061\"><g id=\"g2063-4\" data-name=\"g2063\"><g id=\"g2065-4\" data-name=\"g2065\"><rect id=\"connector100pin-4\" data-name=\"connector100pin\" class=\"cls-3\" x=\"319.3\" y=\"306.2\" width=\"4.3\" height=\"3.52\"/></g></g></g></g></g></g></g><g id=\"g2068-4\" data-name=\"g2068\"><g id=\"g2070-4\" data-name=\"g2070\"><g id=\"g2072-4\" data-name=\"g2072\"><g id=\"g2074-4\" data-name=\"g2074\"><g id=\"g2076-4\" data-name=\"g2076\"><g id=\"g2078-4\" data-name=\"g2078\"><g id=\"g2080-4\" data-name=\"g2080\"><rect id=\"connector101pin-4\" data-name=\"connector101pin\" class=\"cls-3\" x=\"319.3\" y=\"313.2\" width=\"4.3\" height=\"3.52\"/></g></g></g></g></g></g></g><g id=\"g2083-4\" data-name=\"g2083\"><g id=\"g2085-4\" data-name=\"g2085\"><g id=\"g2087-4\" data-name=\"g2087\"><g id=\"g2089-4\" data-name=\"g2089\"><g id=\"g2091-4\" data-name=\"g2091\"><g id=\"g2093-4\" data-name=\"g2093\"><g id=\"g2095-4\" data-name=\"g2095\"><rect id=\"connector102pin-4\" data-name=\"connector102pin\" class=\"cls-3\" x=\"319.3\" y=\"320.3\" width=\"4.3\" height=\"3.52\"/></g></g></g></g></g></g></g></g><g id=\"AXIS_LABEL\"><text class=\"cls-71\" transform=\"translate(237.3 322)\">Y</text><text class=\"cls-72\" transform=\"translate(228.6 383.7)\">Z</text><text class=\"cls-72\" transform=\"translate(289.8 377.7)\">X</text><g id=\"AXIS_Y_ARROW\"><path class=\"cls-10\" d=\"M270.2,350.1c0-.7,9.1-9.6,10.2-9.6,3.1,0,7.3,10.1,10.1,9.6-1.1.2-20.3-4.2-20.3,0Z\" transform=\"translate(-37.2 -15.3)\"/><rect x=\"240.8\" y=\"332.4\" width=\"4.5\" height=\"38\"/></g><g id=\"AXIS_Z_ARROW\"><path class=\"cls-10\" d=\"M313.5,374.2c.7,0,9.6,9.1,9.6,10.2,0,3.1-10.1,7.3-9.6,10.1-.2-1.1,4.2-20.3,0-20.3Z\" transform=\"translate(-37.2 -15.3)\"/><rect x=\"295.1\" y=\"365.2\" width=\"4.2\" height=\"38\" transform=\"translate(644.1 71.7) rotate(90)\"/></g></g><g id=\"ACCEL_ARROW\"><path class=\"cls-10\" d=\"M687,397.3c3.3,0,14,14.8,16.2,17.2s14.6,12.4,14.4,15.4-12,12.7-14.5,15.4-16.6,14.5-16.2,17c-1-5.1,2.8-12.7,3.4-17.9a142.9,142.9,0,0,0,.6-14.6c0-3.6-1.3-32.4-4-32.4Z\" transform=\"translate(-37.2 -15.3)\"/><rect x=\"418.3\" y=\"385\" width=\"15.1\" height=\"51.15\" transform=\"translate(-201.5 354.5) rotate(-40)\"/><rect x=\"626.3\" y=\"407.2\" width=\"29\" height=\"13\"/><rect x=\"398.8\" y=\"406.7\" width=\"29\" height=\"13\"/><path class=\"cls-11\" d=\"M647.4,410c-54.4,0-109.4-2.6-163.7,0-18.6.9-31.3,24.4-12,35.7,7.5,4.4,19,2.6,27.3,2.6H604.4c13.5,0,27.2.7,40.7,0,7.7-.4,14.7-2.3,18.9-9.5C671.3,426.4,662,410,647.4,410Z\" transform=\"translate(-37.2 -15.3)\"/><path class=\"cls-6\" d=\"M647.3,412.9c-54.1,0-108.4-1.5-162.5,0-15.1.4-27.8,18.5-12,29.2,6.8,4.6,18.7,2.7,26.5,2.7H602.1c13.8,0,27.6.3,41.3,0,5.6-.1,10.8-.3,15.1-4.7C668.4,430.4,661.3,412.9,647.3,412.9Z\" transform=\"translate(-37.2 -15.3)\"/><text class=\"cls-12\" transform=\"translate(444.8 421.7)\">Accelerometer</text></g></g><g id=\"BrainPad_Logo\"><path d=\"M213,115.4a35.9,35.9,0,0,1,11-1.4l-3.2,3c-5.9.4-12.1,2.3-14.2,8.2-1.1,3.1,1.4,4,0,7.4s-5,6.3-7.1,9.2c-3.8,5.5-7,10.6-4,17.3,3.8,8.5,11.5,4.9,16.3,10-8.3,3.9-16.9-2.4-19.9-10.1-4.5-11.3,3.5-16.9,9.5-25,2-2.7,2.3-2.8,2.9-5.4s-.9-3.4-.2-5.2,5.1-4.6,7.3-6.9c5.1-5.4,5.6-13.2,14.7-12.7-1.5,1.9-12.4,11.9-13,11.5\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M225.8,109.9c-7.1-3.5,11.8-18.9,16.6-13.6s-6.2,4-7.8,4.4-11,6.7-6.1,9C228.4,109.7,226.5,110.3,225.8,109.9Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M243.8,97.4c2.7-9,17.4-4.5,19,3,6.1-6.1-2-9.8-8.4-10.6s-12.3.5-13.5,6.6C241,95.9,243.6,97.3,243.8,97.4Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M243.3,101.2c1.5.9,2,5.2-.1,5.4,1.9-.2,4.9.1,5.2,2.7a13.1,13.1,0,0,1,3.1-2.1,10.2,10.2,0,0,0-3.8-2.4c.9-6.6-6.2-4.7-5.8-4.1A3.7,3.7,0,0,1,243.3,101.2Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M260.1,104.1c4.5,0,14.3,4.4,11.6,10.6-2.6-4.3-7.8-8.5-13.2-7.6s-4.9,4.7-7.9,6.5c-7.2,4.3-1.4-5.2,2.3-7.3,2.1-1.2,4.9-1.4,6.8-2.6s5.3-5.7,8.8-7.8c12.7-7.4,33.3-2.6,36.1,13.5q-5.6-.2-11.3-.1c3.8-.4,2.4-6.3,1.2-8.4-2.1-4-6.3-5.4-10.7-5.7a23.5,23.5,0,0,0-12.8,2.5c-3.5,1.9-6.4,7.2-10.9,6.4l.3-.4\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M269.1,84.6c2.2-.7,5.4-1.3,6.4,1.5,4.6-3.8,25.1-3.1,25.6,5.7a5.6,5.6,0,0,0-3.5,6.2c-.4-1.6-2.9-1.5-3.9-2.8,7.8-.1-4.6-8.2-7.2-8.6-8.5-1.3-8.3,4-13.4,7.2-.1-14.8-10.9,2.7-15.3-2.8C257.3,90.6,267.8,85,269.1,84.6Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M277.6,116.9c6.3-8.2,43.1-13.7,41.2,2.7-11.9-11.3-36.7-11.5-43,5.9C276.1,122.2,275.3,120,277.6,116.9Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M304.7,88.4c11.6,1.2,19.5,4.2,21.3,17-5.3-1.2-5.6-10.9-13.4-13-3.8-1-8.8-.7-12.6-.2,2.3-.3-.6-2.1-.8-2.8S304.9,88.4,304.7,88.4Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M330.2,106.2c7.1,2.9,10.3,12.5,1.4,15.4,17.4-13.8-19.4-13-21.1-16.1.3.6,22.9-1.1,26.6.2,6.6,2.4,11.4,16.6,6.8,22.6a9,9,0,0,0-2.6-1.4c.1-6.3,2.8-9.1-1.9-14.8-2.9-3.6-6-2.9-9.1-6\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M236.1,114.8c12.1-8.2,39.2,3.8,27.2,18.6-2.9-1.9-.2-4.3-1.1-7a14.5,14.5,0,0,0-6-8c-8.3-5.4-15.5,1.5-23.4-.1C232.1,118.2,237.1,114.1,236.1,114.8Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M328.5,126.6c9.1-3.2,23,2,18.3,13.1a11.5,11.5,0,0,0-8.5-10.8c-4.8-1.5-10.9,2.4-14.6,1.2C322.8,129.8,329.7,126.2,328.5,126.6Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M335.4,163.4c2.6-.9,6.4,2.1,10.2.9s8.4-4.7,10.2-8.5c3.5-7.2-.5-16.3-9.1-16.5a10,10,0,0,0,1.7-3.9c29,3-.7,52.9-15.7,29.1A9.1,9.1,0,0,1,335.4,163.4Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M263.9,157.8a10.7,10.7,0,0,0,4.6,4.2c-4,2-8.1,3.6-12.6,3.7,9.6-3.9,3.7-8.1,3.4-14.9a10.7,10.7,0,0,1,2.8-.7C262.1,150.2,263.7,157.4,263.9,157.8Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M217,172.4c5.2,1.9,12,2.2,16.8-.9,2.2-1.4,6.4-5,3.5-7.6-4.8,7-15.4,9.1-22.3,3.9-1.2-.9-5.2-7.9-6.9-3.6S215.5,171.9,217,172.4Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M235.4,174.8c6.1,4.3,20.2.3,26.9-.3s15.3-1.4,17.5-9.3a8.4,8.4,0,0,1-3.2-.3c-1.5,8.5-18.2,6.7-24.3,7.6-3.1.5-18.8,3.3-15.7-4.2C236.6,170.9,230.9,171.6,235.4,174.8Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M293.3,166.5c-2.9,2.6-3,5.1-7.7,6.3s-8.6-2.8-13.4-1.1c4.4,8.8,26.5,3.9,23.5-7.2C295.6,164.2,292.8,166.9,293.3,166.5Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M333.2,168.3c-6.7,3.3-13.5,2.3-20.3,3.5s-13,3.2-19.4-1.5l-2,2.4c6.4,6,15.9,2.8,23.1,1.7s19.9,1.1,23.4-6.8C335,166.8,336.1,166.9,333.2,168.3Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M210.3,142.8c.2,4.9,7.3,8.9,1.3,13.5,7.1-2,17.5,3.4,24-3.2s-.3-14-7-14.3c5.3-2.4,5.1-9.2,1.6-12.8s-7.9-3-12.2-2.9c-1.8,0-7.5-.4-8.8.8S210.3,140,210.3,142.8Z\" transform=\"translate(-37.2 -15.3)\"/><path class=\"cls-6\" d=\"M224.2,133.5c0-4.2-6.5-4.2-6.5,0S224.2,137.7,224.2,133.5Z\" transform=\"translate(-37.2 -15.3)\"/><path class=\"cls-6\" d=\"M226.6,146c0-4.2-6.5-4.2-6.5,0S226.6,150.2,226.6,146Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M247.4,159.6c-4.5-4-6-6-12.4-6.2,1.6-3.5,3.9-3.4,7.9-1.6l-.2-9.3q1.6-5-2.9-7.1c-1.3-3.1-4.8-7.1-2.1-10.7,3.9,7.5,5.1,11,14.5,11.3v3.3c6.3-5.9,14.4-5.7,15.6,4.2l-9.9,2.5c.6-6.2-5-.3-5.7,2.5C252,149.7,253,164.5,247.4,159.6Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M293.3,134.1c-2.9,5.5-22.2-6.7-22.4,8a68.9,68.9,0,0,0,8.5,0c-.6-4.6,7.5-3.7,5.9.4s-9.5,2.3-12,4.1c-11,7.6,13.1,15.9,15,7.2-.6,7.9,7.9,2.7,9.2-1.1s1.2-13.2-2.2-15.3c2.3-4.5-2.8-11.4-1.6-14C292.1,127,295.4,130,293.3,134.1Z\" transform=\"translate(-37.2 -15.3)\"/><path class=\"cls-6\" d=\"M287.7,149.6c0-3.6-7.9-3.6-8.1,0S287.7,153.2,287.7,149.6Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M313.9,127.3c0-6.1-11.2-6.1-11.2,0S313.9,133.5,313.9,127.3Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M304.1,149.7a31.9,31.9,0,0,1-2.2,13.3c9.3-11.5,20.5-5,32.3-4.6-3-2.1-8.3-11.7-2.3-14.2s3.8,9.3,3.4,11.9c16.5.3,5.2-30.3-5.6-16.1,0-5.7-4.7-3.5-9.6-3.5q.6,8.2.4,16.3a22.8,22.8,0,0,0-6.9.1c.2-7.1-.2-11.8.1-17.7,0,.8-9.2-.1-9.8.3C300.5,138.3,304,145.2,304.1,149.7Z\" transform=\"translate(-37.2 -15.3)\"/><path class=\"cls-73\" d=\"M369.2,133.8c-.1,7.6,1,15.3,1.3,22.9a68.6,68.6,0,0,0,11.7-.6c-.2-4-1.9-7.9-1.3-11.8,11.2-.5,24-12.6,9.4-20.3-3.7-2-14.1-2.9-18.2-1.2S369.2,127.7,369.2,133.8Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M386.2,133.4c0-4.8-7.7-4.8-7.7,0S386.2,138.2,386.2,133.4Z\" transform=\"translate(-37.2 -15.3)\"/><path class=\"cls-74\" d=\"M402.1,134.8c5.5-2.4,14.9-2.7,19.3,1.9s2.6,13.4,2.5,19.1l-8.8,1.1c-.3-1.1-.2-1.8-.6-2.9-5.3,7.8-26.1-.2-14.2-8.7,2.3-1.6,12.4-1.2,11.4-5.2s-7-1.5-6.2,1.7c-.8.1-8.5.2-8.5-.2C397,139.2,399.9,135.7,402.1,134.8Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M413.5,149.5c0-3.7-8-3.7-8,0S413.5,153.2,413.5,149.5Z\" transform=\"translate(-37.2 -15.3)\"/><path class=\"cls-73\" d=\"M442.8,135.4c-7,.9-13.8-2.3-15.8,6.9s8.3,19.5,17.3,12.5q.6,6.5,10.1,1.3c-3-9.1,1.4-34.3-.6-34.2,0,.4-8.5.1-9.1.5C440.4,125,442.6,131.2,442.8,135.4Z\" transform=\"translate(-37.2 -15.3)\"/><path d=\"M444.4,145.1c0-6.2-9.3-6.2-9.3,0S444.4,151.5,444.4,145.1Z\" transform=\"translate(-37.2 -15.3)\"/><path class=\"cls-75\" d=\"M200.7,125c-.2-6.3,7.9-11.7,11.7-16.1s8.9-7.4,14.4-10.5,11.8-6,17.9-9.3,10.5-1.4,15.7-3c3.4-1,5.2-4.5,9.2-5s5.2.7,7.8.6c4.3-.2,6.6-2.1,11.3-.8,3,.8,5.4,3.3,8.2,4.1,7.8,2.2,16.1-.6,23.5,3.9,5.3,3.2,4.5,7.5,7.7,11.4s1.6.8,5.7,2.7c10.4,4.7,12.7,7.3,14.4,19.1.7,4.9-.3,6.7,3.1,10.7s6,4.4,8.3,7.7a20.5,20.5,0,0,1,.7,22.3c-5.3,8.4-12,7.8-20.4,9.2s-17.5,5-26.7,6c-5.1.6-10.2,1.1-15.4.2s-6.9-.3-11.5-.2c-9.5.1-18.6-2-28.2-1-6.7.7-22.1,5.7-26.6-2-8.3,2.7-17.1-.9-25.2-2.6s-13.6-4.6-17-11.9a20.5,20.5,0,0,1,2.9-21.7C197.9,132.1,200.9,135.1,200.7,125Z\" transform=\"translate(-37.2 -15.3)\"/><text class=\"cls-76\" transform=\"translate(423 108.1)\">TM</text></g></svg>";
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        visuals.mkBoardView = function (opts) {
            return new visuals.BrainPadBoardSvg({
                runtime: pxsim.runtime,
                theme: visuals.randomTheme(),
                disableTilt: false,
                wireframe: opts.wireframe,
            });
        };
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        var AnalogPinControl = /** @class */ (function () {
            function AnalogPinControl(parent, defs, id, name) {
                this.parent = parent;
                this.defs = defs;
                this.id = id;
                this.pin = pxsim.board().edgeConnectorState.getPin(this.id);
                // Init the button events
                this.outerElement = parent.element.getElementById(name);
                pxsim.svg.addClass(this.outerElement, "sim-pin-touch");
                this.addButtonEvents();
                if (this.pin.used) {
                    pxsim.accessibility.makeFocusable(this.outerElement);
                    pxsim.accessibility.setAria(this.outerElement, "button", this.outerElement.firstChild.textContent);
                }
                // Init the gradient controls
                // const gid = `gradient-${CPlayPinName[id]}-level`;
                // this.innerCircle = parent.element.getElementById("PIN_CONNECTOR_" + CPlayPinName[id]) as SVGCircleElement;
                // this.gradient = svg.linearGradient(this.defs, gid);
                // this.innerCircle.setAttribute("fill", `url(#${gid})`);
                // this.innerCircle.setAttribute("class", "sim-light-level-button")
                // this.addLevelControlEvents()
                this.updateTheme();
            }
            AnalogPinControl.prototype.updateTheme = function () {
                var theme = this.parent.props.theme;
                pxsim.svg.setGradientColors(this.gradient, theme.lightLevelOff, 'darkorange');
            };
            AnalogPinControl.prototype.updateValue = function () {
                var value = this.pin.value;
                if (value === this.currentValue) {
                    return;
                }
                this.currentValue = value;
                // svg.setGradientValue(this.gradient, 100 - Math.min(100, Math.max(0, Math.floor(value * 100 / 1023))) + '%')
                // if (this.innerCircle.childNodes.length) {
                //    this.innerCircle.removeChild(this.innerCircle.childNodes[0])
                // }
                pxsim.svg.title(this.outerElement, value.toString());
            };
            AnalogPinControl.prototype.addButtonEvents = function () {
                var _this = this;
                pxsim.pointerEvents.down.forEach(function (evid) { return _this.outerElement.addEventListener(evid, function (ev) {
                    _this.pin.touched = true;
                    pxsim.svg.addClass(_this.outerElement, "touched");
                    pxsim.pxtcore.getTouchButton(_this.id).setPressed(true);
                }); });
                this.outerElement.addEventListener(pxsim.pointerEvents.leave, function (ev) {
                    _this.pin.touched = false;
                    pxsim.svg.removeClass(_this.outerElement, "touched");
                    pxsim.pxtcore.getTouchButton(_this.id).setPressed(false);
                });
                this.outerElement.addEventListener(pxsim.pointerEvents.up, function (ev) {
                    _this.pin.touched = false;
                    pxsim.svg.removeClass(_this.outerElement, "touched");
                    pxsim.pxtcore.getTouchButton(_this.id).setPressed(false);
                });
                pxsim.accessibility.enableKeyboardInteraction(this.outerElement, function () {
                    _this.pin.touched = true;
                    pxsim.svg.addClass(_this.outerElement, "touched");
                    pxsim.pxtcore.getTouchButton(_this.id).setPressed(true);
                }, function () {
                    _this.pin.touched = false;
                    pxsim.svg.removeClass(_this.outerElement, "touched");
                    pxsim.pxtcore.getTouchButton(_this.id).setPressed(false);
                });
            };
            AnalogPinControl.prototype.addLevelControlEvents = function () {
                var _this = this;
                var cy = parseFloat(this.innerCircle.getAttribute("cy"));
                var r = parseFloat(this.innerCircle.getAttribute("r"));
                var pt = this.parent.element.createSVGPoint();
                pxsim.svg.buttonEvents(this.innerCircle, function (ev) {
                    var pos = pxsim.svg.cursorPoint(pt, _this.parent.element, ev);
                    var rs = r / 2;
                    var level = Math.max(0, Math.min(1023, Math.floor((1 - (pos.y - (cy - rs)) / (2 * rs)) * 1023)));
                    if (level != _this.pin.value) {
                        _this.pin.value = level;
                        _this.updateValue();
                    }
                }, function (ev) { }, function (ev) { });
            };
            return AnalogPinControl;
        }());
        visuals.AnalogPinControl = AnalogPinControl;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));