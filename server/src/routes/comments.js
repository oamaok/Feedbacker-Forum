const path = require('path')
const express = require('express')
const router = express.Router()
const uuidv4 = require('uuid/v4')
const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database(path.join(__dirname, '../database/commentdb.db'))

// Uncomment for emoji uuid
// const randomEmoji = require('random-unicode-emoji');
// function emojiUuid(length = 8) {
//   return randomEmoji.random({count: 7}).join("")
// }

//Generate unique random id
function uuid(length = 8) {
  return uuidv4().split('-').join("").slice(0, length)
}

function getCommentsByThread(thread_id) {
  db.all("SELECT * FROM comments WHERE thread_id=?", thread_id, (err, rows) => {
    if (err) {
      console.log(err)
    } else {
      console.log(rows)
    }
  })
}

function getReactionsByComment(comment_id) {
  db.all("SELECT * FROM reactions WHERE comment_id=?", comment_id, (err, rows) => {
    if (err) {
      console.log(err)
    } else {
      console.log(rows)
    }
  })
}

router.get('/comments', (req, res) => {
  db.all("SELECT * FROM comments", (err, rows) => {
    if (err) {
      console.log(err)
    } else {
      res.send(rows)
    }
  })
})

router.get('/questions', (req, res) => {
  db.all("SELECT * FROM questions", (err, rows) => {
    if (err) {
      console.log(err)
    } else {
      res.send(rows)
    }
  })
})

router.post('/reaction', (req, res) => {
  const { emoji, user, comment_id } = req.body
  const id = uuid()
  db.run("INSERT INTO reactions(id, emoji, user, comment_id) VALUES(?, ?, ?, ?)", [id, emoji, user, comment_id])
  res.send("👌")
})

router.post('/question', (req, res) => {
  const { text, user } = req.body
  const id = uuid()
  const thread_id = req.body.thread_id || uuid()
  db.run("INSERT INTO questions(id, text, user, thread_id) VALUES(?, ?, ?, ?)", [id, text, user, thread_id])
  res.send("👌")
})

router.post('/comment', (req, res) => {
  const { text, user } = req.body
  const id = uuid()
  const thread_id = req.body.thread_id || uuid()
  db.run("INSERT INTO comments(id, text, user, thread_id) VALUES(?, ?, ?, ?)", [id, text, user, thread_id])
  res.send("👌")
})

module.exports = router
