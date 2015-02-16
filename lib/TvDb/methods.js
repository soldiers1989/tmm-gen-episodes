import http from "http"
import xml2js from "xml2js"
import config from "./config"

function getMirror() {
  return config.mirror;
}

export function getServerTime(callback) {
  if(!callback) {
    return;
  }

  http.get(getMirror() + "Updates.php?type=none", function(res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      xml2js.parseString(chunk, function(err, obj) {
        if(err) {
          return callback(err);
        }
        callback(null, parseInt(obj.Items.Time[0]));
      });
    });
  }).on('error', function(e) {
    console.log("Error retrieving TvDb server time " + e.message);
  });
}
