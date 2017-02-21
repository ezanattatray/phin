"use strict";

var http = require("http");
var https = require("https");

var url = require("url");

module.exports = function(opts, cb) { // All opts: url, method, port, auth, headers, data

	// Validate most inputs
	if (typeof(opts) !== "string" && !opts.hasOwnProperty("url")) throw "Missing url option from options for request method.";
	if (!cb) throw "Missing callback for request method.";

	var addr;

	if (typeof(opts) === "string") { // Default options (GET, default port / selected port) from string URL
		addr = url.parse(opts);
		var options = {
			"hostname": addr.hostname,
			"port": (Number(addr.port) || (addr.protocol.toLowerCase() === "http:" ? 80 : 443)), // Either port selected in string URL (if any) or if nonexistant default for protocol.
			"path": addr.path,
			"method": "GET",
			"headers": {},
			"auth": null
		};
	}
	else { // Custom options
		addr = url.parse(opts.url);
		var options = {
			"hostname": addr.hostname,
			"port": (Number(opts.port) || Number(addr.port) || (addr.protocol.toLowerCase() === "http:" ? 80 : 443)), // Selected through options / selected in URL / default for protocol.
			"path": addr.path,
			"method": (opts.method || "GET"),
			"headers": (opts.headers || {}),
			"auth": (opts.auth || addr.auth || null)
		};
	}

	console.log(options);

	var req;

	var resHandler = function(res) {
		res.setEncoding("utf8");
		var resBody = "";
		res.on("data", function(chunk) {
			resBody += chunk;
		});
		res.on("end", function() {
			cb(null, resBody, res);
		});
	};

	switch (addr.protocol.toLowerCase()) {
		case "http:":
			req = http.request(options, resHandler);
			break;
		case "https:":
			req = https.request(options, resHandler);
			break;
		default:
			cb("Invalid / unknown address protocol. (Expected HTTP or HTTPS.)", null, null);
			return;
	}

	if (opts.hasOwnProperty("data")) {
		if (typeof(opts.data) === "object") {
			req.write(JSON.stringify(opts.data));
		}
		else {
			req.write(opts.data.toString());
		}
	}

	req.end();
};