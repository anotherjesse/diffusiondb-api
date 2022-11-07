const fp = require("fastify-plugin");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();

async function dbConnector(fastify, options) {
  const fn = "./data.db";

  const db = new sqlite3.Database(fn, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Connected to SQlite database.");
  });

  function query(q, l) {
    return new Promise((resolve, reject) => {
      db.all(
        "select id, p, se, c, st, sa from dreams where rowid in (SELECT rowid FROM dreams_fts WHERE dreams_fts MATCH ? ORDER BY rank limit ?)",
        [q, l],
        (err, rows) => {
          if (err) {
            reject(err);
          }
          resolve(rows);
        }
      );
    });
  }

  function count() {
    return new Promise((resolve, reject) => {
      db.get("select count(*) as count from dreams", (err, row) => {
        if (err) {
          reject(err);
        }
        resolve(row.count);
      });
    });
  }

  function mtime() {
    // get the last modified date from filesystem of the database file
    return new Promise((resolve, reject) => {
      fs.stat(fn, (err, stats) => {
        if (err) {
          reject(err);
        }
        resolve(stats.mtime);
      });
    });
  }

  const sqlite = { db, query, count, mtime };

  fastify.decorate("sqlite", sqlite);
}

module.exports = fp(dbConnector);
