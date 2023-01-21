const express = require('express');
const cors = require('cors');
require('dotenv').config();
const moviesdb = require('./modules/moviesDB.js');
const db = new moviesdb();
const app = express();

var HTTP_PORT = process.env.HTTP_PORT || 8080;

app.use(express.static("static"));
app.use(cors());
app.use(express.json());

process.env.MONGODB_CONN_STRING = "mongodb+srv://ceejbnvntra:cj950609@bti425-a1.iz9y8ut.mongodb.net/sample_mflix?retryWrites=true&w=majority";
db.initialize(process.env.MONGODB_CONN_STRING).then(()=>{
    app.listen(HTTP_PORT, ()=>{
        console.log(`server listening on: ${HTTP_PORT}`);
    });
}).catch((err)=>{
    console.log(err);
});

//GET Home route
app.get("/", function(req, res) {
    res.status(200).json({message: "API Listening"});
});

//POST movies route
app.post("/api/movies", (req, res) => {
    db.addNewMovie(req.body).then(data => {
        res.status(201).send(data);
    }).catch((err) => {
        res.status(404).send(err);
    });
});

//GET movies route
//accepts query parameters to show a page number, items shown per page, and search
//a specific movie title if provided
app.get("/api/movies", (req, res) => {
    var page = req.query.page;
    var perPage = req.query.perPage;
    var title = req.query.title;

    db.getAllMovies(page, perPage, title).then(data => {
        //returns the movies if data is not empty
        if (data.length > 0) {
            res.status(200).send(data);
        }
        //returns an error message if no movies are found or if data is empty
        else {
            res.status(404).send("ERROR: Cannot find movie.");
        }
    //throws an error if page and perPage parameters are invalid
    }).catch((err) => {
        res.status(404).send(err);
        // res.status(404).send("Invalid page number.");
    });
});

//GET movies route by id
//accepts a parameter id to search a specific movie
app.get("/api/movies/:id", (req, res) => {
    //gets a movie by the id parameter requested
    db.getMovieById(req.params.id).then(data => {
        if (data != null) {
            res.status(200).send(data);
        }
        else {
            res.status(404).send("ERROR: Cannot find movie with id: " + req.params.id);
        }
    //catches an error if no movie is found
    }).catch(() => {
        res.status(404).send("ERROR: Cannot find movie with id: " + req.params.id);
    });
});

//PUT movie route by id
//accepts a parameter id to update a specific movie
app.put("/api/movies/:id", (req, res) => {
    //updates a movie by the id parameter requested
    db.updateMovieById(req.body, req.params.id).then(data => {
        if (data != null) {
            res.status(201).send(data);
        }
        else {
            res.status(404).send("ERROR: Cannot update movie with id: " + req.params.id);
        }
    //catches an error if no movie is found
    }).catch(() => {
        res.status(404).send("ERROR: Cannot update movie with id: " + req.params.id);
    });
});

//DELETE movie route by id
//accepts a parameter id to delete a specific movie
app.delete("/api/movies/:id", (req, res) => {
    //deletes a movie by the id parameter requested
    db.deleteMovieById(req.params.id).then(data => {
        if (data != null) {
            res.status(200).send(data);
        }
        else {
            res.status(204).send("ERROR: movie id: " + req.params.id + " does not exist.");
        }

    //catches an error if no movie is found
    }).catch(() => {
        res.status(204).send("ERROR: movie id: " + req.params.id + " does not exist.");
    });
});