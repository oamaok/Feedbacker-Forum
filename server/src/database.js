import SQLiteDatabase from './database/database-sqlite'
import PostgresDatabase from './database/database-postgres'
import { config } from './globals'

let db = null

export async function initializeDatabase() {
  if (config.databaseUrl === undefined) {
    db = new SQLiteDatabase(config.sqliteFilename)
    await db.initialize(config.useTestData)
  } else {
    db = await new PostgresDatabase(config.databaseUrl)
    await db.initialize(config.useTestData)
  }
}

export async function getComments() { return db.query('SELECT * FROM comments') }

export async function getQuestions() { return db.query('SELECT * FROM questions') }

export async function getReactions() { return db.query('SELECT * FROM reactions') }

export async function addReaction({
  id, emoji, userId, commentId,
}) { return db.run('INSERT INTO reactions(id, emoji, user_id, comment_id) VALUES (?, ?, ?, ?)', [id, emoji, userId, commentId]) }

export async function addComment({
  id, text, userId, threadId, blob,
}) { return db.run('INSERT INTO comments(id, text, user_id, thread_id, blob) VALUES (?, ?, ?, ?, ?)', [id, text, userId, threadId, blob]) }

export async function addQuestion({
  id, text, userId, threadId, blob,
}) { return db.run('INSERT INTO questions(id, text, user_id, thread_id, blob) VALUES (?, ?, ?, ?, ?)', [id, text, userId, threadId, blob]) }

export async function addThread({
  id, container, blob,
}) { return db.run('INSERT INTO threads(id, container_id, blob) VALUES (?, ?, ?)', [id, container, blob]) }

export async function getThreadComments(values = []) { return db.query('SELECT * FROM comments WHERE thread_id=?', values) }

export async function getCommentReactions(values = []) { return db.query('SELECT * FROM reactions WHERE comment_id=?', values) }

export async function addUser({ id, name, secret }) { return db.run('INSERT INTO users(id, name, secret) VALUES (?, ?, ?)', [id, name, secret]) }
