"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyRoomState = exports.WORLD_SIZE = exports.DEFAULT_PLAYER_RADIUS = void 0;
const schema_1 = require("@colyseus/schema");
const Entity_1 = require("./Entity");
const Player_1 = require("./Player");
const SangPad_1 = require("./SangPad");
const Ball_1 = require("./Ball");
exports.DEFAULT_PLAYER_RADIUS = 10;
exports.WORLD_SIZE = 2000;
class MyRoomState extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.timeElapsed = 0;
        this.gameStart = false;
        this.waitingForServer = false;
        this.joiningServer = false;
        this.entities = new schema_1.MapSchema();
        this.players = new schema_1.MapSchema();
        this.balls = new schema_1.MapSchema();
        this.sangPads = new schema_1.MapSchema();
    }
    populate() {
    }
    createPlayer(sessionId, props, number, userId, state, walletId, ticket, passCred, skinId, playerNumber, shadowX, shadowY, shadowW, shadowH) {
        console.log('createPlayer sessionId :', sessionId, '    playerNumber; ', playerNumber);
        //console.log('props :', props);
        const player = new Player_1.Player().assign(props?.data || props);
        player.posx = -9999;
        player.posy = -9999;
        player.posz = 0;
        player.vecX = 0;
        player.life = 100;
        player.rank = "0";
        player.skinId = skinId;
        player.shadowX = shadowX;
        player.shadowY = shadowY;
        player.shadowW = shadowW;
        player.shadowH = shadowH;
        player.fighter = number;
        player.reserveSeat = false;
        player.userId = userId;
        player.state = state;
        player.walletId = walletId;
        player.ticket = ticket;
        player.passCred = passCred;
        player.sessionId = sessionId;
        player.playerNumber = playerNumber ? playerNumber : -1;
        this.players.set(sessionId, player);
        return player;
    }
    createSangPad(uId) {
        const sangPad = new SangPad_1.SangPad();
        sangPad.uId = uId;
        sangPad.sangPadX = 0;
        sangPad.sangPadY = 0;
        sangPad.sangPadAngle = 0;
        sangPad.sangPadDis = 0;
        this.sangPads.set(uId, sangPad);
    }
    createBall(uId) {
        const ball = new Ball_1.Ball();
        ball.uId = uId;
        ball.posX = 0;
        ball.posY = 0;
        this.balls.set(uId, ball);
    }
}
exports.MyRoomState = MyRoomState;
__decorate([
    (0, schema_1.type)("number")
], MyRoomState.prototype, "timeElapsed", void 0);
__decorate([
    (0, schema_1.type)("boolean")
], MyRoomState.prototype, "gameStart", void 0);
__decorate([
    (0, schema_1.type)("boolean")
], MyRoomState.prototype, "waitingForServer", void 0);
__decorate([
    (0, schema_1.type)("boolean")
], MyRoomState.prototype, "joiningServer", void 0);
__decorate([
    (0, schema_1.type)({ map: Entity_1.Entity })
], MyRoomState.prototype, "entities", void 0);
__decorate([
    (0, schema_1.type)({ map: Player_1.Player })
], MyRoomState.prototype, "players", void 0);
__decorate([
    (0, schema_1.type)({ map: Ball_1.Ball })
], MyRoomState.prototype, "balls", void 0);
__decorate([
    (0, schema_1.type)({ map: SangPad_1.SangPad })
], MyRoomState.prototype, "sangPads", void 0);
