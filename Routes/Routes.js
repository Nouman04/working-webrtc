const express = require('express');
const route   = express.Router();

let users = [
    {id: 1, email: "mnoumanb@gmail.com" , password: "nouman1234"},
    {id: 2, email: "anees@gmail.com" , password: "anees1234"},
    {id: 3, email: "shahbaz@gmail.com" , password: "shahbaz1234"},
    {id: 4, email: "junaid@gmail.com" , password: "junaid1234"},
    {id: 5, email: "usman@gmail.com" , password: "usman1234"},
    {id: 6, email: "shujat@gmail.com" , password: "shujat1234"},
    {id: 7, email: "ali@gmail.com" , password: "ali1234"},
]

route.post('/login',(req,res)=>{
    let email = req.body.email;
    let password = req.body.password;
    haveUser = users.filter(user=>{
        if(email == user.email && password ==user.password)
        {
            return user;
        }
    })
    if(haveUser.length > 0)
    {
        res.json("user found");
    }else{
        res.json("no user found");
    }
})
module.exports = route;