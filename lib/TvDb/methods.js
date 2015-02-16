import http from "http"
import xml2js from "xml2js"
import config from "./config"
import util from "util"
import fs from "fs"
import path from "path"
import beautify from "js-beautify"

function getMirror() {
  return config.mirror;
}

function getMirrorWithKey() {
  return getMirror() + config.apiKey + "/";
}

var cache = {};
try {
  cache = require("./cache");
} catch (e) {}

(function initCache() {
  if(!cache.series) {
    cache.series = {};
  }
})();

function saveCache() {
  fs.writeFile(
    path.resolve(__dirname, "cache.json"),
    beautify(JSON.stringify(cache))
  );
}
function getSerie(id) {
  return cache.series[id];
}
function setSerie(id, data) {
  cache.series[id] = data;
  saveCache();
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

export function getSerieInfo(id, callback) {
  if(!callback) {
    return;
  }
  var data = getSerie(id);
  if(data) {
    return data;
  }
  var url = util.format("%sseries/%d/all/en.xml", getMirrorWithKey(), id);
  http.get(url, function(res) {
    res.setEncoding('utf8');
    var xml = "";
    res.on('data', (chunk) => {
      //console.log("Chunk: " + chunk);
      xml += chunk;
    });
    res.on("end", () => {
      xml2js.parseString(xml, (err, data) => {
        if(err) {
          return callback(err);
        }
        setSerie(id, data);
        callback(null, data);
      });
    })
  }).on('error', function(e) {
    console.log("Error retrieving TvDb server time " + e.message);
  });
}
