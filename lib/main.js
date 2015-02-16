import {log} from "./logger"
import path from "path"
import fs from "fs"
import async from "async"
import _ from "lodash"
import xml2js from "xml2js"
import {methods} from "./TvDb"
import printf from "printf"

export default function main(cwd) {
  log("cwd: " + cwd);
  var tvshowPath = path.resolve(cwd, "tvshow.nfo");

  async.waterfall([
    (next) => {
      fs.stat(tvshowPath, next);
    },
    (stats, next) => {
      fs.readFile(tvshowPath, {encoding: "utf8"}, next);
    },
    (file, next) => {
      xml2js.parseString(file, next);
    },
    (obj, next) => {
      if(obj.tvshow) {
        if(obj.tvshow.id) {
          var id = parseInt(obj.tvshow.id);
          log("id: " + id);
          return next(null, id);
        }
      }
      next(new Error("Invalid nfo file at " + tvshowPath));
    },
    (id, next) => {
      methods.getSerieInfo(id, next);
    },
    (obj, next) => {
      var title = obj.Data.Series[0].SeriesName[0];
      var seasons = _.groupBy(obj.Data.Episode, function(e) {
        return e.SeasonNumber[0];
      });
      _.each(seasons, (s, seasonNumber) => {
        var seasonDir = path.resolve(cwd, "Season " + seasonNumber);
        fs.mkdirSync(seasonDir);
        _.each(s, e => {
          var episodeFile = path.resolve(seasonDir, printf("%s - S%02dE%02d - %s.mkv",
            title,
            seasonNumber,
            e.EpisodeNumber[0],
            e.EpisodeName[0]
          ));
          fs.writeFile(episodeFile, "empty", err => {});
        })
      });
      next();
    }
  ], (err) => {
    if(err) {
      log("Error: " + err);
      return;
    }
    log("done");
  })
}
