import {Controller, Delete, Get, Post, Query} from '@nestjs/common';
import { ChatbotService } from './chatbot.service';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Get('games')
  askChatbot(): Promise<any> {
    return this.chatbotService.GamesInContest(236);
  }

  @Get('heimspiel')
  heimspiel(): Promise<any> {
    return this.chatbotService.heimspiel(236);
  }

  @Get('analysis')
  analysis(): Promise<any> {
    return this.chatbotService.findAnalysisByContestId(236);
  }

  @Get('contest')
  contest(): Promise<any> {
    return this.chatbotService.findContest(236);
  }

  @Get('formation')
  formation(): Promise<any> {
    return this.chatbotService.findFormation(236);
  }

  @Post("excel")
  createExcel() {
    return this.chatbotService.createExcelFile();
  }
  @Delete("excel")
    deleteExcel() {
        return this.chatbotService.deleteExcelFile();
  }
}
