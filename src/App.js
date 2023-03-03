import "./App.css";
import { io } from "socket.io-client";
import { useCallback, useEffect, useState} from "react";
import { Unity, useUnityContext } from "react-unity-webgl";

function App() {
  const [user, setUser] = useState("");
  const [userButtonStatus, setUserButtonStatus] = useState(false);
  const [readyButtonStatus, setReadyButtonStatus] = useState(false);
  const { unityProvider, sendMessage , addEventListener, removeEventListener } = useUnityContext({
    loaderUrl: "Build/public.loader.js",
    dataUrl: "Build/public.data",
    frameworkUrl: "Build/public.framework.js",
    codeUrl: "Build/public.wasm",
  });

  let users = [];
  let positions = [];

  const socket = io("localhost:5001/", {
    transports: ["websocket"],
    cors: {
      origin: "http://localhost:3000/",
    },
  });
  
  const handleName = (e) => {
    const name = e.target.value;
    setUser(name);
  };

  const handleUserClick = () => {
    
    socket.emit("c2sRequestJoin", { "user": user });
    if (userButtonStatus === false) {
      setUserButtonStatus(true);
    }
  };
  
  const handleReadyClick = () => { 
    socket.on("s2cStart", (json) => {
      const firstUser = json["firstUser"];
      users = json["users"];
      console.log("start from server");
      console.log(JSON.stringify(users));
      setup("{ \"users\": " + JSON.stringify(users) + " }");
      if (firstUser === user) {
        enablePull(firstUser);
      }
    });
    
    socket.on("s2cSharePull", (json) => {
      console.log(JSON.stringify(json));
      if (user !== json["user"])
        reflectPullInfo(JSON.stringify(json));
    });
    
    socket.on("s2cAveragePositions", (data) => {
      synchronizePositions({ "positions": data["positions"] });
      if (user === data["nextUser"]) 
      enablePull(user);
    });
    
    if (readyButtonStatus === false) {
      setReadyButtonStatus(true);
      socket.emit("c2sOK", { "user": user });
    }
  };

  const handleInformPullInfo = useCallback((directionX, directionY, rotation) => {
    socket.emit("c2sPull", 
      { 
        "user": user , 
        "pullInfo": {
          "directionX": directionX,
          "directionY": directionY,
          "rotation": "null" 
        }
      }
    );
  }, [socket]);

  const handleInformPosition = useCallback((isLast, username, positionX, positionY, positionZ) => {
    positions.push(
      { 
        "user": username , 
        "positionX": positionX,
        "positionY": positionY,
        "positionZ": positionZ
      }
      );
    if (isLast === 1)
      socket.emit("c2sInformPositions", { "positions": positions });
  }, [socket]); 

  function setup(jsonString) {
    sendMessage("GameManager", "Setup", jsonString);
  }
  function enablePull() {
    sendMessage("GameManager", "EnablePull", user);
  }
  function reflectPullInfo(jsonString) {
    sendMessage("GameManager", "ReflectPullInfo", jsonString);
  }
  function synchronizePositions(jsonString) {
    sendMessage("GameManager", "SynchronizePositions", jsonString);
  }
  
  useEffect(() => {
    socket.on("connect", (data) => {});

    socket.on("s2cInformUsers", (data) => {
      console.log("s2cInformUsers");
      users = data["users"];
    });
    
    socket.on("s2cInformResult", (data) => {
      //TODO 結果の表示
      const result = data["result"];
    });

    socket.on("disconnect", (data) => {
      console.log(data);
    });
  }, [socket]);

  useEffect(() => {
    addEventListener("InformPullInfo", handleInformPullInfo);
    addEventListener("InformPosition", handleInformPosition);
    return () => {
      removeEventListener("InformPullInfo", handleInformPullInfo);
      removeEventListener("InformPosition", handleInformPosition);
    };
   }, [addEventListener, removeEventListener, handleInformPullInfo, handleInformPosition]);

  return (
    <div className="App">
      <h1>けしばと</h1>
      {userButtonStatus ? (
        <>
          <h2>
            input your username:
            <input type="text" value={user} onChange={handleName}></input>
          </h2>
          <button onClick={handleUserClick}>join</button>
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
