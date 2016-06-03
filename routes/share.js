/*jshint bitwise:true, browser:false, camelcase:true, curly:true, devel:false, eqeqeq:false, forin:true, immed:true, indent:4, newcap:true, noarg:true, noempty:true, nonew:true, quotmark:true, regexp:false, strict:true, trailing:true, undef:true, unused:true, node:true */
'use strict';
var express = require('express');
var rid = require('readable-id');

var router = express.Router();

router.get("/", function(req,res) {
    res.send("<h1>" + rid() + "</h1>");
});

module.exports = router;
