require('dotenv').config();
var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    Campground  = require("./models/campground"),
    Comment     = require("./models/comment"),
    seedDB      = require("./seeds"),
	passport = require("passport"),
	passportLocalMongoose = require("passport-local-mongoose"),
	LocalStrategy = require("passport-local"),
	methodOverride = require("method-override"),
	flash = require("connect-flash"),
	User = require("./models/User");

//require routes
var commentRoutes = require("./routes/comments"),
	campgroundRoutes = require("./routes/campground"),
	indexRoutes = require("./routes/index");
 
mongoose.connect(process.env.DATABASEURL, {
	useNewUrlParser:true,
	useCreateIndex:true
});


// mongoose.connect("mongodb+srv://jyfeng:fjy990706@cluster0-60wfo.mongodb.net/yelp_camp?retryWrites=true&w=majority", {
// 	useNewUrlParser:true,
// 	useCreateIndex:true
// });
app.use(flash());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname+"/public"));
app.use(methodOverride("_method"));
//seed databse
//seedDB();

app.locals.moment = require('moment');
//passport configure
app.use(require("express-session")({
	secret:"kris is the best",
	resave:false,
	saveUnitialize:false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next){
	res.locals.currentUser= req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(indexRoutes);
app.use("/campgrounds/:id/comments",commentRoutes);
app.use("/campgrounds", campgroundRoutes);




// app.listen(3000, function(){
//    console.log("The YelpCamp Server Has Started!");
// });

app.listen(process.env.PORT || 5000)