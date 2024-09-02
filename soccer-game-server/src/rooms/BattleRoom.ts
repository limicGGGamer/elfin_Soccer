import { Room, Client, Delayed, matchMaker } from "@colyseus/core";
import { MyRoomState } from "./schema/MyRoomState";
//import { EntranceFee, RollbackEntranceFee, RewardFee, GameEvent } from "../thirdparties/GGGamersApi";
//import { syncTicket } from "../thirdparties/DynamodbAPI";
import { ReportGameEvent } from "../thirdparties/GGGamersApi";

export class BattleRoom extends Room<MyRoomState> {
  maxClients = 3;
  startedAt = 0;
  readyPlayer = 0;
  remoteRoomId: string = "";
  public delayedInterval!: Delayed;


  async onCreate(options: any) {
    this.lock();
    this.setPatchRate(25);
    this.setState(new MyRoomState());
    console.log("onCreate BattleRoom id: ", this.roomId);

    if (options.password) {
      console.log("password:", options.password);
      this.setPrivate();
    }

    //const gameOverRoom = await matchMaker.createRoom("gameOver", {});    
    this.onMessage("*", async (client, type, message) => {
      switch (type) {
        case "game-record":
          let ret = { gameid: this.roomId, players: [], ...message };
          let index: number = 0;
          this.state.players.forEach((player, sessionId) => {
            // console.log(player, sessionId, index);
            ret.players[ret.players.length] = {
              name: player.name,
              sessionId: player.sessionId,
              player
            };
            index++;
          });
          this.broadcast('game-event', { state: 'game-play', result: 1, data: message });
          console.log(`Battle ${this.roomId} - send data back to remote room (${this.remoteRoomId})`);
          break;
        //this.disconnect();
        case "game-player-data":
          //Players synchronize
          //console.log(message);
          //console.log(this.state.players);
          this.state.players.forEach((player, sessionId) => {
            //console.log(message?.playerId , player.sessionId);
            if (message?.playerId == player.sessionId) {
              player.posx = message?.posx;
              player.posy = message?.posy;
              player.shadowX = message?.shadowX;
              player.shadowY = message?.shadowY;
              player.shadowW = message?.shadowW;
              player.shadowH = message?.shadowH;
              // player.posz = message?.posz;
              // player.vecX = message?.vecX;
            }
          });
          break;
        case "get-players":

          let players = [];

          this.state.players.forEach((player, sessionId) => {
            let data = {
              id: player.sessionId,
              playerNumber: player.playerNumber,
              skinId: player.skinId
            };
            players.push(data);
          });
          // console.log("get-players: ",players);
          this.broadcast('get-players', { data: players });
          break;
        case "ball-data":
          this.state.balls.forEach((ball, sessionId) => {
            //console.log(message?.playerId , player.sessionId);
            if ("ball" == ball.uId) {
              ball.posX = message?.posX;
              ball.posY = message?.posY;
              ball.angle = message?.angle;
              ball.visible = message?.visible;
            }
          });

          break;
        case "set-player-lose":
          //Players synchronize
          console.log("set-player-lose:", message);
          this.state.players.forEach((player, sessionId) => {
            //console.log(message?.playerId , player.sessionId);
            if (message?.playerId == player.sessionId) {
              player.life = 0;
              player.rank = message?.rank
            }
          });
          break;
        case "game-start":
          this.readyPlayer++;
          console.log("game-start readyPlayer: ", this.readyPlayer);
          if (this.readyPlayer == this.maxClients - 1) {
            this.broadcast('game-start', { data: { isStart: true } });
            await matchMaker.remoteRoomCall(this.remoteRoomId, "closeRoom", [{ roomId: this.roomId }]);
          }

          break;
        case "update-game-data":
          this.broadcast('update-game-data', { data: { time: message?.time, player1score: message?.player1score, player2score: message?.player2score } });
          break;
        case "game-scene-data":
          switch (message?.event) {
            case "lockRoom":
              this.lock();
              this.broadcast('game-scene-data-update', { result: 1, event: message?.event });
              break;
            case "startcounting":
              this.broadcast('game-scene-data-update', { result: 1, event: message?.event });
              break;
            case "gamestart":
              this.broadcast('game-scene-data-update', { result: 1, event: message?.event });
              break;

          }
          //this.broadcast('game-scene-data-update', { result: 1, event: message['event'], hexId: message['hexId'] });
          break;

        case "game-over":
          console.log("gameover:", message);
          this.broadcast('game-event', { event: 'game-over', result: 1, data: message });
          setTimeout(() => {
            this.disconnect();
          }, 5000);
          /*const endedAt = Date.now();
          let _ret = { gameid: this.roomId, players: [], ...message };
          let tokens: string[] = [];
          let _index: number = 0;

          //console.log("gameover message:", message);       
          //console.log(this.clients);       
          this.state.players.forEach(async (player, sessionId) => {
            //console.log("player:", player?.player);
            _ret.players[_ret.players.length] = {
              "userId": (player as any)?.player?.userId,
              "gameSessionId": (player as any)?.player?.ticket,
              "passCred": (player as any)?.player?.passCred,
              "startedAt": this.startedAt,
              "endedAt": endedAt,
              "result": message[`player${_index + 1}`] === 1 ? "win" : "lose",
              "score": message[`player${_index + 1}`] === 1 ? 100 : 1,
              "serviceFee":0.1,
              "extra": options.password?{"message":"this is private room. It is event data."}:{}
            };
            tokens[tokens.length] = player?.accessToken;
            _index++;
          });

          this.broadcast('game-event', { state: 'game-over', result: 1, data: message });          
          //const payload = await matchMaker.remoteRoomCall(gameOverRoom.roomId, "StartUploadGameReport", [{ data: _ret, tokens: tokens, roomId: this.roomId }]);
          //if(payload){
          //  await matchMaker.remoteRoomCall(this.remoteRoomId, "closeRoom", [{ roomId: this.roomId }]);
          //  setTimeout(()=>{
          //    this.disconnect();
          //  }, 10000)            
          //}else{
            await matchMaker.remoteRoomCall(this.remoteRoomId, "closeRoom", [{ roomId: this.roomId }]);
            setTimeout(()=>{
                this.disconnect();
            }, 10000)    
          //}*/
          break;
        case "game-input":
          // console.log("type: ",type,"   message: ",message);
          switch (message?.event) {
            case "touchend":
              /*this.state.sangPads.forEach((sangPad, sessionId) => {
                    if(message?.playerId == sangPad.uId){
                        sangPad.sangPadX = 0;
                        sangPad.sangPadY = 0;
                        sangPad.sangPadAngle = 0;
                        sangPad.sangPadDis = 0;
                    }
                });*/
              break;
            case "jump":

              this.broadcast("game-input-response", { data: message });
              break;
            case "touchmove":
              /*this.state.sangPads.forEach((sangPad, sessionId) => {
                  if(message?.playerId == sangPad.uId){
                      sangPad.sangPadX = message?.sangPadX;
                      sangPad.sangPadY = message?.sangPadY;
                      sangPad.sangPadAngle = message?.sangPadConAngle;
                      sangPad.sangPadDis = message?.sangPadDis;
                  }
              });*/
              this.broadcast("game-input-response", { data: message });
              //this.broadcast('game-scene-data-update', { state: 'player-input', result: 1, data: message });
              break;
          }
          break;

        case "ping":
          // Respond with a "pong" message containing the same timestamp
          client.send("pong", { data: message });
          break;

        case "player-state":
          if (message?.type == "getLatestState") {
            let _player = this.state.players.get(message?.data?.userId);
            _player.accessToken = message?.data?.accessToken;

            this.broadcast("SyncPlayers", {});

            (client as any).options = { userId: message?.data?.userId };
            const syncTicketData = {
              "userId": message?.data?.userId,
              "ticket_id": (_player as any)?.player?.ticket,
              "state": "battle",
              "game_id": "MantaDao",
              "reconnectToken": this.roomId + ":" + client?._reconnectionToken
            }

            console.log("battle reconnection check:", syncTicketData);

            //const syncTicketPayload = await syncTicket(message?.data?.accessToken, JSON.stringify(syncTicketData));
            //console.log("reconnection Sync Ticket:",syncTicketPayload.data);
          }
          break;
        case "reportGameEvent":
          this.reportGameEvent(message);
          break;
      }
    });

  }

  async onJoin(client: Client, options: any) {
    this.unlock();
    if (this.state.players.size === this.maxClients - 1) {
      this.lock();
    }



    // if(this.state.players.size > 0)
    //     await matchMaker.remoteRoomCall(this.remoteRoomId, "closeRoom", [{ roomId: this.roomId }]);

    //check private
    if (options?.ticket) {
      let _player = this.state.players.get(options?.userId);
      //_player.accessToken = options?.accessToken;


      //sync-ticket state
      const syncTicketData = {
        "userId": options?.userId,
        "ticket_id": options?.ticket,
        "state": "battle",
        "game_id": "MantaDao",
        "reconnectToken": this.roomId + ":" + client?._reconnectionToken
      }

      //const syncTicketPayload = await syncTicket(options.accessToken, JSON.stringify(syncTicketData));
      //console.log('battle room payload :',syncTicketPayload.data , options.accessToken , syncTicketData);
      //if(syncTicketPayload.data.result !== 1)
      //throw new Error("Sync Ticket Error.");
    }

    /*if (this.state.players.size === this.maxClients-1){
      this.startedAt = Date.now();
      this.broadcast("battle-room-id", {});
      this.gameStart();      
      //await matchMaker.remoteRoomCall(this.remoteRoomId, "closeRoom", [{ roomId: this.roomId }]);
    }*/
  }

  async onLeave(client: Client, consented: boolean) {
    console.log("onLeave client.id: ", client.id, "   consented: ", consented);
    //this.disconnect();    
    this.state.players.get((client as any).options?.userId).connected = false;
    try {
      if (consented) {
        throw new Error("consented leave");
      }
      const reconnection = this.allowReconnection(client, "manual");

      // now it's time to `await` for the reconnection
      await reconnection;


      // client returned! let's re-activate it.
      this.state.players.get((client as any).options.userId).connected = true;

      const promise = await reconnection.promise;
      console.log("battle room reconnection token:", promise._reconnectionToken);
    } catch (e) {
      console.log("onLeave catch error: ", e);
      // reconnection has been rejected. let's remove the client.
      //this.state.players.delete((client as any).options.userId);
    }
  }

  async setPlayer(playerstate: any[]) {
    // @ts-ignore
    console.log(`Battle ${this.roomId} Set Player- received ${playerstate?.roomId} : true`);
    // @ts-ignore
    this.remoteRoomId = playerstate?.roomId;
    // @ts-ignore
    Object.entries(playerstate?.player).forEach(([sessionId, options], index) => {
      const _player = this.state.createPlayer((options as { sessionId: string })?.sessionId, options, index,
        (options as { uid: string })?.uid, "battle",
        (options as { walletid?: string })?.walletid,
        (options as { ticket?: string })?.ticket,
        (options as { passCred?: string })?.passCred,
        (options as { skinId: number })?.skinId,
        (options as { playerNumber: number })?.playerNumber);
      //this.broadcast("game-event", { event: `set-player${index + 1}`, data: { player: options, sessionId: (options as { uid: string })?.uid, figther: index} });
      this.state.createSangPad((options as { sessionId: string })?.sessionId);
      this.broadcast("game-event", {
        event: `set-player`, data: {
          sessionId: (options as { sessionId: string })?.sessionId,
          skinId: (options as { skinId: number })?.skinId, playerNumber: (options as { playerNumber: number })?.playerNumber
        }
      });
    });
    this.state.createBall("ball");

    return true;
  }

  async reportGameEvent(message) {

    const { scoreFirst, win, gameDuration, TwoShotTimes } = message;


    let _ret = { players: [] as any[] };
    let tokens: string[] = [];

    let index = 0;
    this.state.players.forEach(async (player, sessionId) => {
      _ret.players[this.state.players.size] = {
        "passId": player.passCred,
        "eventName": 'game_end',
        "eventProperties": {
          "scoreFirst": scoreFirst,
          "win": win,
          "gameDuration": gameDuration,
          "2shotTimes": TwoShotTimes,
        }
      };
      tokens[tokens.length] = player.accessToken;
      index++;
    });

    let payload;

    for (let i = 0; i < _ret.players.length; i++) {
      payload = await ReportGameEvent(tokens[i], _ret.players[i]);

      if (payload?.data?.code === 1) {
        console.log(`report game event bad request userId: ${_ret.players[i].userId}`);
        this.broadcast('game-event', { state: 'reportedGameEvent', result: 0 });
        return;
      }
    }

    this.broadcast('game-event', { state: 'reportedGameEvent', result: 1 });
  }

  async lockTheRoom() {
    if (!this.locked) {
      this.lock();
      return true;
    }
    return false;
  }

  gameStart() {
    this.broadcast("game-event", { event: "game-start" });
    //this.broadcast("server-game-start");
    console.log('game-start sent!');
    return true;
  }

  gameReset() {
    this.broadcast("game-event", {
      state: "game-closed-with-reason",
      message: "Game closed, pay back all fee"
    });
    this.disconnect();
    return true;
  }
}
