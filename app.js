const { httpServer } = require("./socket")

const PORT = process.env.PORT || 3005;
httpServer.listen(PORT,()=>{
    console.log(`Socket is running on port : ${PORT}`);
    console.log(`Access origin : [${process.env.CLIENT_URL}, ${process.env.CLIENT_URL_1}, ${process.env.CLIENT_URL_2}]`)
});