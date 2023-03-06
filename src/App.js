import "./App.css";
import { useCallback, useEffect, useState, useRef} from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { socket } from "./components/socket";

function App() {
  const [user, setUser] = useState("anonymous");
  const users = useRef([]);
  const positions = useRef([]);
  const [userButtonStatus, setUserButtonStatus] = useState(false);
  const [readyButtonStatus, setReadyButtonStatus] = useState(false);
  const { unityProvider, sendMessage , addEventListener, removeEventListener } = useUnityContext({
    loaderUrl: "Build/public.loader.js",
    dataUrl: "Build/public.data",
    frameworkUrl: "Build/public.framework.js",
    codeUrl: "Build/public.wasm",
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
    setReadyButtonStatus(true);
    socket.on("s2cStart", (json) => {

      console.log("start");

      const firstUser = json["firstUser"];
      users.current = json["users"];
      setup("{ \"users\": " + JSON.stringify(users.current) + " }");
      if (firstUser === user) {
        enablePull(firstUser);
      }
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
    socket.emit("c2sOK", { "user": user });
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
    addEventListener("InformPullInfo", handleInformPullInfo);
    addEventListener("InformPosition", handleInformPosition);
    return () => {
      removeEventListener("InformPullInfo", handleInformPullInfo);
      removeEventListener("InformPosition", handleInformPosition);
    };
   }, [addEventListener, removeEventListener, handleInformPullInfo, handleInformPosition]);

  return (
    <div className="App">
      <h1>keshibato!</h1>
      {userButtonStatus ?
        <> 
          <Unity 
            unityProvider={unityProvider} 
            style={ 
              {
                visibility: readyButtonStatus ? "visible" : "hidden",
                width: 800,
                height: 400,
                background: "grey"
              }
            }
          />
          {readyButtonStatus ? <></> : <button onClick={handleReadyClick}>ready</button>}
        </>
        :
        <>
          <h2>
            your name : 
            <input type="text" value={user} onChange={handleName}></input>
          </h2>
          <button onClick={handleUserClick}>join</button>
        </>
      }
    </div>
  );
}

export default App;
