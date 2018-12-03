const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const port = process.env.PORT || 4001;
const index = require("./routes/route");
const app = express();
const cors = require('cors');
app.use(cors());
app.use(index);
const server = http.createServer(app);
const io = socketIo(server); // < Interesting!
io.origins('*:*')
const generateField =  require('./utils/generateField.js')
let count = 0
let firstSocket = ''
let rooms = {}
let pair = ''
const checkers =  require('./utils/checkers.js')

const buildGame = (field) => {
  checkers.forEach(location=> {
	 field[location[0]][location[1]].content = {king: false, direction: location[0]<3? 1 : -1}
  })
}
setInterval(()=>{rooms={}},86400000)


io.on("connection", socket => {
  let field = generateField(8,8)
  let game = buildGame(field)
  socket.emit('FromAPI',field)
  socket.on('registerClient', data => {
      count++

    if(count===1) {
      pair=''
      pair+=socket.id
      firstSocket = socket
      socket.emit('Message', 'Waiting for Player...')
    }
  	if(count===2) {
      pair+=','+socket.id
      socket.join(pair)
      rooms[pair]={field: field, room: pair.split(',')}       
      firstSocket.join(pair)
      io.to(pair).emit('clientRegistration',pair)  
      io.to(pair).emit('FromAPI',rooms[pair].field)  
      io.to(pair).emit('Message', 'Player Connected')
      count=0
    }
  })

	socket.on('Clear',(data)=> {
    if(rooms[data.key]) {
      let field = generateField(8,8)
      buildGame(field)
  		rooms[data.key].field = field
	   	io.to(data.key).emit('FromAPI',rooms[data.key].field)
     }
	}) 

  socket.on('KingMe',(data)=> {
    if(rooms[data.key]) {
      rooms[data.key].field[data.location[1]][data.location[0]].content.king = true
      io.to(data.key).emit('FromAPI',rooms[data.key].field)
    }
  })  

  socket.on('singleSpace',data=>{
    if(rooms[data.key]) {
      let from = data.from
      let to = data.to
      let obj = rooms[data.key].field[from[1]][from[0]].content
      rooms[data.key].field[to[1]][to[0]].content = obj
      delete rooms[data.key].field[from[1]][from[0]].content
      io.to(data.key).emit('FromAPI',rooms[data.key].field)
    }
  })  

  socket.on('jump',data=>{
    if(rooms[data.key]) {
      let from = data.from
      let to = data.to
      let obj = rooms[data.key].field[from[1]][from[0]].content
      data.remove.forEach(location=> {
        delete rooms[data.key].field[location[0]][location[1]].content
        io.to(data.key).emit('FromAPI',rooms[data.key].field)
      })
      rooms[data.key].field[to[1]][to[0]].content = obj
      delete rooms[data.key].field[from[1]][from[0]].content
      io.to(data.key).emit('FromAPI',rooms[data.key].field)
    }
  })

  socket.on('disconnect', data=> {
    if(Object.keys(rooms)) {
      Object.keys(rooms).forEach(room=>{
        rooms[room].room[0]===socket.id? io.to(rooms[room].room[1]).emit('Message','Player Disconnected') :  rooms[room].room[1]===socket.id? io.to(rooms[room].room[0]).emit('Message','Player Disconnected') :  null
        delete rooms[room]
      })
    }
  })

})

server.listen(port, () => {return})