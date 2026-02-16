import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';
import { type Schema, schema } from './schema';

export type DRIZZLE_PROVIDER = NodePgDatabase<Schema>;

@Injectable()
export class DrizzleService implements OnModuleDestroy {
  public db: DRIZZLE_PROVIDER;
  private pool: Pool;

  constructor(private configService: ConfigService) {
    const connectionString = this.configService.get<string>('DATABASE_URL');

    this.pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
    });

    this.pool.on('error', (err) => {
      console.error('Unexpected database error', err);
    });

    this.db = drizzle(this.pool, { schema }) as DRIZZLE_PROVIDER;
  }

  async onModuleDestroy() {
    await this.pool.end();
    console.log('Database pool closed');
  }
}
