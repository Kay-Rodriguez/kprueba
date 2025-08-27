import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import type * as express from 'express';   // ✅ namespace, no named export

// 👇 Mock simple, sin usar vi.fn (evita problemas de hoisting)
vi.mock('../src/mail/mailer.js', () => ({
  sendVerification: async () => 'mock-message-id'
}));

import app from '../src/index.js';
import connection from '../src/config/database.js';
import Usuario from '../src/models/Usuario.js';
import { setupTestDB } from './setup.js';

let testDb: Awaited<ReturnType<typeof setupTestDB>>;
let api: ReturnType<typeof request>;

describe('Auth flow', () => {
  beforeAll(async () => {
    testDb = await setupTestDB();
    await connection();
    api = request(app as unknown as express.Application);
  });

  beforeEach(async () => {
    const collections = Object.values(mongoose.connection.collections);
    for (const c of collections) await c.deleteMany({});
  });

  afterAll(async () => {
    await testDb.teardown();
  });

  it('registra usuario nuevo y envía verificación', async () => {
    const res = await api
      .post('/api/auth/register')
      .send({
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@test.com',
        password: '1234567890',
      })
      .expect(201);

    expect(res.body.msg).toMatch(/Registrado/i);

    const u = await Usuario.findOne({ email: 'juan@test.com' });
    expect(u).toBeTruthy();
    expect(u!.verified).toBe(false);
    expect(u!.verificationToken).toBeTruthy();
  });

  it('confirma cuenta con token válido', async () => {
    const user = await Usuario.create({
      nombre: 'Ana',
      apellido: 'Gomez',
      email: 'ana@test.com',
      password: '1234567890',
      verified: false,
      verificationToken: 'token-de-prueba',
    });

    const res = await api.get(`/api/auth/confirm/${user.verificationToken}`).expect(200);
    expect(res.body.msg).toMatch(/verificada/i);

    const updated = await Usuario.findById(user.id);
    expect(updated!.verified).toBe(true);
    expect(updated!.verificationToken).toBeFalsy();
  });

  it('login falla si no confirmó el correo', async () => {
    await Usuario.create({
      nombre: 'NoConf',
      apellido: 'User',
      email: 'noconf@test.com',
      password: '1234567890',
      verified: false,
      verificationToken: 'abc',
    });

    const res = await api
      .post('/api/auth/login')
      .send({ email: 'noconf@test.com', password: '1234567890' })
      .expect(403);

    expect(res.body.msg).toMatch(/confirmar/i);
  });

  it('login OK tras confirmar', async () => {
    const user = await Usuario.create({
      nombre: 'OK',
      apellido: 'User',
      email: 'ok@test.com',
      password: '1234567890',
      verified: true,
    });

    const res = await api
      .post('/api/auth/login')
      .send({ email: 'ok@test.com', password: '1234567890' })
      .expect(200);

    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe(user.email);
  });

  it('registro rechaza clave no numérica o longitud != 10', async () => {
    const res = await api
      .post('/api/auth/register')
      .send({ nombre: 'X', apellido: 'Y', email: 'bad@test.com', password: 'abc' })
      .expect(400);

    expect(res.body.msg).toMatch(/10 dígitos/i);
  });
});
