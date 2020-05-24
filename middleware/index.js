var Campground = require("../models/campground");
var Comment = require("../models/comment");

// all the middleare goes here
var middlewareObj = {};

middlewareObj.checkOwnerShip = function(req, res, next) {
 if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, foundCampground){
           if(err){
			   req.flash("error", "Campground is not found sorry");
               res.redirect("back");
           }  else {
               // does user own the campground?
            if(foundCampground.author.id.equals(req.user._id)) {
                next();
            } else {
				req.flash("error", "You don't have permission to do this");
                res.redirect("back");
            }
           }
        });
    } else {
		req.flash("error", "Please login in first");
        res.redirect("back");
    }
}

middlewareObj.checkCommentOwnerShip = function(req, res, next) {
 if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
           if(err){
               res.redirect("back");
           }  else {
               // does user own the comment?
            if(foundComment.author.id.equals(req.user._id)) {
                next();
            } else {
				req.flash("error", "You don't have permission to do this");
                res.redirect("back");
            }
           }
        });
    } else {
		req.flash("error", "Please login in first")
        res.redirect("back");
    }
}

middlewareObj.isLogin = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
	req.flash("error", "Please login in first!");
    res.redirect("/login");
}

module.exports = middlewareObj;