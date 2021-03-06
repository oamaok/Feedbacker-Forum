<!-- This file is autogenerated, do not modify directly,
     If you wish to edit the contents update the documentation
     comments or the template file: misc/api-template.md -->

# API

## Version

### [GET /api/version](../server/src/routes/version.js#L49)

Retrieve version information about the running server.

Example response
```json
{
  "gitHash": "331d54dc84a46d12e15bdc9e7b16aacf2f2741a9",
  "gitBranch": "develop"
}
```

## Comments

### [GET /api/comments](../server/src/routes/comments.js#L15)

Retrieve all comments.

returns JSON array of all comments in database
### [POST /api/comments](../server/src/routes/comments.js#L36)

Adds comment to database.

Example body for a root comment
```json
{
  "text": "minttua",
  "user": "salaattipoika",
  "container": "abcdef",
  "blob": "{\"path\": \"/path/to/element\"}"
}
```
comments can be linked to a thread with
```json
{
  "text": "minttua",
  "user": "salaattipoika",
  "threadId": "1234",
  "blob": "{\"path\": \"/path/to/element\"}"
}
```

Returns `{ id, threadId }` of the new comment

### [GET /api/comments/:threadId](../server/src/routes/comments.js#L61)

Get comments by threadId

returns JSON array of all comments in thread

## Questions

### [GET /api/questions](../server/src/routes/questions.js#L13)

Retrieve all questions.

returns JSON array of all questions in database
### [POST /api/questions](../server/src/routes/questions.js#L27)

adds question to database.

Example body
```json
{
  "text": "What?",
  "user": "salaattipoika",
  "blob": "{\"path\": \"/path/to/element\"}"
}
```

Returns `{ id }` of the created question

## Reactions

### [GET /api/reactions](../server/src/routes/reactions.js#L13)

Retrieve all reactions.

returns JSON array of all reactions in database
### [POST /api/reactions](../server/src/routes/reactions.js#L36)

add reaction to the database.

Example body
```json
{
  "emoji": "🍑",
  "user": "jaba",
  "comment_id": "1bd8052b"
}
```

Returns `{ id }` of the reaction

### [GET /api/reactions/:commentId](../server/src/routes/reactions.js#L21)

Retrieve all reactions by commentId.

returns JSON array of all reactions to comment

## Users

### [POST /api/users](../server/src/routes/users.js#L21)

Add user to database.
Returns JSON that contains generated id and secret of added user.
The body can be empty to create a new anonymous user which is the default
mode of interaction in the frontend.
Alternatively you can specify properties for the new user, eg.
```json
{
  "name": "salaattipoika"
}
```

Example response
```json
{
    "id": "d6ac55e9",
    "secret": "ea2ca2565f484906bfd5096126816a"
}
```
