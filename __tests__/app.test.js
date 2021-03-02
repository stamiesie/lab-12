require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;

    beforeAll(async done => {
      execSync('npm run setup-db');

      client.connect();

      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });

      token = signInData.body.token; // eslint-disable-line

      return done();
    });

    afterAll(done => {
      return client.end(done);
    });

    const todo = {
      todo: 'get groceries',
      completed: false,
    };

    const dbTodo = {
      ...todo,
      id: 4,
      owner_id: 2,
    };


    // POST //
    test('create a todo', async () => {
      const data = await fakeRequest(app)
        .post('/api/todos')
        .send(todo)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual([dbTodo]);
    });


    // GET //
    test('returns all todos for a single user', async () => {
      const data = await fakeRequest(app)
        .get('/api/todos')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual([dbTodo]);
    });


    // PUT //
    test('updates a todo to completed for user', async () => {

      const completedTodo = {
        id: 4,
        todo: 'get groceries',
        completed: true,
        owner_id: 2,
      };

      const updatedTodo = await fakeRequest(app)
        .put('/api/todos/4')
        .send(dbTodo)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(updatedTodo.body).toEqual([completedTodo]);
    });
  });
});

