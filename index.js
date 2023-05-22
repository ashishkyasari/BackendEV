const express = require('express');
require('./connection/dbconnection');
const reg = require('./Schema/register');
const cors = require('cors');


const app = express();
app.use(express.json())
app.use(express.urlencoded())
app.use(cors());


const port = 5001

app.post("/register",async(req,res)=>{
    try{
        console.log(req.body);
        const {name, phoneno, email, password} = req.body
        const user = new reg({
            name,
            phoneno,
            email,
            password,
        })
        const registered = await user.save();
        console.log(registered);
        res.send("Registered Succefully");
    }catch(e){
        console.log(e);
        res.send({message: e});
    }
})

app.listen(port,(req,res)=>{
    console.log(`Server Runnning on port ${port}`);
})