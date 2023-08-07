// const http = require('http');
// const fs =require('fs')
// const path = require('path')
// const Answer = require('./feature')
// console.log(Answer());

// const home = fs.readFileSync('./index.html')
// console.log(path.dirname('/home/random/index.js'));
// const server = http.createServer((req,res)=>{
//     console.log(req.method);
//     if(req.url=='/about'){
//         res.end('<h1>This is about URL</h1>')
//     }
//     else if(req.url=='/contact'){
//         res.end('<h1>This is contact URL</h1>')
//     }
//     else if(req.url=='/'){
//         res.end(home)
//     }
//     else{
//         res.end('<h1>This is 404 page</h1>')
//     }
// })

// server.listen('5000',()=>{
//     console.log('server is listening');
// })

const express=require('express')
const path = require('path')
const ejs=require('ejs')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const app = express()   

// setting ejs template
app.set('view engine', 'ejs');

//mongodb connection
mongoose.connect("mongodb://localhost:27017",{
    dbName:'Backend'
})
.then(()=>{console.log("Database connecteded");})
.catch((e)=>{console.log(e);})
//Middlewares
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

//Schema
const MessageSchema=new mongoose.Schema({
    name:String,
    email:String,
    password:String
})

//Model
const Messages = mongoose.model('Messagessss',MessageSchema)

// setting for public folder which includes our css nad js
app.use(express.static(path.join(path.resolve(),'public')))

//const users = []

const isAuth=async (req,res,next)=>{
    const token = req.cookies.token
    if(token){
        const decode=jwt.verify(token,'saddasfasdfadfa')
        console.log('This is decode =>'+decode);
        req.user=await Messages.findById(decode._id)
        next()
    }
    else{
        res.render('login')
    }

}

app.post('/login', async(req,res)=>{
    const {email,password} = req.body
    if(!email || !password ){
        return res.render('login',{message:'kuch to daal dey bhai...'})
    }
    const chk2=await Messages.findOne({email})
    console.log('This is chk2=>'+chk2);
    if(!chk2){
        return res.redirect('/register')
    }
    const isMatch = await bcrypt.compare(password,chk2.password)
    console.log(isMatch);
    if(!isMatch){
        return res.render('login',{message:'Sahi pwd daal bhai'})
    }
    // const loginDetails={email,password}
    // const msg =  await Messages.create(loginDetails)
    const token = jwt.sign({_id:chk2._id},'saddasfasdfadfa')
    res.cookie('token',token,{
        httpOnly:true,
        expires:new Date(Date.now()+60*1000)
    })
    res.redirect('/')
})

app.get('/',isAuth,(req,res)=>{
    //res.cookie('token','I am login')
    console.log('This is req.user=>'+req.user);
    res.render('logout',{name:req.user.name})
})
app.get('/logout',(req,res)=>{
    res.cookie('token',null,{
        httpOnly:true,
        expires:new Date(Date.now())
    })
    res.redirect('/')
})

app.get('/login',(req,res)=>{
res.render('login')
})

app.post('/register',async(req,res)=>{
    const {name,email,password}=req.body
    const hashPwd= await bcrypt.hash(password,10)
    const regDet={name,email,password:hashPwd}
    let chk = await Messages.findOne({email})
    if(chk){
        return res.redirect('/login')
    }
    const registration = await Messages.create(regDet)
    console.log('data added');
    res.redirect('/')
})

app.get('/register',(req,res)=>{
    res.render('register')
})


app.listen(5000,()=>{
    console.log("sERVER IS RUNNING");
})