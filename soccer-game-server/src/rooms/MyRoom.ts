import { Room, Client, Delayed, matchMaker, ServerError } from "@colyseus/core";
import { MyRoomState } from "./schema/MyRoomState";

export class MyRoom extends Room<MyRoomState> {
  maxClients = 2;
  // maxClients = 1; //testing
  public delayedInterval!: Delayed;
  privateRoom:any;
  battleRoom:any;
  // autoDispose = false;  
  privateMode = false;

  onCreate(options: any) {
    this.setState(new MyRoomState());    
    if (options.password) {
      console.log("queue room password: ", options.password);
      this.setPrivate();
    }
    console.log("onCreate queue room");

    this.onMessage("*", async (client, type, message) => {
      //console.log(client.sessionId, "sent message:", type, message);
      switch (type) {

        case "game-event":
          /*if (message === "ready") {
            let playerIdx = 0;
            // @ts-ignore
            this.state.players.forEach((player, sessionId) => {
              data = { ...data, [`player${++playerIdx}`]: { ...player, sessionId } };
            });
            client.send('game-response', JSON.stringify({ result: 1, data }));
          }*/
          break;

        case "player-state":
          /*if(message?.type === "getLatestState"){
            const player = this.state.players.get(client.sessionId);
            player.accessToken = message?.data?.accessToken;
            if(this?.battleRoom){
              const options = { accessToken: message?.data?.accessToken, sessionId: client?.sessionId, walletid: (player as any)?.walletid, name:player?.name, userId:(player as any)?.uid, ticket:player?.ticket, passCred:player?.passCred };
              const matchData = await matchMaker.reserveSeatFor(this?.battleRoom, options);
              if(matchData && !player.reserveSeat) {
                client.send("reserveSeatFor", { data: matchData });
                player.reserveSeat = true;
                client.send("game-event", {
                  state: "game-start",
                  message: "Connecting to server"
                });
              }
            }
            const syncTicketData = {
              "userId": message?.data?.userId,
              "ticket_id": player?.ticket,
              "state": "queue",
              "game_id": "MantaDao",
              "reconnectToken": this.roomId+":"+ client?._reconnectionToken
            }

            console.log("battle reconnection check:", syncTicketData);

            const syncTicketPayload = await syncTicket(message?.data?.accessToken, JSON.stringify(syncTicketData));
            console.log("reconnection Sync Ticket:",syncTicketPayload.data);
          }
          */
          break;
          case "game-input":
          //console.log("game-input-response:", message?.event);
          switch(message?.event){
              case "select-skin":
                let _player = this.state.players.get(message?.data?.userId);
                _player.skinId = message?.data?.skinId;
                console.log("userId: ",message?.data?.userId,"  player.skinId:", _player.skinId);
                this.broadcast("game-input-response", { data: message });

              break;
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
      }
    });
  }

  async onJoin(client: Client, options: any) {
    console.log("queue room on join reconnect token:", this.roomId+":"+ client?._reconnectionToken );
    // this.lock();

    //checking the password
    if(options.password && options.password == this.listing.password){
      client.send("privateRoomId", { data: this.roomId });
      this.privateMode = true;
    } 

    if(!this.privateMode){
      //sync-ticket state
      /*const syncTicketData = {
        "userId": options?.player?.uid,
        "ticket_id": (client as any)?.ticket,
        "state": "queue",
        "game_id": "Slavebox",
        "reconnectToken": this.roomId+":"+ client?._reconnectionToken
      }

      const syncTicketPayload = await syncTicket(options.accessToken, JSON.stringify(syncTicketData));
      */
    }

    const player = this.state.createPlayer(client.sessionId, options?.player, this.state.players.size, "N/A", "queue", "N/A", "N/A", "N/A", options?.skinId);
    //const player = this.state.createPlayer(client.sessionId, options?.player, this.state.players.size, options?.player?.uid, "queue", options?.player?.walletid, (client as any)?.ticket, (client as any)?.passCred);  

    player.playerNumber = this.state.players.size;

    console.log("this.state.players.size: ",this.state.players.size);
    // When room is full
    if (this.state.players.size === this.maxClients) {
     this.lock();
      //Get Avaliable room to calculate waiting time.
      // const battleRooms = await matchMaker.query({ name: "battleRoom"});      
      // const queueRooms = await matchMaker.query({ name: "queue"});      

      //For private mode, select the correct private room
      if(this.privateMode){
        //battleRooms.forEach((room)=>{
          //console.log(room.locked, room.private , room.password, options.password);
          //if(!room.locked && room.private && room.password == options.password){
          //  this.privateRoom = room;
          //}        
        //});
      }else{
          //client.send("RoomLength", { data: queueRooms.length/battleRooms.length });
      }     

        this.delayedInterval = this.clock.setInterval(async () => {          //send room length to clients

          const battleRoom = this.privateMode?this.privateRoom:await matchMaker.findOneRoomAvailable("battleRoom", { mode: 'autogame' });          
          
          console.log("have battleRoom: ",battleRoom);
          if (battleRoom) {

            this.battleRoom = battleRoom;
            //const lockPayload = await matchMaker.remoteRoomCall(battleRoom.roomId, "lockTheRoom", [{}]);
            //if(!lockPayload)
            //    return;


            let players: any = [];
            // @ts-ignore
            this.state.players.forEach(async (player) => {
              players[players?.length] = { ...player, player: player };

              const client = this.clients.getById(player.sessionId);
              console.log("player.playerNumber; ",player.playerNumber);
              const options = { accessToken:player?.accessToken, sessionId: player?.sessionId, walletid: (player as any)?.walletid, userId:(player as any)?.uid, name:player?.name, ticket:player?.ticket, passCred:player?.passCred, playerNumber: player.playerNumber };
                            
              if(client){
                client.send("get-my-sessionId", { data: player?.sessionId });       
                const matchData = await matchMaker.reserveSeatFor(this.battleRoom, options);
                client.send("reserveSeatFor", { data: matchData });       
                player.reserveSeat = true;         
              }
            });

            console.log("battle-room-id");
            this.broadcast("battle-room-id", {});
            const payload = await matchMaker.remoteRoomCall(battleRoom.roomId, "setPlayer", [{ roomId: this.roomId, player: players, options:options, sessionId:client.sessionId }]);
            if(payload){
              this.broadcast("game-event", {
                state: "game-join",
                message: "Connecting to server"
              });
            }

            this.delayedInterval.clear();
            }          
        }, 2000);

      this.state.waitingForServer = true;
    }
  }

  async onLeave(client: Client, consented: boolean) {
    //this.state.players.get(client.sessionId).connected = false;

    try {
      /*if (consented) {
          throw new Error("consented leave");
      }
      const reconnection = this.allowReconnection(client, "manual");

      // now it's time to `await` for the reconnection
      await reconnection;

      // client returned! let's re-activate it.
      this.state.players.get(client.sessionId).connected = true;
      console.log("player reconnected");

      const promise = await reconnection.promise
      console.log("queue room reconnection token:", promise._reconnectionToken);
      //sync ticket
      */
    } catch (e) {
      this.state.players.delete(client.sessionId);
    }
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

  closeRoom(){
    this.broadcast("game-event", {
        state: "game-joined",
        message: "Connecting to server"
    });
    setTimeout(()=>{
        this.disconnect();
    }, 5000);
  }
}
