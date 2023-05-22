const mongoose = require('mongoose');
const dbUrl = "mongodb+srv://AshishK:AshishK2002@cluster0.ihbzate.mongodb.net/EVproj?retryWrites=true&w=majority"

mongoose.connect(dbUrl,{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=>{
    console.log("Connected to database");
}).catch((e) =>{
    console.log("Not connected to database, Error "+e);
})