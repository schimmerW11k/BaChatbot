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
  ) {}

  async GamesInContest(contestId: number): Promise<any> {
    const data = await this.gameRepository
      .createQueryBuilder('g')
      .innerJoin('g.homeTeam', 'ht')
      .innerJoin('g.awayTeam', 'at')
      .select([])
      .addSelect('g.id', 'gameId') //.addSelect('g.contest_id', 'contestId')
      .addSelect('ht.name', 'Heimteam')
      .addSelect('at.name', 'Auswärtsteam')
      .addSelect('g.score_home', 'homeScore')
      .addSelect('g.score_away', 'awayScore')
      .addSelect('g.spieltag', 'Spieltag')
      .addSelect('g.game_date', 'gameDate')
      .addSelect('g.venue', 'Stadion')
      .where('g.contest_id = :contestId', { contestId })
      .getRawMany();

/*
    this.writeCsvFile(data,"Games");
*/
    //this.deleteCsvFile("Games");
    return data;
  }

  async heimspiel(contestId: number): Promise<any> {
    const data = await this.heimspielEventRepository
      .createQueryBuilder('he')
      .innerJoin('he.game', 'g')
      .select([])
      .addSelect('he.id', 'eventId')
      .addSelect('he.game_id', 'gameId')
      .addSelect('he.team_type', 'teamType')
      .addSelect('he.name', 'SpielerName')
      .addSelect('he.shirtnumber', 'shirtNumber')
      .addSelect('he.minute', 'Minute')
      .addSelect('he.action', 'Action')
      .addSelect('he.kind', 'Kind')
      .addSelect('he.rolename', 'roleName')
      .addSelect('he.shortrolename', 'shortRoleName')
      .where('g.contest_id = :contestId', { contestId })
      .getRawMany();

/*
    this.writeCsvFile(data,"SpielEvents");
*/
    //this.deleteCsvFile("SpielEvents");
    return data;
  }

  async findAnalysisByContestId(contestId: number): Promise<any> {
    const data = await this.analysisRepository
      .createQueryBuilder('a')
      .innerJoin('a.game', 'g')
      .innerJoin('a.analysisEvents', 'ae')
      .innerJoin('ae.label', 'ael')
      .select([]) //.addSelect('ae.id', 'analysisEventId').addSelect('a.id', 'analysisId')
      .addSelect('a.game_id', 'gameId')
      .addSelect('ae.start', 'eventStartInSekunden')
      .addSelect('ae.end', 'eventEndInSekunden') //.addSelect('ae.halbzeit', 'halfTime')
      .addSelect('ae.team', 'team_type')
      .addSelect('ae.code', 'Code')
      .addSelect('ael.label', 'Label')
      .where('g.contest_id = :contestId', { contestId })
      .getRawMany();

/*
    this.writeCsvFile(data,"Analysis");
*/
    //this.deleteCsvFile("Analysis");
    return data;
  }

  async findContest(contestId: number): Promise<any> {
    const data = await this.contestRepository
      .createQueryBuilder('c')
      .innerJoin('c.season', 's')
      .innerJoin('c.federation', 'f')
      .innerJoin('f.country', 'c2') //.addSelect('c.id', 'Contest_ID')
      .select([])
      .addSelect('f.name', 'Verband')
      .addSelect('c2.name', 'Land') //.addSelect('s.id', 'season_id')
      .addSelect('s.name', 'Saison')
      .addSelect('c.halftime_duration', 'HalftimeDuration')
      .addSelect('c.overtime_duration', 'OvertimeDuration')
      .addSelect('c.name', 'ContestName')
      .where('c.id = :contestId', { contestId })
      .getRawOne();

/*    this.writeCsvFile([data],"Contest");*/
    //this.deleteCsvFile("Contest");
    return data;
  }

  async findFormation(contestId: number): Promise<any> {
    const data = await this.gameFormationRepository
      .createQueryBuilder('gf')
      .innerJoin('gf.formation', 'f')
      .innerJoin('gf.game', 'g')
      .innerJoin('gf.gameFormationsPositions', 'gfp')
      .select([]) //.addSelect('gf.id', 'gameFormationId')
      .addSelect('gf.game_id', 'gameId')
      .addSelect('f.name', 'formationName')
      .addSelect('gf.team_type', 'teamType')
      .addSelect('gf.formation_type', 'formationType')
      .addSelect('gfp.position', 'position')
      .addSelect('gfp.shirtnumber', 'shirtNumber')
      .where('g.contest_id = :contestId', { contestId })
      .getRawMany();

/*
    this.writeCsvFile(data,"FormationAndPositions");
*/
    //this.deleteCsvFile("FormationAndPositions");
    return data;
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


    async createExcelFile(): Promise<string> {
      const workbook = new ExcelJS.Workbook();

      const contestData = await this.findContest(236);
      const analysisData = await this.findAnalysisByContestId(236);
      const formationData = await this.findFormation(236);
      const gameData = await this.GamesInContest(236);
      const heimspielData = await this.heimspiel(236);

      this.addWorksheet(workbook, [contestData], 'Contest');
      this.addWorksheet(workbook, analysisData, 'Analysis');
      this.addWorksheet(workbook, formationData, 'Formation');
      this.addWorksheet(workbook, gameData, 'Game');
      this.addWorksheet(workbook, heimspielData, 'Heimspiel');

      await workbook.xlsx.writeFile('src/csv-files/Fußballdatentabellen.xlsx');
      console.log('Excel-Datei mit mehreren Tabellen erstellt');
      return 'Excel-Datei mit mehreren Tabellen erstellt';

  }

  addWorksheet(workbook: ExcelJS.Workbook, data: any, sheetName: string) {
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
      fs.unlinkSync(`src/csv-files/Fußballdatentabellen.xlsx`);
      console.log(`Die Datei wurde erfolgreich gelöscht.`);
    } catch (err) {
      console.error(`Fehler beim Löschen der Datei:`, err);
    }
  }


}
