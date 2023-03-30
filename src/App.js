import "./App.css";
import { useCallback, useEffect, useState, useRef} from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { socket } from "./components/socket";

function App() {
  const [user, setUser] = useState("");
  const users = useRef([]);
  const positions = useRef([]);
  const { unityProvider, sendMessage , addEventListener, removeEventListener } = useUnityContext({
    loaderUrl: "Build/test.loader.js",
    dataUrl: "Build/test.data",
    frameworkUrl: "Build/test.framework.js",
    codeUrl: "Build/test.wasm",
  });

  const handleInformUsername = useCallback((username) => {
    setUser(username);
    changeToWaiting();
    socket.emit("c2sRequestJoin", { "user": username });
  });
  
  const handleInformReady = useCallback(() => {
    socket.emit("c2sOK", { "user": user });
  });

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
  }, [user]);

  const handleInformPosition = useCallback((isLast, username, positionX, positionY, positionZ) => {
    positions.current.push(
      { 
        "user": username , 
        "positionX": positionX,
        "positionY": positionY,
        "positionZ": positionZ
      }
      );
    if (isLast === 1) {
      socket.emit("c2sInformPositions", { "user": user, "positions": positions.current });
      positions.current.splice(0);
    }
  }, [user]); 

  // message to TitleManager
  function postNotice(content) {
    sendMessage("TitleManager", "PostNotice", content);
  }
  function changeToWaiting() {
    sendMessage("TitleManager", "ChangeToWaiting");
  }

  // message to WaitingManager
  function setContent(jsonString) {
    sendMessage("WaitingManager", "SetContent", jsonString);
  }
  function changeToGame() {
    sendMessage("WaitingManager", "ChangeToGame");
  }

  // message to GameManager
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
      users.current = data["users"];
      
      // check
      let infos = data["users"].map((name) => {return {"name": name, "ready": 1};});
      setContent("{ \"infos\": " + JSON.stringify(infos) + "}");
    });

    socket.on("s2cStart", (json) => {
      const firstUser = json["firstUser"];
      users.current = json["users"];
      changeToGame();
      setup("{ \"users\": " + JSON.stringify(users.current) + " }");
      if (firstUser === user)
        enablePull(firstUser);
    });

    socket.on("s2cSharePull", (json) => {
      if (user !== json["user"])
        reflectPullInfo(JSON.stringify(json));
    });

    socket.on("s2cAveragePositions", (data) => {
      synchronizePositions(JSON.stringify({ "positions": data["positions"] }));
      console.log(data["nextUser"])
      if (user === data["nextUser"]) 
        enablePull(user);
    });
    
    socket.on("s2cInformResult", (data) => {
      const result = data["result"];
      console.log(result);
    });

    socket.on("disconnect", (data) => {
      console.log(data);
      // TODO: 結果の出力
    });
  }, []);

  useEffect(() => {
    addEventListener("InformUsername", handleInformUsername);
    addEventListener("InformReady", handleInformReady);
    addEventListener("InformPullInfo", handleInformPullInfo);
    addEventListener("InformPosition", handleInformPosition);
    return () => {
      removeEventListener("InformUsername", handleInformUsername);
      removeEventListener("InformReady", handleInformReady);
      removeEventListener("InformPullInfo", handleInformPullInfo);
      removeEventListener("InformPosition", handleInformPosition);
    };
   }, [addEventListener, removeEventListener, handleInformPullInfo, handleInformPosition]);

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
