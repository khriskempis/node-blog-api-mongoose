"use strict";

const express = require("express"); 
const mongoose = require("mongoose"); 

mongoose.Promise = global.Promise;

const { PORT, DATABASE_URL } = require('./config');
const { BlogPost } = require("./models")

const app = express()
app.use(exress.json()); 

app.get('/posts', (req, res) => {
	BlogPost.find()
	.limit(10)
	.then(posts => {
		res.json({
			posts: posts.map(post => post.serialize()); 
		});
	})
	.catch(err => {
		console.log(err);
		res.status(500).json({message: "Internal server error"}); 
	});
});