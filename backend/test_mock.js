import app from './app.js';
import request from 'supertest';

async function test() {
  try {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', 'Bearer MOCK_TOKEN_HERE')
      .send({
        title: 'Build API',
        description: 'Finish task service',
        status: 'pending',
        priority: 'high',
        tags: ['backend', 'node'],
        dueDate: '2026-04-20'
      });
    
    console.log('Status:', res.status);
    console.log('Body:', res.body);
  } catch (err) {
    console.error('Test Error:', err);
  } finally {
    process.exit(0);
  }
}

test();
