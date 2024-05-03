const path=require("path");
const express=require("express");
const userRoute=require("./Blogify/routes/user");
const blogRoute=require("./Blogify/routes/blog");
const mongoose=require("mongoose");
const Blog=require("./models/blog");
const cookieParser=require("cookie-parser");
const { checkForAuthenticationCookie } = require("./middlewares/authentication");

const app=express();
const PORT=process.env.PORT || 8000;

require('dotenv').config()

//mogodb connect
mongoose.connect(process.env.MONGO_URL)
.then((e)=>console.log("Monogdb connected"))



//setting the view port 
app.set('view engine','ejs');
app.set("views",path.resolve("./views"));

//middleware
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token")); //this middleware will add req.isAuth
app.use(express.static(path.resolve("./public")));
//Routers
app.get("/",async(req,res)=>{
    const allBlogs=await Blog.find({});
    res.render("home",{
        user:req.user,
        blogs:allBlogs,
    });
});

app.use("/user",userRoute);
app.use("/blog",blogRoute);


app.listen(PORT,()=>console.log("Listening on port "+ PORT));
