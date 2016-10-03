var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

var ORDRE_COLLECTION = "collection";

var app = express();
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

// Create a database variable outside of the database connection callback to
// reuse the connection pool in your APP.
var db;

// Connect to the database before starting the application server.
mongodb.MongoClient.connect("mongodb://localhost:27017/ajax", function (err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = database;
  console.log("Database connection ready");

  // Initialize the APP.
  var server = app.listen(8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});

// ORDRE API ROUTES BELOW

// Generic error handler used by all EndPoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

/*
 * "/ORDRE" GET: finds all ORDRE POST: creates a new contact
 */

app.get("/order", function(req, res) {
  db.collection(ORDRE_COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get ORDRE.");
    } else {
      res.status(200).json(docs);  
    }
  });
});

app.post("/order", function(req, res) {
  var newOrder = req.body;
  
  // newOrder.createDate = new Date();
  if (!(req.body.name && req.body.drink)) {
    handleError(res, "Invalid user input", "Must provide a first or last name.", 400);
  }
  
  db.collection(ORDRE_COLLECTION).insertOne(newOrder, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to create new contact.");
    } else {
      res.status(201).json(doc.ops[0]);
    }
  });
});

/*
 * "/ORDRE/:id" GET: find contact by id PUT: update contact by id DELETE:
 * deletes contact by id
 */

app.get("/order/:id", function(req, res) {
  db.collection(ORDRE_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to get contact");
    } else {
      res.status(200).json(doc);
    }
  });
});

app.put("/order/:id", function(req, res) {
  var updateDoc = req.body;
  delete updateDoc._id;
  
  db.collection(ORDRE_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update contact");
    } else {
      res.status(204).end();
    }
  });
});

app.delete("/order/:id", function(req, res) {
  db.collection(ORDRE_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
    if (err) {
      handleError(res, err.message, "Failed to delete contact");
    } else {
      res.status(204).end();
    }
  });
});