/* eslint-disable camelcase */
import express from 'express'
import { getComments, getThreadComments, addComment } from '../database'
import { uuid } from './helpers'
import { catchErrors } from '../handlers'

const router = express.Router()

// @api GET /api/comments
// Retrieve all comments.
//
// returns JSON array of all comments in database
router.get('/', catchErrors(async (req, res) => {
  await getComments().then((rows) => {
    res.send(rows)
  })
}))

// @api POST /api/comments
// Adds comment to database.
//
// Example body @json {
//   "text": "minttua",
//   "user": "salaattipoika",
//   "blob": "{\"path\": \"/path/to/element\"}"
// }
//
// Returns 'OK' if comment is succesfully added
router.post('/', catchErrors(async (req, res) => {
  const { text, userId, blob } = req.body
  const id = uuid()
  const threadId = req.body.threadId || uuid()
  await addComment({
    id, text, userId, threadId, blob,
  })
  res.send('OK')
}))

// @api GET /api/comments/:threadId
// Get comments by threadId
//
// returns JSON array of all comments in thread
router.get('/:threadId', catchErrors(async (req, res) => {
  const { threadId } = req.params
  await getThreadComments(threadId).then((rows) => {
    res.send(rows)
  })
}))

module.exports = router
