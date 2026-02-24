import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DrizzleModule } from './database/drizzle.module';
import { MaterialsModule } from './modules/materials/materials.module';
import { QuestionsModule } from './modules/questions/questions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DrizzleModule,
    MaterialsModule,
    QuestionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
