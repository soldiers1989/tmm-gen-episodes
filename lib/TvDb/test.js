require("../requireHooks");

var tvdbMethods = require("./methods");
var xml2js = require("xml2js");

var serverTimeXml = '<?xml version="1.0" encoding="UTF-8" ?><Items><Time>1424037673</Time></Items>';
xml2js.parseString(serverTimeXml, function(err, serverTimeObj) {
  if(err) {
    console.log(err);
    return;
  }
  console.log(require("util").inspect(serverTimeObj));
});


tvdbMethods.getServerTime(function(err, time) {
  console.log("Server time: " + time);
});
