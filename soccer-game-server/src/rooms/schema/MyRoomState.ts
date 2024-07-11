
import { Schema, type, MapSchema } from "@colyseus/schema";

import { Entity } from "./Entity";
import { Player } from "./Player";
import { SangPad } from "./SangPad";
import { Ball } from "./Ball";

export const DEFAULT_PLAYER_RADIUS = 10;
export const WORLD_SIZE = 2000;


export class MyRoomState extends Schema {

  @type("number") timeElapsed = 0;
  @type("boolean") gameStart = false;
  @type("boolean") waitingForServer = false;
  @type("boolean") joiningServer = false;
  @type({ map: Entity }) entities = new MapSchema<Entity>();
  @type({ map: Player }) players = new MapSchema<Player>();
  @type({ map: Ball }) balls = new MapSchema<Ball>();
  @type({ map: SangPad }) sangPads = new MapSchema<SangPad>();

  populate() {

  }

  createPlayer(sessionId: string, props: any, number:any, userId:string, state: string, walletId: string, ticket:string, passCred:string, 
    skinId: number, playerNumber: number, shadowX: number, shadowY: number, shadowW: number, shadowH: number) {
    console.log('createPlayer sessionId :', sessionId, '    playerNumber; ',playerNumber);
    //console.log('props :', props);
    const player = new Player().assign(props?.data || props);
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
    player.playerNumber = playerNumber?playerNumber:-1;
    this.players.set(sessionId, player);
    return player;
  }
  
  createSangPad(uId:string){
    const sangPad = new SangPad();
    sangPad.uId = uId;
      sangPad.sangPadX = 0;
      sangPad.sangPadY = 0;
      sangPad.sangPadAngle = 0;
      sangPad.sangPadDis = 0;
    this.sangPads.set(uId, sangPad);
}
  createBall(uId:string){
    const ball = new Ball();
    ball.uId = uId;
    ball.posX = 0;
    ball.posY = 0;
    this.balls.set(uId, ball);
  }
}
