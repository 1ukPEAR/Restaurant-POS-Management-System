const mongoose = require('mongoose');

const collectionName = 'shop';

const Schema = new mongoose.Schema({}, { strict: false });

const menuModel = mongoose.model(
    collectionName,
    Schema,
    collectionName
);

module.exports = menuModel;