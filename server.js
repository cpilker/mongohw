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

var PORT = 3000;

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
mongoose.connect("mongodb://localhost/mongohw");

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


//Post new note
app.post("/articles/:id", function(req,res){
     console.log(req.params)
    //  console.log(data)
    db.Note.create(req.params.id).then(function(dbNote){
        return db.Article.findOneAndUpdate({_id: req.params.id }, { $push: { notes: dbNote._id}}, {new: true});
    })
    .then(function(dbArticle) {
        res.json(dbArticle);
    })
    .catch(function(err) {
        res.json(err)
    })
})

// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});
  
module.exports = app;