import {Module} from '@nestjs/common';
import {ChatbotService} from './chatbot.service';
import {ChatbotController} from './chatbot.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import { Game } from '../models/games';
import { Team } from '../models/teams';
import { HeimspielEvent } from "../models/heimspielevents";
import { Analysis } from "../models/analysis";
import { AnalysisEvent } from 'src/models/analysisEvents';
import {AnalysisEventLabel} from "../models/analysisEventLabel";
import {Contest} from "../models/contest";
import {Season} from "../models/seasons";
import {Federation} from "../models/federation";
import {Country} from "../models/countries";
import {Formation} from "../models/formations";
import {GameFormation} from "../models/gameformations";
import {GameFormationsPosition} from "../models/gameFormationPosition";
import {GettingDataService} from "./gettingData.service";

@Module({
  imports: [TypeOrmModule.forFeature([Game, Team, HeimspielEvent, Analysis,
    AnalysisEvent, AnalysisEventLabel, Contest, Season, Federation, Country, Formation, GameFormation, GameFormationsPosition])],
  controllers: [ChatbotController],
  providers: [ChatbotService, GettingDataService],
})
export class ChatbotModule {
}
