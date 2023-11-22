import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatbotModule } from './chatbot/chatbot.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './models/games';
import { Team } from './models/teams';
import { HeimspielEvent } from './models/heimspielevents';
import { Analysis } from './models/analysis';
import { AnalysisEvent } from './models/analysisEvents';
import { AnalysisEventLabel } from './models/analysisEventLabel';
import { Contest } from './models/contest';
import { Season } from './models/seasons';
import { Federation } from './models/federation';
import { Country } from './models/countries';
import { Formation } from './models/formations';
import { GameFormation } from './models/gameformations';
import { GameFormationsPosition } from './models/gameFormationPosition';

@Module({
  imports: [
    ChatbotModule,
    TypeOrmModule.forRoot({
      type: 'mariadb',
      host: 'localhost',
      port: 3307,
      username: 'mysql',
      password: 'mysql',
      database: 'delivery',
      entities: [
        Game,
        Team,
        HeimspielEvent,
        Analysis,
        AnalysisEvent,
        AnalysisEventLabel,
        Contest,
        Season,
        Federation,
        Country,
        Formation,
        GameFormation,
        GameFormationsPosition,
      ],

      synchronize: false,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
