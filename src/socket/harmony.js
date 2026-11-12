// Socket.IO 궁합 방 관리
// 방 구조: { roomId, users: [{ socketId, nickname }], cards: { nickname: [cardNum, ...] } }

const rooms = new Map();

function setup(io) {
  io.on("connection", (socket) => {
    console.log(`소켓 연결: ${socket.id}`);

    socket.on("create", () => {
      const roomId = generateRoomId();
      rooms.set(roomId, { roomId, users: [], cards: {} });
      socket.emit("createComplete", { roomId });
      console.log(`방 생성: ${roomId}`);
    });

    socket.on("join", ({ nickname, roomId }) => {
      const room = rooms.get(roomId);
      if (!room) {
        socket.emit("error", { message: "존재하지 않는 방입니다." });
        return;
      }

      const alreadyJoined = room.users.some(u => u.nickname === nickname);
      if (!alreadyJoined) {
        room.users.push({ socketId: socket.id, nickname });
        room.cards[nickname] = [];
      }

      socket.join(roomId);
      const nicknames = room.users.map(u => u.nickname);
      io.to(roomId).emit("joinComplete", { nickname: nicknames });
      console.log(`입장: ${nickname} → 방 ${roomId}`);
    });

    socket.on("start", ({ nickname, roomId }) => {
      // 카드 선택 시작 신호 — 양쪽 모두에게 알림
      io.to(roomId).emit("next", {});
      console.log(`시작: 방 ${roomId}`);
    });

    socket.on("cardSelect", ({ nickname, roomId, cardNum }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      if (!room.cards[nickname]) room.cards[nickname] = [];
      room.cards[nickname].push(cardNum);

      // 상대방에게 카드 선택 알림
      socket.to(roomId).emit("next", { cardNum });
      console.log(`카드 선택: ${nickname} → ${cardNum} (방 ${roomId})`);
    });

    socket.on("resultReceived", ({ roomId, tarotId }) => {
      // 결과 수신 확인 (필요시 양쪽 확인 후 방 정리)
      console.log(`결과 수신 확인: 방 ${roomId}, tarotId ${tarotId}`);
    });

    socket.on("exit", ({ roomId }) => {
      socket.to(roomId).emit("exit");
      socket.leave(roomId);

      const room = rooms.get(roomId);
      if (room) {
        room.users = room.users.filter(u => u.socketId !== socket.id);
        if (room.users.length === 0) rooms.delete(roomId);
      }
      console.log(`퇴장: ${socket.id} ← 방 ${roomId}`);
    });

    socket.on("disconnect", () => {
      // 연결 끊긴 소켓이 속한 방 정리
      for (const [roomId, room] of rooms.entries()) {
        const wasInRoom = room.users.some(u => u.socketId === socket.id);
        if (wasInRoom) {
          room.users = room.users.filter(u => u.socketId !== socket.id);
          socket.to(roomId).emit("exit");
          if (room.users.length === 0) rooms.delete(roomId);
        }
      }
      console.log(`소켓 해제: ${socket.id}`);
    });
  });
}

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

module.exports = { setup };
