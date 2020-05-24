var express = require("express");
var router = express.Router({mergeParams:true});
var Campground = require("../models/campground");
var middleware = require("../middleware")
var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

//INDEX - show all campgrounds
router.get("/", function(req, res){
    // Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
       if(err){
           console.log(err);
       } else {
          res.render("campgrounds/index",{campgrounds:allCampgrounds, currentUser:req.user});
       }
    });
});

//CREATE - add new campground to DB
router.post("/", middleware.isLogin, function(req, res){
  // get data from form and add to campgrounds array
  var name = req.body.name;
  var image = req.body.img;
  var desc = req.body.description;
  var price = req.body.price;
  var author = {
      id: req.user._id,
      username: req.user.username
  }
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    var newCampground = {name: name, img: image, description: desc, author:author, location: location, lat: lat, lng: lng, 			price:price};
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            console.log(newlyCreated);
            res.redirect("/campgrounds");
        }
    });
  });
});

//NEW - show form to create new campground
router.get("/new",middleware.isLogin, function(req, res){
   res.render("campgrounds/new"); 
});

// SHOW - shows more info about one campground
router.get("/:id", function(req, res){
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log(err);
        } else {
            console.log(foundCampground)
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

//EDIT Campground routes
router.get("/:id/edit",middleware.checkOwnerShip, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
		if(err){
			req.flash("error", "Campground is not found sorry");
		}else{
        res.render("campgrounds/edit", {campground: foundCampground});	
		}

    });
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkOwnerShip, function(req, res){
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    req.body.campground.lat = data[0].latitude;
    req.body.campground.lng = data[0].longitude;
    req.body.campground.location = data[0].formattedAddress;

    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
  });
});


//Destroy Campground routes

router.delete("/:id", middleware.checkOwnerShip, function(req, res){
   Campground.findByIdAndRemove(req.params.id, function(err){
      if(err){
          res.redirect("/campgrounds");
      } else {
		  req.flash('success', "comment removed");
          res.redirect("/campgrounds");
      }
   });
});


module.exports = router;
