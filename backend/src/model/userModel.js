const mongoose = require('mongoose');

const collectionName = 'user';

const Schema = new mongoose.Schema({}, { strict: false });

const userModel = mongoose.model(
    collectionName,
    Schema,
    collectionName
);

module.exports = userModel;