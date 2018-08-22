"use strict";

exports.DATABASE_URL = 
	process.env.DATABASE_URL || 'mongodb://localhost/blog-post';
exports.TEST_DATABASE_URL = 
	process.env.TEST_DATABASE_URL || "mongodb://localhost/test-blog-post";
exports.PORT = process.env.PORT || 8080;