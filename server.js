//Dependencies
require('dotenv').config();
var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var request = require("request");
var cheerio = require("cheerio");
var path = require('path')
var exphbs = require("express-handlebars");
var axios = require("axios");

//Require all models
var db = require('./models');

var PORT = process.env.PORT || 3000;
// var PORT = 3000;
// Initialize Express
var app = express();

// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Set view engine to handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set('view engine', 'handlebars');

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI 
//"mongodb://localhost/mongohw";
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);
//Routes here

app.get("/", function(req, res) {
    db.Article.find({}, function(error,data) {
        var hbsObject = {
            article: data
        }
        res.render("index", hbsObject)
    })
    // console.log('hi')
})
//Scrape articles
app.get("/scrape", function(req, res) {
    axios.get("https://www.nytimes.com/").then(function(response){
        var $ = cheerio.load(response.data);

        //Grab specific elements
        $("article").each(function(i, element) {
            var result = {};
            //Add text & href of every link
            result.title = $(this).children("h2").children("a").text();
            result.link = $(this).children("h2").children("a").attr("href");
            result.summary = $(this).children("p.summary").text();
            
            //Create an entry on my database

            db.Article.create(result).then(function(dbArticle) {
                console.log(dbArticle)
            }).catch(function(err) {
                return res.json(err);
            })
        });
        //Confirm it has completed
        console.log("Scrape Complete");
    });
});

//Get all Saved Articles from the db
app.get("/saved", function (req, res){
    // console.log(req)
    db.Article.find({saved:true}, function(error, data){
        var hbsObject = {
            article: data
        }
        console.log(hbsObject)
        res.render("saved", hbsObject)
    })
})

//Post new saved articles
app.post("/saved/:id", function(req, res) {
    console.log(req.params)
    db.Article.findOneAndUpdate({_id: req.params.id}, {saved: true}, {new: false})
    .then(function(dbArticle){
        res.json(dbArticle);
    })
    .catch(function(err){
        res.json(err)
    })
});

app.post("/unsaved/:id", function(req, res) {
    console.log(req.params)
    db.Article.findOneAndUpdate({_id: req.params.id}, {saved: false}, {new: false})
    .then(function(dbArticle){
        res.json(dbArticle);
    })
    .catch(function(err){
        res.json(err)
    })
});


//Post new note
app.post("/articles/:id", function(req, res) {
    db.Note.create(req.body).then(function(dbNote) {
        return db.Article.findOneAndUpdate({_id: req.params.id }, { $push: { notes: dbNote._id}}, {new: true});
    }).then(function(dbArticle) {
        res.json(dbArticle);
    }).catch(function(err) {
        res.json(err)
    })
});

// Deleting a note
app.post("/deletenote/", function(req, res) {
    console.log('Hello World!');
    console.log(req.body);
    db.Note.remove({ 
        _id: req.body.id   // To Do: Also delete the note id from the article's notes array
    }).then(function(dbNote) {
        res.json(dbNote);
    }).catch(function(err) {
        res.json(err);
    })
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ _id: req.params.id })
      // ..and populate all of the notes associated with it
      .populate("notes")
      .then(function(dbArticle) {
        // If we were able to successfully find an Article with the given id, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});
  
module.exports = app;