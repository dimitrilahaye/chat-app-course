const path = require('path');
const express = require('express');

const public = path.join(__dirname, '..', 'public');

const app = express();
app.use(express.static(public));

module.exports = app;