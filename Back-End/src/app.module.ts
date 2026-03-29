import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DrizzleModule } from './database/drizzle.module';
import { MaterialsModule } from './modules/materials/materials.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { QuizzesModule } from './modules/quizzes/quizzes.module';
import { StreaksModule } from './modules/streaks/streaks.module';
import { StatsModule } from './modules/stats/stats.module';
import { ImagesModule } from './modules/images/images.module';
import { ClerkAuthGuard } from './common/guards/clerk-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 5 * 60 * 1000, // 5 minutes in ms
    }),
    ScheduleModule.forRoot(),
    DrizzleModule,
    UsersModule,
    AuthModule,
    MaterialsModule,
    QuestionsModule,
    QuizzesModule,
    StreaksModule,
    StatsModule,
    ImagesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global auth: runs on every route; respects @IsPublic() to opt out
    { provide: APP_GUARD, useClass: ClerkAuthGuard },
    // Global role enforcement: runs after ClerkAuthGuard (request.user is set)
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule { }
