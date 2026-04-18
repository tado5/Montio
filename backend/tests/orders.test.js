import request from 'supertest';
import express from 'express';
import pool from '../config/db.js';
import ordersRoutes from '../routes/orders.js';
import authRoutes from '../routes/auth.js';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/orders', ordersRoutes);

describe('Orders API Tests', () => {
  let authToken;
  let companyAdminUser;
  let companyId;
  let orderTypeId;
  let orderId;
  let quoteLink;

  // Setup: Create test company and user
  beforeAll(async () => {
    // Create test company
    const [companyResult] = await pool.query(
      `INSERT INTO companies (public_id, name, email, status)
       VALUES (?, ?, ?, ?)`,
      ['test-company-' + Date.now(), 'Test Company', 'test@company.com', 'active']
    );
    companyId = companyResult.insertId;

    // Create company admin user
    const bcryptModule = await import('bcryptjs');
    const bcrypt = bcryptModule.default;
    const hashedPassword = await bcrypt.hash('password123', 10);
    const [userResult] = await pool.query(
      `INSERT INTO users (email, password_hash, name, role, company_id)
       VALUES (?, ?, ?, ?, ?)`,
      ['admin@test.com', hashedPassword, 'Test Admin', 'companyadmin', companyId]
    );
    companyAdminUser = {
      id: userResult.insertId,
      email: 'admin@test.com',
      role: 'companyadmin',
      company_id: companyId
    };

    // Login to get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'password123' });
    authToken = loginRes.body.token;

    // Create order type
    const [orderTypeResult] = await pool.query(
      `INSERT INTO order_types (company_id, name, description, default_checklist)
       VALUES (?, ?, ?, ?)`,
      [companyId, 'Test Installation', 'Test description', JSON.stringify([])]
    );
    orderTypeId = orderTypeResult.insertId;
  });

  // Cleanup after all tests
  afterAll(async () => {
    // Delete in correct order (FK constraints)
    await pool.query('DELETE FROM activity_logs WHERE company_id = ?', [companyId]);
    await pool.query('DELETE FROM order_stages WHERE order_id IN (SELECT id FROM orders WHERE company_id = ?)', [companyId]);
    await pool.query('DELETE FROM orders WHERE company_id = ?', [companyId]);
    await pool.query('DELETE FROM order_types WHERE company_id = ?', [companyId]);
    await pool.query('DELETE FROM users WHERE company_id = ?', [companyId]);
    await pool.query('DELETE FROM companies WHERE id = ?', [companyId]);
    await pool.end();
  });

  // ==================== CREATE ORDER ====================
  describe('POST /api/orders - Create Order', () => {
    test('should create a new order', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          order_type_id: orderTypeId,
          client_name: 'John Doe',
          client_email: 'john@example.com',
          client_phone: '+421901234567',
          client_address: 'Bratislava, Slovakia',
          notes: 'Test order'
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Zákazka vytvorená.');
      expect(res.body.order).toHaveProperty('id');
      expect(res.body.order).toHaveProperty('order_number');
      expect(res.body.order.order_number).toMatch(/^ORD-\d{4}-\d{4}$/);

      orderId = res.body.order.id;
    });

    test('should fail without authentication', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          order_type_id: orderTypeId,
          client_name: 'John Doe'
        });

      expect(res.status).toBe(401);
    });

    test('should fail with missing required fields', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          client_name: 'John Doe'
          // Missing order_type_id
        });

      expect(res.status).toBe(400);
    });
  });

  // ==================== GET ORDER DETAIL ====================
  describe('GET /api/orders/:id - Get Order Detail', () => {
    test('should get order detail with activity_logs and stages', async () => {
      const res = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('order');
      expect(res.body).toHaveProperty('activity_logs');
      expect(res.body).toHaveProperty('stages');
      expect(Array.isArray(res.body.activity_logs)).toBe(true);
      expect(Array.isArray(res.body.stages)).toBe(true);
    });

    test('should fail for non-existent order', async () => {
      const res = await request(app)
        .get('/api/orders/999999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });

  // ==================== UPDATE ORDER ====================
  describe('PUT /api/orders/:id - Update Order', () => {
    test('should update order and generate quote_link', async () => {
      const res = await request(app)
        .put(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          total_price: 1000,
          scheduled_date: '2026-05-01'
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Zákazka aktualizovaná.');
      expect(res.body).toHaveProperty('quote_link');

      quoteLink = res.body.quote_link;
    });
  });

  // ==================== CREATE SURVEY STAGE ====================
  describe('POST /api/orders/:id/stage - Create Survey Stage', () => {
    test('should create survey stage', async () => {
      const res = await request(app)
        .post(`/api/orders/${orderId}/stage`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          stage: 'survey',
          checklist_data: { notes: 'Survey notes' },
          photos: [],
          signature_data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Etapa zákazky dokončená.');
      expect(res.body).toHaveProperty('stage_id');
    });
  });

  // ==================== CREATE QUOTE STAGE ====================
  describe('POST /api/orders/:id/stage - Create Quote Stage', () => {
    test('should create quote stage and generate quote_link', async () => {
      const res = await request(app)
        .post(`/api/orders/${orderId}/stage`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          stage: 'quote',
          checklist_data: {
            materials: [{ name: 'Material 1', price: 500 }],
            labor: [{ name: 'Labor 1', price: 300 }],
            total_price: 960,
            scheduled_date: '2026-05-01',
            notes: 'Quote notes'
          },
          signature_data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Etapa zákazky dokončená.');
      expect(res.body).toHaveProperty('quote_link');

      if (res.body.quote_link) {
        quoteLink = res.body.quote_link;
      }

      // Update order with price
      await request(app)
        .put(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ total_price: 960 });
    });
  });

  // ==================== PUBLIC QUOTE VIEW ====================
  describe('GET /api/orders/public/quote/:quoteLink - Public Quote View', () => {
    test('should get public quote without authentication', async () => {
      // Make sure we have a quote_link
      if (!quoteLink) {
        const [order] = await pool.query('SELECT quote_link FROM orders WHERE id = ?', [orderId]);
        quoteLink = order[0].quote_link;
      }

      const res = await request(app)
        .get(`/api/orders/public/quote/${quoteLink}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('order');
      expect(res.body).toHaveProperty('quote');
      expect(res.body.order.order_number).toBeDefined();
    });

    test('should fail with invalid quote_link', async () => {
      const res = await request(app)
        .get('/api/orders/public/quote/invalid-link-123');

      expect(res.status).toBe(404);
    });
  });

  // ==================== CLIENT SIGNATURE (⭐ MAIN TEST) ====================
  describe('POST /api/orders/public/quote/:quoteLink/sign - Client Signs Quote', () => {
    test('should sign quote and create activity log', async () => {
      // Make sure we have a quote_link
      if (!quoteLink) {
        const [order] = await pool.query('SELECT quote_link FROM orders WHERE id = ?', [orderId]);
        quoteLink = order[0].quote_link;
      }

      const res = await request(app)
        .post(`/api/orders/public/quote/${quoteLink}/sign`)
        .send({
          signature_data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Cenová ponuka bola podpísaná.');

      // ⭐ VERIFY ACTIVITY LOG WAS CREATED
      const [logs] = await pool.query(
        `SELECT * FROM activity_logs
         WHERE entity_type = 'order'
         AND entity_id = ?
         AND action = 'order.client_signature'`,
        [orderId]
      );

      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].action).toBe('order.client_signature');
      expect(logs[0].company_id).toBe(companyId);
      expect(logs[0].user_id).toBeNull(); // Client has no user_id

      const details = JSON.parse(logs[0].details);
      expect(details).toHaveProperty('signed_at');
      expect(details).toHaveProperty('order_number');

      // ⭐ VERIFY ORDER STATUS CHANGED
      const [orders] = await pool.query('SELECT status FROM orders WHERE id = ?', [orderId]);
      expect(orders[0].status).toBe('assigned');

      // ⭐ VERIFY SIGNATURE SAVED IN STAGE
      const [stages] = await pool.query(
        `SELECT client_signature_data, client_signed_at
         FROM order_stages
         WHERE order_id = ? AND stage = 'quote'`,
        [orderId]
      );
      expect(stages[0].client_signature_data).toBeDefined();
      expect(stages[0].client_signed_at).toBeDefined();
    });

    test('should fail without signature', async () => {
      const res = await request(app)
        .post(`/api/orders/public/quote/${quoteLink}/sign`)
        .send({});

      expect(res.status).toBe(400);
    });
  });

  // ==================== ACTIVITY LOGS IN ORDER DETAIL ====================
  describe('GET /api/orders/:id - Verify Activity Log Appears', () => {
    test('should include client signature in activity_logs', async () => {
      const res = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.activity_logs).toBeDefined();

      const clientSignatureLog = res.body.activity_logs.find(
        log => log.action === 'order.client_signature'
      );

      expect(clientSignatureLog).toBeDefined();
      expect(clientSignatureLog.user_name).toBe('Klient');
      expect(clientSignatureLog.details).toHaveProperty('signed_at');
    });
  });

  // ==================== LIST ORDERS ====================
  describe('GET /api/orders - List Orders', () => {
    test('should list all orders', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('orders');
      expect(Array.isArray(res.body.orders)).toBe(true);
      expect(res.body.orders.length).toBeGreaterThan(0);
    });

    test('should filter by status', async () => {
      const res = await request(app)
        .get('/api/orders?status=assigned')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.orders.every(o => o.status === 'assigned')).toBe(true);
    });
  });

  // ==================== DELETE ORDER ====================
  describe('DELETE /api/orders/:id - Delete Order', () => {
    test('should delete order', async () => {
      const res = await request(app)
        .delete(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Zákazka vymazaná.');

      // Verify deleted
      const checkRes = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(checkRes.status).toBe(404);
    });
  });
});
