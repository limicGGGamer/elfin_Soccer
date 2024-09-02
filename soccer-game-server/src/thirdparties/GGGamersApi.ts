import axios from 'axios';

// axios.defaults.baseURL = 'https://api.elfin.games';
axios.defaults.baseURL = 'https://api-testnet.elfin.games';
axios.defaults.headers.common['InvocationType'] = "Event";

const token = process.env.ENCRYPT_KEY;
const APIkey = process.env.ACCESS_KEY_ID;
const APIsecret = process.env.ACCESS_KEY_SECRET;
const topicArn = process.env.TOPIC_ARN;

console.log({
    token,
    APIkey,
    APIsecret,
    topicArn
})

interface Payload {
    [key: string]: any
}

export async function userinfo(auth_token: string) {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth_token}`
      }
    };

    return axios.get("/oauth2/userinfo", config).catch(resp => ({ ...resp.response, error: resp.response.data?.message || 'Error found!' }));
}

export async function transferWallet(auth_token: string, signature_data: string) {
    const config = {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `Bearer ${auth_token}`
      }
    };    

    console.log("Signature data:",signature_data);

    return axios.post("/oauth2/transfer/token", JSON.parse(signature_data), config).catch(resp => ({ ...resp.response, error: resp.response.data?.message || 'Error found!' }));
}

export async function ReportGameInfo(auth_token: string, data: any[]) {
    const config = {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `Bearer ${auth_token}`
      }
    }; 

    /*const data = [{
        "userId": userId,　//用户ID，＊必需
        "gameSessionId": gameSessionId,　//游戏会话ID，＊必需
        "startedAt": startedAt, //对局开始时间，毫秒时间戳，＊必需
        "endedAt": endedAt, //对局结束时间，毫秒时间戳，＊必需
        "result": result, //游戏结果，三种结果（win,lose,draw）选其一。＊必需
        "serviceFee":0.1,//游戏费用,
        "extra": extra?extra:{} //游戏传递额外信息，JSON对象
    }]; */


    console.log("game over data check:",data);

    return axios.post("/oauth2/game/report", data, config).catch(resp => ({ ...resp.response, error: resp.response.data?.message || 'Error found!' }));
}

export async function ReportGameEvent(auth_token: string, data: any[]){
  const config = {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': `Bearer ${auth_token}`
    }
  }; 

  
  /*
  {
    "passId": "0x0e9a10a6c199382fe2d2221669a39b939a29abcf1563b288cef4fb90221d10dc",//⻔票ID
    "eventName": "score",// 事件名称
    "eventProperties": {
      "scoreFirst": true// 是否率先得分
    }
  }
  
  {
    "passId": "0x0e9a10a6c199382fe2d2221669a39b939a29abcf1563b288cef4fb90221d10dc",// ⻔票ID
    "eventName": "game_end",// 事件名称
    "eventProperties": {
        "win": true,// 是否胜利
        "score": 500,// 游戏得分
        "gameDuration": 50,// 游戏对局时⻓，单位: 秒
        "2shotTimes": 1,// 2shot 次数
        "neverMissAShot": true// 是否⽆miss
      }
  }
  */

  console.log("ReportGameEvent data check:",data);

  return axios.post("/oauth2/event/report", data, config).catch(resp => ({ ...resp.response, error: resp.response.data?.message || 'Error found!' }));
}


export async function getGamePass(auth_token: string) {
    const config = {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `Bearer ${auth_token}`
      }
    }; 

    return axios.get("/oauth2/game/pass", config).catch(resp => ({ ...resp.response, error: resp.response.data?.message || 'Error found!' }));
}

export async function payGamePass(auth_token: string, _data: string) {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth_token}`
      }
    }; 
    return axios.post("/oauth2/game/pass/pay", JSON.parse(_data), config).catch(resp => ({ ...resp.response, error: resp.response.data?.message || 'Error found!' }));
}

export async function gameStart(auth_token: string, passId: string) {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth_token}`
      }
    }; 

    const data = {
        "passId": passId
    }
    return axios.post("/oauth2/game/start", data, config).catch(resp => ({ ...resp.response, error: resp.response.data?.message || 'Error found!' }));
}