import "./App.css";
import { useCallback, useEffect, useState } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { socket } from "./components/socket";

import { Title } from "./pages/Title";
import { Waiting } from "./pages/Waiting";
import { Result } from "./pages/Result";

function App() {
  const { unityProvider, isLoaded, sendMessage , addEventListener, removeEventListener } = useUnityContext({
    loaderUrl: "Build/public.loader.js",
    dataUrl: "Build/public.data",
    frameworkUrl: "Build/public.framework.js",
    codeUrl: "Build/public.wasm",
  });  

  const TITLE_PAGE   = 0;
  const WAITING_PAGE = 1;
  const RESULT_PAGE  = 2;
  const [pageIndex, setPage] = useState(TITLE_PAGE);

  const [user, setUser] = useState("");
  const [firstUser, setFirstUser] = useState("");
  const [users, setUsers] = useState([]);
  const [result, setResult] = useState([]);
  const [positions, setPositions] = useState([]);
  const [playing, setPlaying] = useState(false);
  
  const handleName = (name) => {
    setUser(name);
  };

  const handleUserClick = () => {
    socket.emit("c2sRequestJoin", { "user": user });
    setPage(WAITING_PAGE);
  };
  
  const handleReadyClick = () => { 
    socket.emit("c2sOK", { "user": user });
  };

  const pageList = [
    <Title nameChangeHandler={handleName} joinClickHandler={handleUserClick} />,
    <Waiting userList={users} readyClickHandler={handleReadyClick} />,
    <Result result={result} />
  ];

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
    let updatedPositions = positions;
    updatedPositions.push(
      { 
        "user": username , 
        "positionX": positionX,
        "positionY": positionY,
        "positionZ": positionZ
      }
    );
    if (isLast === 1) {
      socket.emit("c2sInformPositions", { "user": user, "positions": positions.current });
      setPositions([]);
    }
    setPositions(updatedPositions);
  }, [user, positions]); 

  const setup = (jsonString) => {
    sendMessage("GameManager", "Setup", jsonString);
  }
  const enablePull = () => {
    sendMessage("GameManager", "EnablePull", user);
  }
  const reflectPullInfo = (jsonString) => {
    sendMessage("GameManager", "ReflectPullInfo", jsonString);
  }
  const synchronizePositions = (jsonString) => {
    sendMessage("GameManager", "SynchronizePositions", jsonString);
  }
  
  useEffect(() => {
    socket.on("connect", (data) => {});

    socket.on("s2cInformUsers", (data) => {
      setUsers(data["users"]);
    });

    socket.on("s2cStart", (json) => {
      setPlaying(true);
      setFirstUser(json["firstUser"]);
      setUsers(json["users"]);
    });

    socket.on("s2cInformResult", (data) => {
      setPage(RESULT_PAGE);
      setResult(["result"]);
    });

    socket.on("disconnect", (data) => {
      console.log(data);
    });
  });

  useEffect(() => {
    if (isLoaded) {
      setup("{ \"users\": " + JSON.stringify(users) + " }");
      if (firstUser === user) {
        enablePull(firstUser);
      }
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
    }
  }, [isLoaded]);

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
      { playing ? 
      <Unity 
        unityProvider={unityProvider} 
        style={ 
          {
            visibility: "visible",
            width: 800,
            height: 400,
            background: "grey"
          }
        }
      /> : pageList[pageIndex] }
    </div>
  );
}

export default App;