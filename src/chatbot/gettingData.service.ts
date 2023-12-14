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
        return await this.gameRepository
            .createQueryBuilder('g')
            .innerJoin('g.homeTeam', 'ht')
            .innerJoin('g.awayTeam', 'at')
            .select([])
            .addSelect('g.id', 'GameID')
            .addSelect('ht.name', 'Heimteam')
            .addSelect('at.name', 'Auswärtsteam')
            .addSelect('g.score_home', 'homeScore')
            .addSelect('g.score_away', 'awayScore')
            .addSelect('g.spieltag', 'Spieltag')
            .addSelect('g.game_date', 'gameDate')
            .addSelect('g.venue', 'Stadion')
            .where('g.contest_id = :contestId', {contestId})
            .getRawMany();
    }

    async getHeimspielEvents(contestId: number): Promise<any> {
        return await this.heimspielEventRepository
            .createQueryBuilder('he')
            .innerJoin('he.game', 'g')
            .select([])
            .addSelect('he.game_id', 'GameID')
            .addSelect('he.team_type', 'TeamType')
            .addSelect('he.name', 'SpielerName')
            .addSelect('he.shirtnumber', 'shirtNumber')
            .addSelect('he.minute', 'Minute')
            .addSelect('he.action', 'Action')
            .addSelect('he.kind', 'Kind')
            .addSelect('he.rolename', 'roleName')
            .addSelect('he.shortrolename', 'shortRoleName')
            .where('g.contest_id = :contestId', {contestId})
            .getRawMany();
    }

    async getAnalysisEvents(contestId: number): Promise<any> {
        return await this.analysisRepository
            .createQueryBuilder('a')
            .innerJoin('a.game', 'g')
            .innerJoin('a.analysisEvents', 'ae')
            .innerJoin('ae.label', 'ael')
            .select([])
            .addSelect('a.game_id', 'GameID')
            .addSelect('ae.start', 'eventStartInSekunden')
            .addSelect('ae.end', 'eventEndInSekunden')
            .addSelect('ae.team', 'TeamType')
            .addSelect('ae.code', 'Code')
            .addSelect('ael.label', 'Label')
            .where('g.contest_id = :contestId', {contestId})
            .getRawMany();
    }

    async getContest(contestId: number): Promise<any> {
        return await this.contestRepository
            .createQueryBuilder('c')
            .innerJoin('c.season', 's')
            .innerJoin('c.federation', 'f')
            .innerJoin('f.country', 'c2')
            .select([])
            .addSelect('f.name', 'Verband')
            .addSelect('c2.name', 'Land')
            .addSelect('s.name', 'Saison')
            .addSelect('c.halftime_duration', 'HalftimeDuration')
            .addSelect('c.overtime_duration', 'OvertimeDuration')
            .addSelect('c.name', 'ContestName')
            .where('c.id = :contestId', {contestId})
            .getRawOne();
    }

    async getFormation(contestId: number): Promise<any> {
        return await this.gameFormationRepository
            .createQueryBuilder('gf')
            .innerJoin('gf.formation', 'f')
            .innerJoin('gf.game', 'g')
            .innerJoin('gf.gameFormationsPositions', 'gfp')
            .select([])
            .addSelect('gf.game_id', 'GameID')
            .addSelect('f.name', 'formationName')
            .addSelect('gf.team_type', 'TeamType')
            .addSelect('gf.formation_type', 'formationType')
            .addSelect('gfp.position', 'position')
            .addSelect('gfp.shirtnumber', 'shirtNumber')
            .where('g.contest_id = :contestId', {contestId})
            .getRawMany();
    }

    async getContestID(contestUuid: string): Promise<number> {
        const data = await this.contestRepository
            .createQueryBuilder('c')
            .select([])
            .addSelect('c.id', 'contestId')
            .where('c.uuid = :contestUuid', { contestUuid })
            .getRawOne();
        return data.contestId;
    }



}
