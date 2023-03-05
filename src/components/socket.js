import io from "socket.io-client";

export const socket = io("localhost:5001/", {
    transports: ["websocket"],
    cors: {
      origin: "http://localhost:3000/",
    },
  });