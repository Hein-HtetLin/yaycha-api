const express = require("express")
const app = express();
require("express-ws")(app)
const cors = require("cors");
const prisma = require("./prismaClient");
const { contentRouter } = require("./routers/content");
const {userRouter} = require("./routers/user")
const {wsRouter} = require("./routers/ws")
require("dotenv").config()
// console.log(process.env.JWT_SECRECT)

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(cors());

app.use("/",wsRouter)
app.get("/info", (req,res)=>{
    res.json({msg:"Yaycha API"});
});

app.use("/",userRouter);
app.use("/content",contentRouter);



app.listen(8000,()=>{
    console.log("Yaycha API started at 8000...")
});

// console.log(prisma)

const gracefulShutdown = async () =>{
    await prisma.$disconnect();
    server.close(()=>{
        console.log("Yaycha API closed");
        process.exit(0);
    });
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);