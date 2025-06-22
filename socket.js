const { Server } = require("socket.io");

let io;

function setupSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // Join room
    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room: ${roomId}`);
    });

    // Handle message sending
    socket.on("sendMessage", ({ roomId, message }) => {
      // Attach sender socket ID
      const msgWithId = { ...message, senderSocketId: socket.id };
      socket.to(roomId).emit("receiveMessage", msgWithId); // 🔥 emit to others only
    });


    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
}

module.exports = { setupSocket };
