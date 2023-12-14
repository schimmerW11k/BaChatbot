import {Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { MessageEntity } from "../models/message";
import {GettingDataService} from "./gettingData.service";

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService,
              private readonly getDataService: GettingDataService,
  ) {}


  //Endpoints for chatbot-logic
  @Get('activate/:contestID')
  activateChatbot(@Param('contestID') contestUuid: string): Promise<string> {
    return  this.chatbotService.activateChatbot(contestUuid);
  }

  @Post('/message')
  @HttpCode(HttpStatus.OK)
  sendMessage(@Body() message: MessageEntity): Promise<MessageEntity | string> {
    return this.chatbotService.processMessage(message);
  }

  @Get('/close')
  closeChatbot(): Promise<string> {
    return this.chatbotService.closeChatbot();
  }




  //Dev Endpoints for Chatbot
  @Get('thread')
  getMessagesInThread(): Promise<any> {
    return this.chatbotService.MessagesInThread();
  }

  @Post('message2')
  @HttpCode(HttpStatus.OK)
  sendMessage2(@Body() message: MessageEntity) {
    return message;
  }


  //Data Endpoints only for Development
  @Get('games')
  askChatbot(): Promise<any> {
    return this.getDataService.getGames(236);
  }

  @Get('heimspiel')
  heimspiel(): Promise<any> {
    return this.getDataService.getHeimspielEvents(236);
  }

  @Get('analysis')
  analysis(): Promise<any> {
    return this.getDataService.getAnalysisEvents(236);
  }

  @Get('contest')
  contest(): Promise<any> {
    return this.getDataService.getContest(236);
  }

  @Get('formation')
  formation(): Promise<any> {
    return this.getDataService.getFormation(236);
  }



  //Files Endpoints. Only for Development
  @Post("csv")
  createCSV() {
    return this.chatbotService.createFilesforChatbot(236);
  }

  @Post("excel")
  createExcel() {
    return this.chatbotService.createExcelFile();
  }
  @Delete("deleteFiles")
    deleteExcel() {
        return this.chatbotService.deleteFiles();
  }
}
