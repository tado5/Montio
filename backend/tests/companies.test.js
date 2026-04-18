import request from 'supertest';
import express from 'express';
import pool from '../config/db.js';
import authRoutes from '../routes/auth.js';
import companiesRoutes from '../routes/companies.js';
import onboardingRoutes from '../routes/onboarding.js';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api', onboardingRoutes);

describe('Companies & Onboarding Tests', () => {
  let superadminToken;
  let superadminId;
  let inviteToken;
  let companyPublicId;
  let companyId;

  // Setup: Create superadmin
  beforeAll(async () => {
    const bcryptModule = await import('bcryptjs');
    const bcrypt = bcryptModule.default;
    const hashedPassword = await bcrypt.hash('superadmin123', 10);

    const [result] = await pool.query(
      `INSERT INTO users (email, password_hash, name, role)
       VALUES (?, ?, ?, ?)`,
      ['superadmin@test.com', hashedPassword, 'Super Admin', 'superadmin']
    );
    superadminId = result.insertId;

    // Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'superadmin@test.com', password: 'superadmin123' });
    superadminToken = loginRes.body.token;
  });

  afterAll(async () => {
    // Cleanup
    if (companyId) {
      await pool.query('DELETE FROM activity_logs WHERE company_id = ?', [companyId]);
      await pool.query('DELETE FROM order_types WHERE company_id = ?', [companyId]);
      await pool.query('DELETE FROM users WHERE company_id = ?', [companyId]);
      await pool.query('DELETE FROM companies WHERE id = ?', [companyId]);
    }
    await pool.query('DELETE FROM users WHERE id = ?', [superadminId]);
    await pool.end();
  });

  // ==================== SEND COMPANY INVITE ====================
  describe('POST /api/companies - Send Company Invite', () => {
    test('should send invite and generate invite_token', async () => {
      const res = await request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({ email: 'newcompany@test.com' });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Pozvánka odoslaná.');
      expect(res.body.invite).toHaveProperty('invite_token');
      expect(res.body.invite).toHaveProperty('invite_link');
      expect(res.body.invite.invite_link).toContain('/register/');

      inviteToken = res.body.invite.invite_token;
      companyId = res.body.invite.company_id;

      // Get public_id
      const [companies] = await pool.query('SELECT public_id FROM companies WHERE id = ?', [companyId]);
      companyPublicId = companies[0].public_id;
    });

    test('should fail without superadmin role', async () => {
      // Create regular user
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash('user123', 10);
      const [userResult] = await pool.query(
        `INSERT INTO users (email, password_hash, name, role)
         VALUES (?, ?, ?, ?)`,
        ['user@test.com', hashedPassword, 'Regular User', 'companyadmin']
      );

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'user@test.com', password: 'user123' });

      const res = await request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${loginRes.body.token}`)
        .send({ email: 'another@test.com' });

      expect(res.status).toBe(403);

      // Cleanup
      await pool.query('DELETE FROM users WHERE id = ?', [userResult.insertId]);
    });

    test('should fail with duplicate email', async () => {
      const res = await request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({ email: 'newcompany@test.com' }); // Same email

      expect(res.status).toBe(400);
    });
  });

  // ==================== VALIDATE INVITE TOKEN ====================
  describe('GET /api/invites/:token - Validate Invite', () => {
    test('should validate invite token', async () => {
      const res = await request(app)
        .get(`/api/invites/${inviteToken}`);

      expect(res.status).toBe(200);
      expect(res.body.valid).toBe(true);
      expect(res.body.email).toBe('newcompany@test.com');
      expect(res.body.status).toBe('pending');
    });

    test('should fail with invalid token', async () => {
      const res = await request(app)
        .get('/api/invites/invalid-token-123');

      expect(res.status).toBe(404);
    });
  });

  // ==================== ONBOARDING STEP 1 ====================
  describe('POST /api/onboarding/step1 - Basic Info', () => {
    test('should save basic company info', async () => {
      const res = await request(app)
        .post('/api/onboarding/step1')
        .send({
          inviteToken,
          name: 'Test Company Ltd.',
          ico: '12345678',
          dic: '1234567890',
          address: 'Bratislava, Slovakia, 81101'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('should fail with invalid IČO', async () => {
      const res = await request(app)
        .post('/api/onboarding/step1')
        .send({
          inviteToken,
          name: 'Test Company',
          ico: '123', // Too short
          address: 'Address'
        });

      expect(res.status).toBe(400);
    });
  });

  // ==================== ONBOARDING STEP 3 ====================
  describe('POST /api/onboarding/step3 - Order Types', () => {
    test('should create order types', async () => {
      const res = await request(app)
        .post('/api/onboarding/step3')
        .send({
          inviteToken,
          orderTypes: [
            {
              name: 'Rekuperácia',
              description: 'Montáž rekuperácie',
              checklist: [{ item: 'Check 1', required: true }]
            },
            {
              name: 'Klimatizácia',
              description: 'Montáž klimatizácie',
              checklist: []
            }
          ]
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.orderTypesCount).toBe(2);
    });
  });

  // ==================== COMPLETE ONBOARDING ====================
  describe('POST /api/onboarding/complete - Activate Company', () => {
    test('should complete onboarding and activate company', async () => {
      const res = await request(app)
        .post('/api/onboarding/complete')
        .send({
          inviteToken,
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.role).toBe('companyadmin');
      expect(res.body.user.email).toBe('newcompany@test.com');

      // ⭐ VERIFY ACTIVITY LOG WAS CREATED
      const [logs] = await pool.query(
        `SELECT * FROM activity_logs
         WHERE company_id = ?
         AND action = 'company.activated'`,
        [companyId]
      );

      expect(logs.length).toBeGreaterThan(0);

      // ⭐ VERIFY COMPANY STATUS
      const [companies] = await pool.query('SELECT status FROM companies WHERE id = ?', [companyId]);
      expect(companies[0].status).toBe('active');
    });
  });

  // ==================== GET COMPANY DETAIL ====================
  describe('GET /api/companies/:publicId - Get Company Detail', () => {
    test('should get company detail with stats', async () => {
      const res = await request(app)
        .get(`/api/companies/${companyPublicId}`)
        .set('Authorization', `Bearer ${superadminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('company');
      expect(res.body).toHaveProperty('users');
      expect(res.body).toHaveProperty('logs');
      expect(res.body).toHaveProperty('stats');
      expect(res.body.stats.order_types).toBe(2);
    });
  });

  // ==================== DEACTIVATE COMPANY ====================
  describe('PUT /api/companies/:publicId/deactivate - Deactivate Company', () => {
    test('should deactivate company', async () => {
      const res = await request(app)
        .put(`/api/companies/${companyPublicId}/deactivate`)
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({ companyName: 'Test Company Ltd.' });

      expect(res.status).toBe(200);
      expect(res.body.company.status).toBe('inactive');
    });
  });

  // ==================== DELETE COMPANY ====================
  describe('DELETE /api/companies/:publicId - Delete Company', () => {
    test('should delete inactive company', async () => {
      const res = await request(app)
        .delete(`/api/companies/${companyPublicId}`)
        .set('Authorization', `Bearer ${superadminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Firma bola vymazaná.');

      companyId = null; // Prevent double cleanup
    });

    test('should fail to delete active company', async () => {
      // Create another company
      const inviteRes = await request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({ email: 'active@test.com' });

      const [companies] = await pool.query('SELECT public_id, id FROM companies WHERE email = ?', ['active@test.com']);

      // Try to delete without deactivating
      const res = await request(app)
        .delete(`/api/companies/${companies[0].public_id}`)
        .set('Authorization', `Bearer ${superadminToken}`);

      expect(res.status).toBe(400);

      // Cleanup
      await pool.query('DELETE FROM companies WHERE id = ?', [companies[0].id]);
    });
  });
});
