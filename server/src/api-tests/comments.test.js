import assert from 'assert'
import apiRequest from './api-request'

describe('/api/comments', () => {
  it('should return OK for posting a commment', async () => {
    const answer = await apiRequest('/api/comments', {
      method: 'POST',
      body: {
        text: 'testing',
        userId: 'da776df3',
        blob: '{"path": "/path/to/element"}',
      },
    })
    assert.equal(answer, 'OK')
  })
})

describe('/api/comments', () => {
  it('first comment s text should be skrattia', async () => {
    const comments = await apiRequest('/api/comments', {
      method: 'GET',
    })
    assert.equal(comments[0].text, 'skrattia')
  })
})

describe('/api/comments', () => {
  it('every comment text should be string', async () => {
    const comments = await apiRequest('/api/comments', {
      method: 'POST',
      body: {
        text: 1,
        userId: 'da776df3',
        blob: '{"path": "/path/to/element"}',
      },
    })
    assert.equal(typeof comments, 'string')
  })
})

describe('/api/questions', () => {
  it('should return OK', async () => {
    const answer = await apiRequest('/api/questions', {
      method: 'POST',
      body: {
        text: 'Pääpäivä?',
        userId: 'da776df3',
        blob: '{"path": "/path/to/element"}',
      },
    })
    assert.equal(answer, 'OK')
  })
})

describe('/api/questions', () => {
  it('should return the last question', async () => {
    const questions = await apiRequest('/api/questions', {
      method: 'GET',
    })
    assert.equal(questions[questions.length - 1].text, 'Pääpäivä?')
  })
})


describe('/api/reactions', () => {
  it('should return OK', async () => {
    const answer = await apiRequest('/api/reactions', {
      method: 'POST',
      body: {
        emoji: '🍑',
        userId: 'da776df3',
        commentId: '1bd8052b',
      },
    })
    assert.equal(answer, 'OK')
  })
})

describe('/api/reactions', () => {
  it('should return the last question', async () => {
    const reactions = await apiRequest('/api/reactions', {
      method: 'GET',
    })
    assert.equal(reactions[reactions.length - 1].emoji, '🍑')
  })
})
