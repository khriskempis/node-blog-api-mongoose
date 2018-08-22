"use strict";

const express = require("express"); 
const mongoose = require("mongoose"); 

mongoose.Promise = global.Promise;

const { PORT, DATABASE_URL } = require('./config');
const { BlogPost } = require("./models")

const app = express();
app.use(express.json()); 

app.get('/posts', (req, res) => {
	BlogPost.find()
	.limit(10)
	.then(posts => {
			res.json({
			posts: posts.map(post => post.serialize())
		});
	})
	.catch(err => {
		console.log(err);
		res.status(500).json({message: "Internal server error"}); 
	});
});

app.get('/posts/:id', (req, res) => {
	BlogPost
	.findById(req.params.id)
	.then(restaurant => res.json(restaurant.serialize()))
	.catch(err => {
		res.status(500).json({message: "Internal Server Error"})
	});
});


app.post("/posts", (req, res) => {
	const requiredFields = ["title", "content", "author"];
	for(let i=0; i < requiredFields.length; i++){
		const field = requiredFields[i];
		if (!(field in req.body)){
			const message = `Missing ${field} in request body`;
			console.error(message);
			return res.status(400).send(message); 
		}
	}

	BlogPost.create({
		title: req.body.name,
		content: req.body.content,
		author: req.body.author
	})
		.then(post => res.status(201).json(post.serialize()))
		.catch(err => {
			console.error(err);
			res.status(500).json({message: "Internal server error"});
		});
});

app.put("/posts/:id", (req, res) => {
	if (!(res.params.id && req.body.id === req.body.id)) {
		const message = `Request path id (${req.params.id}) and request body id (${req.body.id}) must match.`
		console.error(message);
		return res.status(400).json({message: message});
	}

	const toUpdate = {};
	const updateableFields = ["title", "content", "author"];

	updateableFields.forEach(field => {
		if (field in req.body) {
			toUpdate[field] = req.body[field];
		}
	});

	BlogPost
		.findbyIdAndUpdate(req.params.id, {$set: toUpdate })
		.then(posts => res.status(204).end())
		.catch(err => res.status(500).json({message: "Internal Server Error"}));
});

app.delete("/posts/:id", (req, res) => {
	BlogPost.findByIdAndRemove(req.params.id)
		.then(posts => res.status(204).end())
		.catch(err => res.status(500).json({message: "Internal Server Error"}));
});



app.use('*', function(req, res) {
	res.status(404).json({message: "Not Found"})
});

let server;

function runServer(databaseUrl, port=PORT){
	return new Promise((resolve, reject) => {
		mongoose.connect((databaseUrl, err) => {
				if (err) {
					return reject(err);
				}
				server = app
					.listen(port, () => {
						console.log(`Your app is listening on port ${port}`);
						resolve(); 
					})
					.on("error", err => {
						mongoose.disconnect();
						reject(err); 
					});
			}
		);
	});
}

function closeServer() {
	return mongoose.disconnect().then(() => {
		return new Promise((resolve, reject) => {
			console.log("Closing server"); 
			server.close(err => {
				if (err) {
					return reject(err);
				}
				resolve(); 
			});
		});
	});
}

if (require.main === module) {
	runServer(DATABASE_URL).catch(err => console.log(err)); 
}

module.exports = { app, runServer, closeServer };












