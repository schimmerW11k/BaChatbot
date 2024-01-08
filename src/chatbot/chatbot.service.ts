import {Injectable} from '@nestjs/common';
import * as Papa from 'papaparse';
import * as fs from 'fs';
import * as ExcelJS from 'exceljs';
import OpenAI from "openai";
import {GettingDataService} from "./gettingData.service";
import * as XLSX from 'xlsx';
import {MessageEntity} from "../models/message";


@Injectable()
export class ChatbotService {
    constructor(
        private getDataService: GettingDataService,
    ) {
    }

    private secretKey = process.env.OPENAI_API_KEY;
    private assistantID = process.env.ASSISTANT_ID;

    private openai = new OpenAI({
        apiKey: this.secretKey,
    });

    private thread = null;
    private run = null;
    //private run2: string = "run_jWXEtb9JBzrOgieGxmzlklie";

    private gamesFile: OpenAI.Files.FileObject;
    private gameEventsFile: OpenAI.Files.FileObject;
    private analysisFile: OpenAI.Files.FileObject;
    private formationFile: OpenAI.Files.FileObject;

    async activateChatbot(contestUuid: string): Promise<string> {
        const contestID = await this.getDataService.getContestID(contestUuid);
        const contestInfor = await this.getDataService.getContest(contestID);
        await this.createFilesforChatbot(contestID);
        console.log(contestID)
        console.log(contestInfor)
        await this.createFilesForOpenAI();


        //Contest Infors noch Variable eintragen
        this.thread = await this.openai.beta.threads.create({
            messages: [
                {
                    "role": "user",
                    "content": `Hier sind die CSV-Dateien für den Contest/Saison mit Folgenden Daten:  ContestName: ${contestInfor.ContestName}, Saison: ${contestInfor.Saison}, Verband: ${contestInfor.Verband}, Land: ${contestInfor.Land}, Dauer jeder Halbzeit: ${contestInfor.HalftimeDuration}, Nachspielzeitdauer: ${contestInfor.OvertimeDuration}. Lade dir einmal alle Dateien um die Datenstruktur genau zu kennen. Die Namen von Teams oder Spielern die der Benutzer in seine Frage hat müssen nicht zu 100% mit denen in den Daten übereinstimmen. Wenn du eine Benutzerfrage beantwortest und mehrere Nachrichten abgibst sollte die letzte immer die Antwort der Benutzerfrage beinhalten\n` +
                        "\n" +
                        "Eine CSV-Datei „Games“ beinhaltet dabei alle Spiele der Saison. Folgende Spalten hat die Tabelle: GameID, homeScore, awayScore, Spieltag, gameDate, Stadion, Heimteam, Auswärtsteam\n" +
                        "Die andere CSV-Datei „SpielEvents“ ist über die GameID mit der Games-Tabelle verbunden. Hier werden alle groben Events die im Spiel passiert sind aufgelistet. Der TeamType sagt ob es ein „home“ oder „away“ Team ist. SpielerName und shirtNumber zeigen wer das Event ausgeführt hat. „Action“ und „Kind“ beschreiben dann des Event. „Action“ ist meisten „playing“, „goal“ oder „card“. Was für ein Tor, Karte oder Spielaktion es genau ist zeigt das „Kind“ an. \n" +
                        "Die andere CSV-Datei „Analysis“: Hat eine genauere Analyse zu dem Spiel. Verbunden ist das wieder mit der GameID zu einem bestimmten Spiel. Der TeamType sagt ob es das „Home“ oder „Away“ Team ist. „Code“ Sagt aus was passiert ist z.B. Ecke oder Spielaufbau und „Label“ beschreibt es genauer. \n" +
                        "Die andere CSV-Datei „FormationAndPosition“: Auch über die GameID mit einem Spielverbunden hat die Aufstellungen für die Teams wieder über den TeamType aber dazu auch die Position der Spieler mit der ShirtNumber diese kannst du zu den Spielern mit dem passenden Game und TeamType aus der SpielEvents-Tabelle verbinden.",
                    "file_ids": [this.gamesFile.id, this.gameEventsFile.id, this.analysisFile.id, this.formationFile.id],
                }
            ],
        });

        console.log("chatbot activated");
        return `Chatbot aktiviert ${contestID}`;
    }


    async processMessage(message: MessageEntity): Promise<MessageEntity | string> {

        this.openai.beta.threads.messages.create(this.thread.id, {
            role: "user",
            content: message.text,
        });

        this.run = await this.openai.beta.threads.runs.create(this.thread.id, {
            assistant_id: this.assistantID,
        });

        let runStatus = await this.openai.beta.threads.runs.retrieve(
            this.thread.id,
            this.run.id
        );


        //waiting for response of the AI
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

        // Get all messages in the thread
        const chatbotMessages = await this.openai.beta.threads.messages.list(this.thread.id);
        // Find the  messages for the current run of the assistant and get the first one out
        const lastMessageForRun: any = chatbotMessages.data
            .filter(
                (message) => message.run_id === this.run.id && message.role === "assistant"
            )
            .shift()
        let chatbotResponse: any;
        chatbotResponse = lastMessageForRun.content[0].text.value;
        console.log(`${lastMessageForRun.content[0].text.value} \n`);

        return {
            text: chatbotResponse,
            sender: "assistant",
            reply: false,
            date: new Date(),
        };

    }


    async closeChatbot(): Promise<string> {
        if (this.thread != null) {
            const response = await this.openai.beta.threads.del(this.thread.id);
            this.thread = null;
            console.log(response);
        }

        await this.deleteFiles();
        await this.deleteFilesOfOpenAI();

        return `Chatbot geschlossen`;
    }


    //Handle Files for OpenAI
    async deleteFilesOfOpenAI() {
        await this.openai.files.del(this.gamesFile.id)
        await this.openai.files.del(this.gameEventsFile.id)
        await this.openai.files.del(this.analysisFile.id)
        await this.openai.files.del(this.formationFile.id)
    }

    async createFilesForOpenAI() {
        this.gamesFile = await this.openai.files.create({
            file: fs.createReadStream("src/csv-files/Games.csv"),
            purpose: "assistants",
        });
        this.gameEventsFile = await this.openai.files.create({
            file: fs.createReadStream("src/csv-files/SpielEvents.csv"),
            purpose: "assistants",
        });
        this.analysisFile = await this.openai.files.create({
            file: fs.createReadStream("src/csv-files/Analysis.csv"),
            purpose: "assistants",
        });
        this.formationFile = await this.openai.files.create({
            file: fs.createReadStream("src/csv-files/FormationAndPositions.csv"),
            purpose: "assistants",
        });

    }




    //Handle Files on System
    async createFilesforChatbot(contestID: number) {
        const gamesData = await this.getDataService.getGames(contestID);
        const heimspielData = await this.getDataService.getHeimspielEvents(contestID);
        const analysisData = await this.getDataService.getAnalysisEvents(contestID);
        const formationAndPositionsData = await this.getDataService.getFormation(contestID);

        await this.writeCsvFile(gamesData, "Games");
        await this.writeCsvFile(heimspielData, "SpielEvents");
        await this.writeCsvFile(analysisData, "Analysis");
        await this.writeCsvFile(formationAndPositionsData, "FormationAndPositions");
    }


    async deleteFiles() {
        const filenames = ["Games", "SpielEvents", "Analysis", "FormationAndPositions"];
        for (let i = 0; i < filenames.length; i++) {
            await this.deleteCsvFile((filenames)[i]);
        }
        // this.deleteExcelFile();
    }



    async writeCsvFile(data: any, filename: string) {
        try {
            const csv = Papa.unparse(data);
            fs.writeFileSync(`src/csv-files/${filename}.csv`, csv);
            console.log(`Die Datei ${filename} wurde erfolgreich erstellt.`);
        } catch (err) {
            console.error(`Fehler beim erstellen der Datei ${filename}:`, err);
        }
    }

    async deleteCsvFile(filename: string) {
        try {
            fs.unlinkSync(`src/csv-files/${filename}.csv`);
            console.log(`Die Datei ${filename} wurde erfolgreich gelöscht.`);
        } catch (err) {
            console.error(`Fehler beim Löschen der Datei ${filename}:`, err);
        }
    }


    //Only for dev, get the full thread
    async MessagesInThread(): Promise<any> {
        const messages = await this.openai.beta.threads.messages.list(this.thread.id);
        const chatbotMessages = await this.openai.beta.threads.messages.list(this.thread.id);
        const lastMessageForRun: any = chatbotMessages.data
            .filter(
                (message) => message.run_id === this.run.id && message.role === "assistant"
            )
            .shift();

        let chatbotResponse;
        if (lastMessageForRun) {
            chatbotResponse = lastMessageForRun.content[0].text.value;
            console.log(`${lastMessageForRun.content[0].text.value} \n`);
        }

        return messages;
    }


    //Tests for Excel-Files instead of CSV-Files
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
