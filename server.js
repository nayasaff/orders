const { MongoClient, ObjectID } = require("mongodb"); //const MongoClient = require('mongodb').MongoClient
//const express = require("express");
//const cors = require("cors");
require("dotenv").config();
//const app = express();

//app.use(cors());

//app.use(express.json());
//another way to do it
const util = require("util"); //The Util module provides access to some utility functions
util.promisify(MongoClient.connect); //converts MongoClient.connect function from callback to promise interface

const uri = process.env.URI;

const dbname = process.env.DB_NAME;

let dbConnection;
const connect = async () => {
  try {
    const client = await MongoClient.connect(uri); //hema
    console.log("Database connection worked");
    dbConnection = client.db(dbname);
  } catch (e) {
    console.log("Cannot connect to database");
  }
};

const mongoClient = async () => {
  if (!dbConnection) {
    await connect();
  }
  return dbConnection;
};

module.exports = {
  mongoClient,
  ObjectID,
};
