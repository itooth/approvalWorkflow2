import request from 'supertest';
import app from '../../app';
import { generateTestToken } from '../setup';
import { User } from '../../models/User';

describe('Organization API', () => {
  const token = generateTestToken();

  describe('GET /organ/listDepts', () => {
    it('should return department list', async () => {
      const response = await request(app)
        .get('/organ/listDepts')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1);
      expect(response.body.data).toHaveLength(4); // Default departments
      expect(response.body.data[0]).toMatchObject({
        id: '1',
        pid: '0',
        name: '总公司'
      });
    });
  });

  describe('GET /organ/listRoles', () => {
    it('should return role list', async () => {
      const response = await request(app)
        .get('/organ/listRoles')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1);
      expect(response.body.data).toHaveLength(3); // Default roles
      expect(response.body.data[0]).toMatchObject({
        id: '1',
        name: '管理员'
      });
    });
  });

  describe('GET /organ/listUsers', () => {
    beforeEach(async () => {
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        tenantId: '1'
      });
    });

    it('should return user list', async () => {
      const response = await request(app)
        .get('/organ/listUsers')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0]).toMatchObject({
        name: 'Test User',
        email: 'test@example.com'
      });
      // Should not return password
      expect(response.body.data[0].password).toBeUndefined();
    });
  });

  describe('GET /organ/getUserDetail', () => {
    let testUser: any;

    beforeEach(async () => {
      testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        mobile: '1234567890',
        avatar: 'avatar.jpg',
        tenantId: '1'
      });
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/organ/getUserDetail')
        .query({ userId: '123456789012' })
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.code).toBe(0);
      expect(response.body.error).toBe('User not found');
    });

    it('should return user details', async () => {
      const response = await request(app)
        .get('/organ/getUserDetail')
        .query({ userId: testUser._id.toString() })
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(1);
      expect(response.body.data).toMatchObject({
        name: 'Test User',
        email: 'test@example.com',
        mobile: '1234567890',
        avatar: 'avatar.jpg'
      });
      // Should not return password
      expect(response.body.data.password).toBeUndefined();
    });
  });
}); 