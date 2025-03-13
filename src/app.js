const WebSocket = require("ws");
const express = require("express");
const app = express()
const path = require("path")
const fetch = require('node-fetch');

// app.use("/",express.static(path.resolve(__dirname, "../client")))
// app.use("/",express.static(path.resolve(__dirname, "../client")))

// const myServer = app.listen(3000)       // regular http server using node express which serves your webpage

// const wsServer = new WebSocket.Server({
//     noServer: true
// })                                      // a websocket server

// wsServer.on("connection", function(ws) {    // what should a websocket do on connection
//     ws.on("message", function(msg) {        // what to do on message event
//         wsServer.clients.forEach(function each(client) {
//             if (client.readyState === WebSocket.OPEN) {     // check if client is ready
//               client.send(msg.toString());
//             }
//         })
//     })
// })

// myServer.on('upgrade', async function upgrade(request, socket, head) {      //handling upgrade(http to websocekt) event

//     // accepts half requests and rejects half. Reload browser page in case of rejection
    
//     if(Math.random() > 0.5){
//         return socket.end("HTTP/1.1 401 Unauthorized\r\n", "ascii")     //proper connection close in case of rejection
//     }
    
//     //emit connection when request accepted
//     wsServer.handleUpgrade(request, socket, head, function done(ws) {
//       wsServer.emit('connection', ws, request);
//     });
// });

const userState = {
    users: [],
    setUsers: function(newUserArray){
        this.users = newUserArray
    }
}
const roomList = {
    rooms: [{
        roomId: String,
        users: [{
            userName: String,
            userWebSocketId: String
        }]
    }],
    setRoom: function(listOfRooms, userName, ws){
        const self = this;
        listOfRooms.map(function(userRoom){
            var roomExists = false;
            if(self.rooms!=undefined){
                roomList.rooms.map(function(room){
                    if(room.roomId==userRoom){
                        var userExistance = false;
                        room.users.map(function(user){
                            if(user.userName==userName){
                                userExistance = true;
                                user.userWebSocketId = ws;
                            }
                        })
                        if(!userExistance){
                            room.users.push({"userName": userName, "userWebSocketId": ws});
                        }
                        roomExists = true;
                        return;
                    }
                })
                // for (room in this.rooms){
                    
                // }
            }
            
            if(!roomExists){
                const room = {"roomId" : userRoom, users: [{"userName": userName, "userWebSocketId": ws}]}
                if(self.rooms==undefined){
                    self.rooms = [room];
                }else{
                    self.rooms.push(room);
                }
                
            }
        })
    }
}



const wss = new WebSocket.Server({ port: 3000 });

wss.on('connection', (ws, req) => {
    // ws.on("open", function(data){
    //     const userData = JSON.parse(data)
    //     const user = {  }
    // })
    // Code to handle new WebSocket connections
    ws.on("message", function(msg) {       // what to do on message event
        const message = JSON.parse(msg);
        activateUser(message, ws)
        if(message.message!==""){
            chatRoom(message, ws)
        }
        // wss.clients.forEach(function each(client) {
        //     if (client.readyState === WebSocket.OPEN) { 
        //       const message = JSON.parse(msg); 
        //       client.send(message.name);
        //     }
        // })
    })
    ws.on("close", function(){
        deactivateUser(ws);
    })
  });

  function chatRoom(message, ws){
    roomList.rooms.map(function(room){
        if(room.roomId==message.user.roomId){
            room.users.forEach(user=>{
                if(user.userWebSocketId.readyState === WebSocket.OPEN){
                    updateOfflineUsersData(message, user, "unread=1");
                    user.userWebSocketId.send(JSON.stringify(message));
                }else{
                    updateOfflineUsersData(message, user, "unrecieved=1&unread=1");
                }
            })
        }
    })
    // roomList.rooms.forEach(room => {
        
    // });
    // userState.users.forEach(user=> {
    //     if(user.roomId==message.user.roomId && user.id.readyState===WebSocket.OPEN){
    //         user.id.send(message.name);
    //     }
    // });
  }

  function activateUser(message, ws){
    const id = ws; 
    const userName = message.user.name;
    const roomId = message.user.roomId;
    const us = { id, userName, roomId };
    userState.setUsers([
        ...userState.users.filter(user => user.id !== id),
        us
    ]);
    roomList.setRoom(message.user.roomIds, userName, ws)
    return us;
  }

  async function updateOfflineUsersData(message, user, params){
    // const AbortController = globalThis.AbortController || await import('abort-controller')
    // const controller = new AbortController();
    // const timeout = setTimeout(() => {
	//     controller.abort();
    // }, 15000);
    const absUrl = `/user/${user.userName}/${message.user.roomId}/updateReadUnreadMessages?${params}`
    const response = await fetch("https://chat-app-backend-db.vercel.app" + absUrl, { method: 'POST' });
    // const data = response.json();
    console.log(response);
  }

  function deactivateUser(ws){
    userState.setUsers(
        userState.users.filter(
            user => user.id !== ws
        )
    );
  }