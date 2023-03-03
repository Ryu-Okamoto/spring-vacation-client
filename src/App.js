import "./App.css";
import { io } from "socket.io-client";
import { useCallback, useEffect, useState} from "react";
import { Unity, useUnityContext } from "react-unity-webgl";

class Position {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

function App() {
  const [socketInstance, setSocketInstance] = useState("");
  const [user, setUser] = useState("");
  const [userButtonStatus, setUserButtonStatus] = useState(false);
  const [readyButtonStatus, setReadyButtonStatus] = useState(false);
  const { unityProvider, sendMessage , addEventListener, removeEventListener , isLoaded} = useUnityContext({
    loaderUrl: "Build/test.loader.js",
    dataUrl: "Build/test.data",
    frameworkUrl: "Build/test.framework.js",
    codeUrl: "Build/test.wasm",
  });

  let users = [];


  const handleName = (e) => {
    const name = e.target.value;
    setUser(name);
  };

  const handleUserClick = () => {
    //startボタン
    if (userButtonStatus === false) {
      setUserButtonStatus(true);
    } else {
      setUserButtonStatus(false);
    }
  };

  const handleReadyClick = () => { 
    if (readyButtonStatus === false) {
      socketInstance.on("s2cStart", (json) => {
        const firstUser = json["firstUser"];
        const users = json["users"];
        console.log("start from server");
        console.log(JSON.stringify(users));

        // TODO: 消しゴムとユーザの結びつけ

        setup(JSON.stringify(users));
        if (firstUser === user) {
          enablePull();
        }
      });
      socketInstance.on("s2cSharePull", (json) => {
        if (user !== json["user"]) {
          reflectPullInfo(JSON.stringify(json));
        }
      });
      socketInstance.emit("c2sOK", { "user": user });
      setReadyButtonStatus(true);
    } else {
      setReadyButtonStatus(false);
    }
  };

  // TODO : Unity -> React は引数は数字1コまたは文字列1コだけ
  const handleInformPullInfo = useCallback((directionX, directionY, rotation) => {
    console.log(directionX, directionY, rotation);
    console.log("Unityだよ");
    socketInstance.emit("c2sPull", { "user": user , "pullInfo": { "directionX": directionX, "directionY": directionY , "rotation": rotation } });
   }, []);

  const handleInformPositions = useCallback((directionX, directionY, rotation) => {
    console.log(directionX, directionY, rotation);
    console.log("Unityだよ");
    // positions = toJSON(jsonString);
    socketInstance.emit("c2sInformPositions", { "user": user , "positions": positions });
  }, []); 

  function setup(json) {
    sendMessage(
      "GameManager",
      "Setup",
      "{\"users\":[\"alice\", \"bob\", \"carol\", \"dave\", \"ellen\"]}"
    );
  }
  function enablePull() {
    sendMessage("GameManager", "EnablePull");
  }
  function reflectPullInfo(jsonString) {
    sendMessage("GameManager", "ReflectPullInfo", jsonString);
  }
  function synchronizePositions(jsonString) {
    sendMessage("GameManager", "SynchronizePositions", jsonString);
  }

  useEffect(() => {
    //ここでサーバーにconnectが送られる
    const socket = io("localhost:5001/", {
      transports: ["websocket"],
      cors: {
        origin: "http://localhost:3000/",
      },
    });

    setSocketInstance(socket);

    socket.on("connect", (data) => {
      socket.emit("c2sRequestJoin", { "user": user });
    });

    socket.on("s2cInformUsers", (data) => {
      users = data["users"].map(x => {return x["user"];});
    });

    socket.on("s2cAveragePositions", (data) => {
      synchronizePositions({ "positions": data["positions"] });
      if (user === data["nextUser"]) 
        enablePull();
    });

    socket.on("s2cInformResult", (data) => {
      //TODO 結果の表示
      result = data["result"];
    });

    socket.on("disconnect", (data) => {
      console.log(data);
    });

    return function cleanup() {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (userButtonStatus === true) {
      socketInstance.on("s2cInformUsers", (json) => {
        //TODO: 誰が参加しているかを表示する
        users = json["users"];
        console.log(users);
      });
      socketInstance.emit("c2sRequestJoin", { user });
    }
  }, [userButtonStatus]);

  useEffect(() => {
    addEventListener("InformPullInfo", handleInformPullInfo);
    addEventListener("InformPositions", handleInformPositions);
    return () => {
      removeEventListener("InformPullInfo", handleInformPullInfo);
      removeEventListener("InformPositions", handleInformPositions);
    };
   }, [addEventListener, removeEventListener, handleInformPullInfo]);

  return (
    <div className="App">
      <h1>けしばと</h1>
      {userButtonStatus ? (
        <>
          <button onClick={handleReadyClick}>ready</button>
          <Unity
            unityProvider={unityProvider}
            style={{
              visibility : readyButtonStatus ? "visible" : "hidden",
              height: 400,
              width: 800,
              border: "2px solid black",
              background: "grey",
            }}
          />
        </>
      ) : (
        <>
          <h2>
            input your username:
            <input type="text" value={user} onChange={handleName}></input>
          </h2>
          <button onClick={handleUserClick}>join</button>
        </>
      )}
    </div>
  );
}

export default App;
