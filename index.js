const express = require('express');
const app     = express();
const path    = require('path');
const cors    = require('cors');
const server  = require('http').createServer(app);


// Serve only the static files form the dist directory
app.use(express.static('./dist/full-chat'));



app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/',require(path.join(__dirname,'./Routes/Routes.js')));

const io      = require('socket.io')(server,{
    cors: {
        origin : 'http://localhost:4200'
    }
})
socketUsers   = [];
registeredEmails = [];


io.on('connection',socket=>{
    //user logged in
    socket.on("loggedIn",(credentials)=>{
        registeredEmails = []
        socketUsers = socketUsers.filter(user=>{
            if(user.email != credentials.email)
            {
                registeredEmails.push(user.email);
                return user;
            }
        })
        registeredEmails.push(credentials.email);
        socketUsers.push({socketID: socket.id, email : credentials.email});
        io.emit("registeredEmails",registeredEmails);
    })

    socket.on("sendMessage",(senderEmail,recieverEmail,msg)=>{
        user = socketUsers.filter(user=>{
            if(user.email == recieverEmail)
            {
                return user;
            }else{
                return ;
            }
        })
        io.to(user[0].socketID).emit("recieveMessage",senderEmail,recieverEmail,msg);
    })

    socket.on("offerVideoCall",(senderEmail,recieverEmail,info)=>{
        user = socketUsers.filter(user=>{
            if(user.email == recieverEmail)
            {
                return user;
            }
        })
        io.to(user[0].socketID).emit("recieveVideoCall",senderEmail,info);
    })

    socket.on("sendCandidate",(senderEmail,recieverEmail,candidate)=>{
        console.log(`${senderEmail} is sending candidate to ${recieverEmail}, candidate information are: ${candidate}`);
        user = socketUsers.filter(user=>{
            if(user.email == recieverEmail)
            return user;
        })
        if(user.length>0)
        {
            io.to(user[0].socketID).emit("recieveCandidate",senderEmail,candidate);
        }
        else{
            sender = socketUsers.filter(user=>{
                if(user.email == senderEmail)
                return user;
            })
            io.to(sender[0].socketID).emit('notAvailableUser');
        }
    })


    socket.on("sendAnswer",(answerEmail,callerEmail,data)=>{
        user = socketUsers.filter(user=>{
            if(user.email == callerEmail)
            return user;
        })
        io.to(user[0].socketID).emit('recieveAnswer',answerEmail,data);
    })













    //socket ends here
})

server.listen('3000',()=>{
    console.log("Server is listening at port 3000")
})

