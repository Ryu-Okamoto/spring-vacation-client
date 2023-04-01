import "./App.css";
import { useCallback, useEffect, useState, useRef} from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { socket } from "./components/socket";

function App() {
  const [userName, setUserName] = useState("");
  const playerNames = useRef([]);
  const playerPositions = useRef([]);
  const { unityProvider, isLoaded, sendMessage, addEventListener} = useUnityContext({
    loaderUrl: "Build/test.loader.js",
    dataUrl: "Build/test.data",
    frameworkUrl: "Build/test.framework.js",
    codeUrl: "Build/test.wasm",
  });

  // 「Start」ボタン押下時の処理の登録
  useEffect(() => {
    if (isLoaded) {
      addEventListener("InformUsername", async function (userName) {
        setUserName(userName);
        sendMessage("TitleManager", "ChangeToWaiting");
        socket.emit("c2sRequestJoin", { "user": userName });
      });
    }
  }, [isLoaded]);

  // 「Ready」ボタン押下時の処理の登録
  useEffect(() => {
    if (userName) {
      addEventListener("InformReady", async function () {
        console.log(userName);
        socket.emit("c2sOK", { "user": userName });
      });
    }
  }, [userName]);

  // ユーザが消しゴムを引っ張ったときの処理の登録
  useEffect(() => {
    addEventListener("InformPullInfo", async function (directionX, directionY, rotation) {
      socket.emit("c2sPull",
        {
          "user": userName,
          "pullInfo": {
            "directionX": directionX,
            "directionY": directionY,
            "rotation": "null"
          }
        }
      );
    })
  });

  // 位置の計算が終わり、その結果が送られてきたときの処理の登録
  useEffect(() => {
    addEventListener("InformPosition", async function (isLast, playerName, positionX, positionY, positionZ) {
      playerPositions.current.push(
        { 
          "user": playerName, 
          "positionX": positionX,
          "positionY": positionY,
          "positionZ": positionZ
        }
      );
      if (isLast === 1) {
        socket.emit("c2sInformPositions", { "user": userName, "positions": playerPositions.current });
        playerPositions.current.splice(0);
      }
    });
  });


  function enablePull() {
    sendMessage("GameManager", "EnablePull", userName);
  }
  function reflectPullInfo(jsonString) {
    sendMessage("GameManager", "ReflectPullInfo", jsonString);
  }
  function synchronizePositions(jsonString) {
    sendMessage("GameManager", "SynchronizePositions", jsonString);
  }
  
  // サーバからの情報が送られてきたときの処理の登録
  useEffect(() => {
    if (isLoaded && userName) {

      // 参加者の入退室時
      socket.on("s2cInformUsers", (data) => {
        playerNames.current = data["users"];
        const infos = data["users"].map((name) => {return {"name": name, "ready": 1};});
        sendMessage("WaitingManager", "SetContent", "{ \"infos\": " + JSON.stringify(infos) + "}");
      });

      // ゲーム開始時
      socket.on("s2cStart", (json) => {
        const firstPlayer = json["firstUser"];
        playerNames.current = json["users"];
        sendMessage("WaitingManager", "ChangeToGame");
        sendMessage("GameManager", "Setup", "{ \"users\": " + JSON.stringify(playerNames.current) + " }");

        // TODO : missing method exception "GameMain.EnablePull"
        if (firstPlayer === userName)
          sendMessage("GameManager", "EnablePull", userName);
      });

      // 引っ張った情報の共有時
      socket.on("s2cSharePull", (json) => {
        if (userName !== json["user"])
          reflectPullInfo(JSON.stringify(json));
      });

      // 位置情報の同期時
      socket.on("s2cAveragePositions", (data) => {
        const nextPuller = data["nextUser"];
        synchronizePositions(JSON.stringify({ "positions": data["positions"] }));

        // TODO : missing method exception "GameMain.EnablePull"
        if (nextPuller === userName) 
          sendMessage("GameManager", "EnablePull", userName);
      });

      // ゲーム終了時
      socket.on("s2cInformResult", (data) => {
        const result = data["result"];
        console.log(result);
      });
    }
    else {
      socket.on("connect", () => { console.log("connected"); });
      socket.on("disconnect", () => { console.log("disconnected"); });
    }
  }, [isLoaded, userName]);

  return (
    <div 
      className="App"
      style={
        {
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }
    }
    >
      <Unity 
        unityProvider={unityProvider} 
        style={ 
          {
            width: 800,
            height: 400,
            background: "grey"
          }
        }
      />
    </div>
  );
}

export default App;
