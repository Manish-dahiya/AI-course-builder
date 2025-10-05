const { Server } =require("socket.io");

let io;

 const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // restrict later to frontend URL
      methods: ["GET", "POST"]
    }
  });

  console.log("✅ Socket.io initialized");

  // ⚡ Now attach connection handler *after* initialization
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("register", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their personal room`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};

 const getIo = () => {
  if (!io) {
    throw new Error("Socket.io not initialized yet!");
  }
  return io;
};

module.exports= {initSocket,getIo}