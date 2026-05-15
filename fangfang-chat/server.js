const express=require('express');
const http=require('http');
const { Server }=require('socket.io');

const app=express();
const server=http.createServer(app);
const io=new Server(server, {
  cors: { origin: "*" },
  transports: ["websocket", "polling"]
});

app.use(express.static('public'));

let chatHistory=[];
let userRemark={};
let autoReplyConfig = {
  replyCount: 5,
  minDelay: 3,
  maxDelay: 30
};

io.on('connection', (socket) => {
  console.log('用户已连接');
  socket.emit('history', chatHistory);
  socket.emit('autoConfig', autoReplyConfig);

  socket.on('msg', (data) => {
    chatHistory.push(data);
    io.emit('msg', data);
  });

  socket.on('voiceToText', (text) => {
    const data={ text, type: 'other', time: new Date().toLocaleString() };
    chatHistory.push(data);
    io.emit('msg', data);
  });

  socket.on('setRemark', (data) => {
    userRemark[data.uid]=data.remark;
    io.emit('remarkUpdate', userRemark);
  });

  socket.on('setAutoConfig', (config) => {
    autoReplyConfig = config;
    io.emit('autoConfig', autoReplyConfig);
  });
});

const PORT=process.env.PORT || 3000;
server.listen(PORT, () => console.log(`运行端口 ${PORT}`));