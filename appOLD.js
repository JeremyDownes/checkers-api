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
let field = generateField(8,8)
let count = 0
let clients = {}
const checkers =  require('./utils/checkers.js')
checkers.forEach(location=> {
	field[location[0]][location[1]].content = {king: false, direction: location[0]<2? 1 : -1}
})

console.log(field[0][0])

io.on("connection", socket => {
  console.log("New client connected "+socket.id)
  count++
  socket.on('registerClient', data => {

  	if (clients.values && clients.values.includes(data)) {
  		console.log('Reconnection')
  		count--
  		socket.emit('clientRegistration',socket.id)
  		let client = clients.find(client=>client.value = data)
  		clients[client.id]=socket.id
  	} else {
  		clients[count]=socket.id
  		socket.emit('clientRegistration',socket.id)
  	}
  })

  socket.emit('FromAPI',field)

	socket.on('Clear',(data)=> {
		field = generateField(8,8)
		io.emit('FromAPI',field)
	} )  

  socket.on('FromClient',(data)=>{
  	data = data.location.split(',')
  	if ( field[data[1]][data[0]].status === 'active' ) {
  		field[data[1]][data[0]].status = null
  	} else {
  		field[data[1]][data[0]].status = 'active'
  	}
  	io.emit('FromAPI',field)
 
  })


  socket.on("disconnect", () => { 
  	console.log("Client disconnected")
  })
})

server.listen(port, () => console.log(`Listening on port ${port}`))