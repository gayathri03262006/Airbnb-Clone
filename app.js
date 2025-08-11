if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

const express = require("express");
const MongoStore = require('connect-mongo');
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const ExpressError = require("./utils/ExpressError");

const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

const DB_URL = process.env.ATLASDB_URL

main().then(() => {
    console.log("Connected to DB");
}).catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(DB_URL);    
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const User = require("./models/user.js");
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const { listingSchema, reviewSchema } = require("./schema.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const store = MongoStore.create({
    mongoUrl: DB_URL,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, //One week in milliseconds
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
}; 

store.on("error", () => {
    console.log("Error in Mongo Session", error);
})

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); // use static authenticate method of model in LocalStrategy

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

// app.get("/demouser", (async(req, res) => {
//     let fakeUser = new User({
//         email: "abc@gmail.com",
//         username: "abc",
//     });

//     let registeredUser = await User.register(fakeUser, "helloworld"); //Convenience method to register a new user instance with a given password. Checks if username is unique
//     res.send(registeredUser);
// }))

// Routes
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter)

// Page not Found Error
app.use((req, res, next) => {
    next(new ExpressError(404, "Page not Found"));
});

// Global error handler
app.use((err, req, res, next) => {
    let {statusCode = 500, message = "Error Occured"} = err;
    res.status(statusCode).render("error.ejs", {message})
});


app.listen(process.env.PORT, () => {
    console.log("Listening");
});

// Testing Route
// app.get("/testListing", async(req, res) => {
//     let samListing = new Listing({
//         title: "New ",
//         description: "By the beach",
//         price: 1200,
//         location: "India",
//         country: "India",
//     });
//     await samListing.save();
//     res.send("Successful testing");
// });
