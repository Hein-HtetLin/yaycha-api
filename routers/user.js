const express = require("express");
const router = express.Router();
const prisma = require("../prismaClient");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const {auth} = require("../middlewares/auth")
router.get("/users",async(req,res)=>{
    try{
        const data = await prisma.user.findMany({
            include:{posts:true,comments:true,followers:true,following:true},
            orderBy:{id:"desc"},
            take:20
        });
        res.json(data);
    }catch(e){
        res.status(500).json({error:e})
    }
})

router.get("/users/:id",async(req,res)=>{
    const {id} = req.params
    try{
        const data = await prisma.user.findFirst({
            where:{ id: Number(id)},
            include:{posts:true,comments:true,followers:true,following:true},
        });
        res.json(data)
        console.log(data,"userId")
    }catch(e){
        res.status(500).json({error:e})
    }
})

router.post("/users", async(req,res)=>{
    const {name,username,bio,password} = req.body;
    if(!name || !username || !password){
        return res.status(400).json({
            msg:"name,username and password required"
        })
    }
    const hash = await bcrypt.hash(password,10);
    const user = await prisma.user.create({
        data:{
            name,username,password:hash,bio
        },
    });
    res.json(user);
})

router.post("/login",async(req,res)=>{
    const {username, password} = req.body;
    console.log(username,password)
    if(!username || !password){
        return res.status(400).json({msg:"username and password required"});
    }

    const user = await prisma.user.findUnique({
        where:{username}
    }) ;

    if(user){
        if(bcrypt.compare(password,user.password)){
            const token = jwt.sign(user,process.env.JWT_SECRECT);
            return res.json({token,user});
        }
    }

    res.status(401).json({msg:"incorrect username or password"})
})

router.get("/verify",auth,async(req,res)=>{
    const user = res.locals.user;
    res.json(user)
})

router.post("/follow/:id", auth,async(req,res)=>{
    const user = res.locals.user
    const {id} = req.params;
    const data = await prisma.follow.create({
        data:{
            followerId:Number(user.id),
            followingId:Number(id),
        }
    });
    res.json(data)
})

router.delete("/unFollow/:id",auth,async(req,res)=>{
    const user = res.locals.user;
    const {id} = req.params;

    await prisma.follow.deleteMany({
        where:{
            followerId:Number(user.id),
            followingId:Number(id)
        }
    });
    res.json({msg:`UnFollow user ${id}`})
})

router.get("/search",async(req,res)=>{
    const {q} = req.query;
    const data = await prisma.user.findMany({
        where:{
            name:{
                contains:q
            }
        },
        include:{
            followers:true,
            following:true
        },
        take:20
    });
    res.json(data)
})

module.exports = {userRouter:router};