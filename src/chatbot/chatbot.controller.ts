import { Controller, Get, Query } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Get()
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
}
