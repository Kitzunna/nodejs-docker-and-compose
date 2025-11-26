import supertest from 'supertest';
import type { Server } from 'http';
import { Test as NestTest, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let http: ReturnType<typeof supertest>;
  let server: Server;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await NestTest.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    server = app.getHttpServer() as unknown as Server;
    http = supertest(server);
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', async () => {
    await http.get('/').expect(200);
  });
});
