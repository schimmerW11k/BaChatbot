import { Controller, Get, Query } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Get('ask')
  askChatbot(@Query('message') message: string): string {
    return this.chatbotService.getResponse(message);
  }
}
