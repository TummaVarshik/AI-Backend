const userModal = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")


async function registerUserController(req, res){
    const {username , email , password} = req.body
    if(!username || !email || !password){
        return res.status(400).json({
            message : "please provide username, email and password"
        })
    }

    const isUserAlreadyExists = await userModal.findOne({
        $or:[{username},{email}]
    })

    if(isUserAlreadyExists){
        return res.status(400).json({
            message:"account already esits with this username or email"
        })
    }
const hash = await bcrypt.hash(password , 10)
const user = await userModal.create({
username,
email,
password: hash
})

const token = jwt.sign(
    {id:user._id , username: user.username},
    process.env.JWT_SECRET,
    {expiresIn: "1d"}
)
res.cookie("token", token)

res.status(201).json({
    message: "user created",
    user:{
        id:user._id,
        username: user.username,
        email:user.email
    }
})
}

async function loginUserController(req, res){
    const {email , password} = req.body
    if( !email || !password){
        return res.status(400).json({
            message : "please provide username, email and password"
        })
    }

    const user = await userModal.findOne({
        email
    })
    if(!user){
       return res.status(400).json({
        message:"Invalid"
       })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if(!isPasswordValid){
       res.status(400).json({
        message:"check password"
       })
    }
   
    const token = jwt.sign(
    {id:user._id , username: user.username},
    process.env.JWT_SECRET,
    {expiresIn: "1d"}
)
res.cookie("token", token)

res.status(201).json({
    message: "user logged in",
    user:{
        id:user._id,
        username: user.username,
        email:user.email
    }
})

} 

module.exports= {registerUserController,loginUserController}