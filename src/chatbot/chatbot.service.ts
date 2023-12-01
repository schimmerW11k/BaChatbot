import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from '../models/games';
import { HeimspielEvent } from '../models/heimspielevents';
import { Analysis } from '../models/analysis';
import { Contest } from '../models/contest';
import { GameFormation } from '../models/gameformations';
import * as Papa from 'papaparse';
import * as fs from 'fs';
import * as ExcelJS from 'exceljs';
import OpenAI from "openai";
import {GettingDataService} from "./gettingData.service";
import {testData} from "./test";
import * as XLSX from 'xlsx';



@Injectable()
export class ChatbotService {


  constructor(
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
    @InjectRepository(HeimspielEvent)
    private heimspielEventRepository: Repository<HeimspielEvent>,
    @InjectRepository(Analysis)
    private analysisRepository: Repository<Analysis>,
    @InjectRepository(Contest)
    private contestRepository: Repository<Contest>,
    @InjectRepository(GameFormation)
    private gameFormationRepository: Repository<GameFormation>,
    private getDataService: GettingDataService,
  ) {

  }

  private secretKey = process.env.OPENAI_API_KEY;
  private openai = new OpenAI({
    apiKey: this.secretKey,
  });
  private thread = null;
  private run = null;
    private run2: string = "run_jWXEtb9JBzrOgieGxmzlklie";
  private file1;
  //private file2;
  private file3;
  private file4;
  private file5;

  assistantID = 'asst_aHGk5jqfUHrbej99Z0lYV5tn';

  async activateChatbot(contestID: number): Promise<string> {
    await this.createFilesforChatbot(contestID);

    this.file1 = await this.openai.files.create({
      file: fs.createReadStream("src/csv-files/FormationAndPositions.csv"),
      purpose: "assistants",
    });
    /*this.file2 = await  this.openai.files.create({
      file: fs.createReadStream("src/csv-files/Contest.csv"),
      purpose: "assistants",
    });*/
    this.file3 = await this.openai.files.create({
      file: fs.createReadStream("src/csv-files/Games.csv"),
      purpose: "assistants",
    });
    this.file4 = await this.openai.files.create({
      file: fs.createReadStream("src/csv-files/Analysis.csv"),
      purpose: "assistants",
    });
    this.file5 = await this.openai.files.create({
      file: fs.createReadStream("src/csv-files/SpielEvents.csv"),
      purpose: "assistants",
    });

    this.thread = await this.openai.beta.threads.create({
      messages: [
        {
          "role": "user",
          "content": "Hier sind die CSV-Dateien für den Contest/Saison mit Folgenden Daten:  ContestName: 3.Liga, Saison: 21-22, Verband: Deutscher Fußball-Bund, Land: DE, Dauer jeder Halbzeit: 45, Nachspielzeitdauer: 15. Lade dir einmal alle Dateien um die Datenstruktur genau zu kennen. Die Namen von Teams oder Spielern die der Benutzer in seine Frage hat müssen nicht zu 100% mit denen in den Daten übereinstimmen. Wenn du eine Benutzerfrage beantwortest und mehrere Nachrichten abgibst sollte die letzte immer die Antwort der Benutzerfrage beinhalten\n" +
              "\n" +
              "Eine CSV-Datei „Games“ beinhaltet dabei alle Spiele der Saison. Folgende Spalten hat die Tabelle: GameID, homeScore, awayScore, Spieltag, gameDate, Stadion, Heimteam, Auswärtsteam\n" +
              "Die andere CSV-Datei „SpielEvents“ ist über die GameID mit der Games-Tabelle verbunden. Hier werden alle groben Events die im Spiel passiert sind aufgelistet. Der TeamType sagt ob es ein „home“ oder „away“ Team ist. SpielerName und shirtNumber zeigen wer das Event ausgeführt hat. „Action“ und „Kind“ beschreiben dann des Event. „Action“ ist meisten „playing“, „goal“ oder „card“. Was für ein Tor, Karte oder Spielaktion es genau ist zeigt das „Kind“ an. \n" +
              "Die andere CSV-Datei „Analysis“: Hat eine genauere Analyse zu dem Spiel. Verbunden ist das wieder mit der GameID zu einem bestimmten Spiel. Der TeamType sagt ob es das „Home“ oder „Away“ Team ist. „Code“ Sagt aus was passiert ist z.B. Ecke oder Spielaufbau und „Label“ beschreibt es genauer. \n" +
              "Die andere CSV-Datei „FormationAndPosition“: Auch über die GameID mit einem Spielverbunden hat die Aufstellungen für die Teams wieder über den TeamType aber dazu auch die Position der Spieler mit der ShirtNumber diese kannst du zu den Spielern mit dem passenden Game und TeamType aus der SpielEvents-Tabelle verbinden.",
          "file_ids": [this.file3.id, /*this.file2.id,*/ this.file1.id, this.file4.id, this.file5.id],
        }
      ],
    });


    return `Chatbot aktiviert ${contestID}`;
  }


 async processMessage(message: string) {

   this.openai.beta.threads.messages.create(this.thread.id, {
     role: "user",
     content: message,
   });

   // Use runs to wait for the assistant response and then retrieve it
    this.run = await this.openai.beta.threads.runs.create(this.thread.id, {
     assistant_id: this.assistantID,
   });

   let runStatus = await this.openai.beta.threads.runs.retrieve(
       this.thread.id,
       this.run.id
   );

   // Polling mechanism to see if runStatus is completed
   // This should be made more robust.
   while (runStatus.status !== "completed") {
     console.log(`Run status is '${runStatus.status}'.`);
     await new Promise((resolve) => setTimeout(resolve, 2000));
     runStatus = await this.openai.beta.threads.runs.retrieve(
         this.thread.id,
         this.run.id
     );

     if (["failed", "cancelled", "expired"].includes(runStatus.status)) {
       console.log(`Request: ${runStatus.status}`);
       return `Request: ${runStatus.status}`;
       break;
     }

   }

   // Get the last assistant message from the messages array
   const chatbotMessages = await this.openai.beta.threads.messages.list(this.thread.id);

   // Find the last message for the current run
   const lastMessageForRun: any = chatbotMessages.data
       .filter(
           (message) => message.run_id === this.run.id && message.role === "assistant"
       )
       .shift() /*.pop();*/

   let chatbotResponse;
   // If an assistant message is found, console.log() it
   if (lastMessageForRun) {
     chatbotResponse = lastMessageForRun.content[0].text.value;
     console.log(`${lastMessageForRun.content[0].text.value} \n`);
   }


   return `Chatbot Antwort: ${chatbotResponse}`;
  }




  async closeChatbot(): Promise<string> {
    const response = await this.openai.beta.threads.del(this.thread.id);
    this.thread = null;
    await this.deleteFiles();
    console.log(response);
    const del = await this.openai.files.del(this.file1.id)
   // const del2 = await this.openai.files.del(this.file2.id)
    const del3 = await this.openai.files.del(this.file3.id)
    const del4 = await this.openai.files.del(this.file4.id)
    const del5 = await this.openai.files.del(this.file5.id)
    return `Chatbot geschlossen`;
  }


  async MessagesInThread(): Promise<any> {
/*

    const messages = testData;

    const lastMessageForRun: any = testData.messages.data
        .filter(
            (message) => message.run_id === this.run2 && message.role === "assistant"
        )
        .shift();

    console.log(testData.messages.data[0].content[0].text.value);

    return  lastMessageForRun;

*/

    const messages = await this.openai.beta.threads.messages.list(this.thread.id);
    const chatbotMessages = await this.openai.beta.threads.messages.list(this.thread.id);

    // Find the last message for the current run
    const lastMessageForRun: any = chatbotMessages.data
        .filter(
            (message) => message.run_id === this.run.id && message.role === "assistant"
        )
        .shift();

    let chatbotResponse;
    // If an assistant message is found, console.log() it
    if (lastMessageForRun) {
      chatbotResponse = lastMessageForRun.content[0].text.value;
      console.log(`${lastMessageForRun.content[0].text.value} \n`);
    }



    return messages;
  }




  //Handle Files
  async deleteFiles() {
    this.deleteCsvFile("Games");
    this.deleteCsvFile("SpielEvents");
    this.deleteCsvFile("Analysis");
   // this.deleteCsvFile("Contest");
    this.deleteCsvFile("FormationAndPositions");
   // this.deleteExcelFile();
  }

  csvFiles: string[] = ["Games", "SpielEvents", "Analysis", "Contest", "FormationAndPositions"];

  async createFilesforChatbot(contestID: number) {

 /*   const tasks = [
      { func: async () => await this.getDataService.getGames(contestID), filename: this.csvFiles[0] },
      { func: async () => await this.getDataService.getHeimspielEvents(contestID), filename: this.csvFiles[1] },
      { func: async () => await this.getDataService.getAnalysisEvents(contestID), filename: this.csvFiles[2] },
      { func: async () => await this.getDataService.getContest(contestID), filename: this.csvFiles[3] },
      { func: async() => await this.getDataService.getFormation(contestID), filename: this.csvFiles[4] }
    ];


    for (const task of tasks) {
      const data = await task.func();
      this.writeCsvFile(data, task.filename);
    }
*/


    const gamesData = await this.getDataService.getGames(contestID);
    const heimspielData = await this.getDataService.getHeimspielEvents(contestID);
    const analysisData = await this.getDataService.getAnalysisEvents(contestID);
    //const contestData = await this.getDataService.getContest(contestID);
    const formationAndPositionsData = await this.getDataService.getFormation(contestID);

    this.writeCsvFile(gamesData, "Games");
    this.writeCsvFile(heimspielData, "SpielEvents");
    this.writeCsvFile(analysisData, "Analysis");
   // this.writeCsvFile([contestData], "Contest");
    this.writeCsvFile(formationAndPositionsData, "FormationAndPositions");

  }


  writeCsvFile(data: any, filename: string) {
    try {
      const csv = Papa.unparse(data);
      fs.writeFileSync(`src/csv-files/${filename}.csv`, csv);
      console.log(`Die Datei ${filename} wurde erfolgreich erstellt.`);
    } catch (err) {
      console.error(`Fehler beim erstellen der Datei ${filename}:`, err);
    }
  }

  deleteCsvFile(filename: string) {
    try {
      fs.unlinkSync(`src/csv-files/${filename}.csv`);
      console.log(`Die Datei ${filename} wurde erfolgreich gelöscht.`);
    } catch (err) {
      console.error(`Fehler beim Löschen der Datei ${filename}:`, err);
    }
  }


  async createExcelFile() {
    const workbook = XLSX.utils.book_new();

    const analysisData = await this.getDataService.getAnalysisEvents(236);
    const formationData = await this.getDataService.getFormation(236);
    const gameData = await this.getDataService.getGames(236);
    const heimspielData = await this.getDataService.getHeimspielEvents(236);

    this.addWorksheet(workbook, analysisData, 'Analysis');
    this.addWorksheet(workbook, formationData, 'Formation');
    this.addWorksheet(workbook, gameData, 'Game');
    this.addWorksheet(workbook, heimspielData, 'Heimspiel');

    XLSX.writeFile(workbook, 'src/csv-files/Fussballdatentabellen.xlsx');
    console.log('Excel-Datei mit mehreren Tabellen erstellt');
    return 'Excel-Datei mit mehreren Tabellen erstellt';
  }


  addWorksheet(workbook, data, sheetName) {
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  }


    async createExcelFile1(): Promise<string> {
      const workbook = new ExcelJS.Workbook();

      //const contestData = await this.getDataService.getContest(236);
      const analysisData = await this.getDataService.getAnalysisEvents(236);
      const formationData = await this.getDataService.getFormation(236);
      const gameData = await this.getDataService.getGames(236);
      const heimspielData = await this.getDataService.getHeimspielEvents(236);

      //this.addWorksheet(workbook, [contestData], 'Contest');
      this.addWorksheet(workbook, analysisData, 'Analysis');
      this.addWorksheet(workbook, formationData, 'Formation');
      this.addWorksheet(workbook, gameData, 'Game');

      this.addWorksheet(workbook, heimspielData, 'Heimspiel');


      await workbook.xlsx.writeFile('src/csv-files/Fussballdatentabellen.xlsx');

      console.log('Excel-Datei mit mehreren Tabellen erstellt');
      return 'Excel-Datei mit mehreren Tabellen erstellt';

  }

  addWorksheet1(workbook: ExcelJS.Workbook, data: any, sheetName: string) {
    const sheet = workbook.addWorksheet(sheetName);

    if (data.length > 0) {
      sheet.columns = Object.keys(data[0]).map(key => ({
        header: key, key: key, width: 20
      }));
    }

    // Daten hinzufügen
    data.forEach(row => sheet.addRow(row));

  }

  deleteExcelFile() {
    try {
      fs.unlinkSync(`src/csv-files/Fussballdatentabellen.xlsx`);
      console.log(`Die Datei wurde erfolgreich gelöscht.`);
    } catch (err) {
      console.error(`Fehler beim Löschen der Datei:`, err);
    }
  }


}
