const express = require('express')
const http = require('http')
const path  = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const app = express()
const server = http.createServer(app)
const io  = socketio(server)

const {generateMessage} = require("./utils/message")
const {addUser,getAllUser,getUser,removeUser} = require('../src/utils/users')

io.on('connection',(socket)=>{
    console.log('A new connection ')
    
    socket.on('join', (options, callback)=>{
        const {error, user } = addUser({id:socket.id, ...options })

        if(error){
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('message',generateMessage('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined!`))
        
        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getAllUser(user.room)
        })

        callback()
    })
    socket.on('sendMessage',(message,callback)=>{
        const user = getUser(socket.id)
        
        const filter = new Filter()
        
        if(filter.isProfane(message))
         return callback('Profanity not allowed')
        io.to(user.room).emit('message',generateMessage(user.username,message))
        callback()
    })

    socket.on('send-location',(data,callback)=>{
        
        const user = getUser(socket.id)

        io.emit('locationMessage',generateMessage(user.username,`https://google.com/maps?q=${data.latitude},${data.longitude}`))
        callback()
    })

    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)

        if(user)
            io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left the group.`))
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getAllUser(user.room)
            })
    })

})
const PORT = process.env.PORT || 3000

app.use(express.static(path.join(__dirname,'../public')))

server.listen(PORT,()=>{
    console.log(`Server is up and running at ${PORT}`)
})