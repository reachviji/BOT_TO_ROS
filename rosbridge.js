#!/usr/bin/env nodejs 
 
 
var WebSocket = require('ws'); 
const express = require('express'); 
const bodyParser = require('body-parser'); 
const restService = express(); 
var ROSLIB = require('roslib');  
 
restService.use(bodyParser.urlencoded({ 
	extended: true 
})); 
 
restService.use(bodyParser.json()); 
 
restService.post('/echo', function(req, res) {
	var speech = req.body.result && req.body.result.parameters && req.body.result.parameters.command ? req.body.result.parameters.command : "Seems like some problem. Speak again."
	//var speech = "heyyyyyyyyy";
	console.log("This is from webhook: " +speech);
	senddatatows(speech);
	
	return res.json({
		speech: speech,
		displayText: speech,
		source: 'command'
	});
	
});
 
function senddatatows(speech) {
	/* Load application settings */  
	var no_skipping_factor = 1; 
	/*ROS-bridge endpoint*/ 
	
	var ros = new ROSLIB.Ros({
		url : 'ws://192.168.198.131:9090'
	});
	
	/*webSocket Cloud options*/ 
	var ws_client_state = "offline"; 
	var ws = new WebSocket('wss://ws-broadcast-server-d062507.cfapps.eu10.hana.ondemand.com'); 
 
	ws.on('open', function open() { 
		ws.send(speech); 
	}); 
 
	ws.on('message', function incoming(msg) { 
		console.log("This is from websocket: " +msg); 
	}); 
 
	ws.on('close', function close() { 
  //ws_client_state = "offline"; 
		console.log('websocket cloud client disconnected'); 
	}); 
 
	 
	/* 
	ROS-BRIDGE HANDLDER 
	*/ 
	/*State of ROS-BRIDGE connection*/ 
 
	var ros_bridge_state = 'offline'; 
 
	ros.on('connection', function() { 
	  ros_bridge_state = "Connected"; 
	  console.log('Connected to ROS-Bridge server.'); 
	}); 
 
 
	ros.on('error', function(error) { 
	  console.log('Error connecting to ROS-bridge server: ', error); 
	  ros_bridge_state = 'offline' 
	}); 
 
	ros.on('close', function() { 
	  console.log('Connection to ROS-Bridge server closed.'); 
	  ros_bridge_state = 'offline' 
	}); 
	
	// Publishing a Topic
// ------------------

	var speak = new ROSLIB.Topic({
	  ros : ros,
	  name : '/chatbot',
	  messageType : 'std_msgs/String'
	});

	var str = new ROSLIB.Message({
			data: 'Hey, I am working'
	});

	console.log("Publishing chatbot");
	speak.publish(str);
	 
 
}

restService.listen((process.env.PORT || 8000), function() {
    console.log("Server up and listening");
});
