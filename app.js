if(process.env.NODE_ENV!="production"){
     require("dotenv").config();
 }
const express=require("express");
const app=express();
const mongoose=require("mongoose");
const dbUrl=process.env.ATLASDB_URL;
const path=require("path");
const methodoverride=require("method-override");
const ejsMate=require("ejs-mate");
const ExpressError=require("./utils/ExpressError.js");
const listingsRouter=require("./routes/listings.js");
const reviewsRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");
// const session=require("express-session");
const MongoStore = require("connect-mongo").default;
const flash=require("connect-flash");
const passport=require("passport");
const { savedRedirectUrl } = require("./middleware.js");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");
main()
    .then(()=>{
console.log("connected to db");
    })
    .catch((err)=>{
        console.log(err);
    });

async function main(){
    await mongoose.connect(dbUrl);
}
app.engine('ejs', ejsMate);
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodoverride("_method"));
app.use(express.static(path.join(__dirname,"/public")));


const session = require("express-session");
console.log(process.env.ATLASDB_URL);
// const MongoStore = require("connect-mongo");
const secret = process.env.SECRET || "mysupersecretcode";


const store = MongoStore.create({
    mongoUrl: process.env.ATLASDB_URL,
    // crypto: {
    //     secret: process.env.SECRET,
    // },
    // touchAfter: 24 * 3600,
});

// store.on("error", (err) => {
//     console.log("ERROR in MONGO SESSION STORE", err);
// });


const sessionOptions={
    store:store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:false,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    }
};

store.on("error", (err) => {
    console.log("ERROR in MONGO SESSION STORE", err);
});
app.use(session(sessionOptions));
// app.get("/",(req, res)=>{
//     res.send("hi i m root");
// });



app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
});

//
app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    res.locals.mapToken=process.env.MAP_TOKEN; // add this
    next();
});
//
app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter);
//if user enter route other than our routes
app.all("/*splat",async(req,res,next)=>{
    next(new ExpressError(404,"Page not found!"));
});
app.use((err,req,res,next)=>{
    let{statusCode=500,message="Something went wrong"}=err;
    console.log(err);
    //res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs",{message});
});

app.listen(8080,()=>{
    console.log("app is listening");

});