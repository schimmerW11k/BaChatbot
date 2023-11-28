import {Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query} from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import {CreateMessage} from "../models/message";
import {GettingDataService} from "./gettingData.service";

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService,
              private readonly getDataService: GettingDataService,
  ) {}


  @Get('activate/:contestID')
  activateChatobt(@Param('contestID') contestID: number): Promise<string> {
    return  this.chatbotService.activateChatbot(contestID);
  }

  @Post('/message')
  @HttpCode(HttpStatus.OK)
  sendMessage(@Body() message: CreateMessage) {
    return this.chatbotService.processMessage(message.message);
  }

  @Get('/close')
  closeChatbot(): Promise<string> {
    return this.chatbotService.closeChatbot();
  }




  //test Endpoints for chatbot
  @Get('thread')
  getMessagesInThread(): Promise<any> {
    return this.chatbotService.MessagesInThread();
  }

  //Handle Data Endpoints only for Development
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



  //Handle Files Endpoints. Only for Development
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
