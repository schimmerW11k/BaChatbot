import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Game} from '../models/games';
import {HeimspielEvent} from '../models/heimspielevents';
import {Analysis} from '../models/analysis';
import {Contest} from '../models/contest';
import {GameFormation} from '../models/gameformations';


@Injectable()
export class GettingDataService {

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
        private gameFormationRepository: Repository<GameFormation>,) {
    }



    async getGames(contestId: number): Promise<any> {
        const data = await this.gameRepository
            .createQueryBuilder('g')
            .innerJoin('g.homeTeam', 'ht')
            .innerJoin('g.awayTeam', 'at')
            .select([])
            .addSelect('g.id', 'GameID') //.addSelect('g.contest_id', 'contestId')
            .addSelect('ht.name', 'Heimteam')
            .addSelect('at.name', 'Auswärtsteam')
            .addSelect('g.score_home', 'homeScore')
            .addSelect('g.score_away', 'awayScore')
            .addSelect('g.spieltag', 'Spieltag')
            .addSelect('g.game_date', 'gameDate')
            .addSelect('g.venue', 'Stadion')
            .where('g.contest_id = :contestId', { contestId })
            .getRawMany();

        //this.writeCsvFile(data,"Games");
        //this.deleteCsvFile("Games");
        return data;
    }

    async getHeimspielEvents(contestId: number): Promise<any> {
        const data = await this.heimspielEventRepository
            .createQueryBuilder('he')
            .innerJoin('he.game', 'g')
            .select([])//.addSelect('he.id', 'eventId')
            .addSelect('he.game_id', 'GameID')
            .addSelect('he.team_type', 'TeamType')
            .addSelect('he.name', 'SpielerName')
            .addSelect('he.shirtnumber', 'shirtNumber')
            .addSelect('he.minute', 'Minute')
            .addSelect('he.action', 'Action')
            .addSelect('he.kind', 'Kind')
            .addSelect('he.rolename', 'roleName')
            .addSelect('he.shortrolename', 'shortRoleName')
            .where('g.contest_id = :contestId', { contestId })
            .getRawMany();

        //this.writeCsvFile(data,"SpielEvents");
        //this.deleteCsvFile("SpielEvents");
        return data;
    }

    async getAnalysisEvents(contestId: number): Promise<any> {
        const data = await this.analysisRepository
            .createQueryBuilder('a')
            .innerJoin('a.game', 'g')
            .innerJoin('a.analysisEvents', 'ae')
            .innerJoin('ae.label', 'ael')
            .select([]) //.addSelect('ae.id', 'analysisEventId').addSelect('a.id', 'analysisId')
            .addSelect('a.game_id', 'GameID')
            .addSelect('ae.start', 'eventStartInSekunden')
            .addSelect('ae.end', 'eventEndInSekunden') //.addSelect('ae.halbzeit', 'halfTime')
            .addSelect('ae.team', 'TeamType')
            .addSelect('ae.code', 'Code')
            .addSelect('ael.label', 'Label')
            .where('g.contest_id = :contestId', { contestId })
            .getRawMany();

        //this.writeCsvFile(data,"Analysis");
        //this.deleteCsvFile("Analysis");
        return data;
    }

    async getContest(contestId: number): Promise<any> {
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

        //this.writeCsvFile([data],"Contest");
        //this.deleteCsvFile("Contest");
        return data;
    }

    async getFormation(contestId: number): Promise<any> {
        const data = await this.gameFormationRepository
            .createQueryBuilder('gf')
            .innerJoin('gf.formation', 'f')
            .innerJoin('gf.game', 'g')
            .innerJoin('gf.gameFormationsPositions', 'gfp')
            .select([]) //.addSelect('gf.id', 'gameFormationId')
            .addSelect('gf.game_id', 'GameID')
            .addSelect('f.name', 'formationName')
            .addSelect('gf.team_type', 'TeamType')
            .addSelect('gf.formation_type', 'formationType')
            .addSelect('gfp.position', 'position')
            .addSelect('gfp.shirtnumber', 'shirtNumber')
            .where('g.contest_id = :contestId', { contestId })
            .getRawMany();

        //this.writeCsvFile(data,"FormationAndPositions");
        //this.deleteCsvFile("FormationAndPositions");
        return data;
    }



}
