// Socket.IO 궁합 방 관리
const rooms = require("../store/rooms");

function setup(io) {
  io.on("connection", (socket) => {
    console.log(`소켓 연결: ${socket.id}`);

    socket.on("create", () => {
      const roomId = generateRoomId();
      rooms.set(roomId, { roomId, users: [], cards: {} });
      socket.emit("createComplete", { roomId });
      console.log(`방 생성: ${roomId}`);
    });

    // gender: 0 = 여성, 1 = 남성 (앱의 WOMAN/MAN 상수와 동일)
    socket.on("join", ({ nickname, roomId, gender }) => {
      const room = rooms.get(roomId);
      if (!room) {
        socket.emit("error", { message: "존재하지 않는 방입니다." });
        return;
      }

      const alreadyJoined = room.users.some(u => u.socketId === socket.id);
      if (!alreadyJoined) {
        room.users.push({
          socketId: socket.id,
          nickname,
          gender: gender === 0 || gender === 1 ? gender : null,
        });
        room.cards[nickname] = [];
      }

      socket.join(roomId);
      console.log(`입장: ${nickname} → 방 ${roomId}`);

      // 앱은 첫 joinComplete에서 상대 닉네임을 읽으므로 두 명이 모였을 때만 보낸다
      if (room.users.length === 2) {
        io.to(roomId).emit("joinComplete", { nickname: room.users.map(u => u.nickname) });
      }
    });

    socket.on("start", ({ roomId }) => {
      // 앱은 next를 "상대방이 진행했다"로 해석하므로 보낸 사람에게는 돌려주지 않는다
      socket.to(roomId).emit("next", {});
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
