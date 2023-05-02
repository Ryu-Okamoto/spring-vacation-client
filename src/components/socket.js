import io from "socket.io-client";

export const socket = io("112.71.101.132:5001/", {
    transports: ["websocket"],
    cors: {
      origin: "http://localhost:3000/",
    },
  });