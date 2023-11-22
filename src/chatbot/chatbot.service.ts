import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from '../models/games';
import { HeimspielEvent } from '../models/heimspielevents';
import { Analysis } from '../models/analysis';
import { Contest } from '../models/contest';
import { GameFormation } from '../models/gameformations';

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
    return this.gameRepository
      .createQueryBuilder('g')
      .innerJoin('g.homeTeam', 'ht')
      .innerJoin('g.awayTeam', 'at')
      .addSelect('g.id', 'gameId')
      .addSelect('g.contest_id', 'contestId')
      .addSelect('ht.name', 'homeTeamName')
      .addSelect('at.name', 'awayTeamName')
      .addSelect('g.score_home', 'homeScore')
      .addSelect('g.score_away', 'awayScore')
      .addSelect('g.spieltag', 'matchDay')
      .addSelect('g.game_date', 'gameDate')
      .addSelect('g.venue', 'gameVenue')
      .where('g.contest_id = :contestId', { contestId })
      .getRawMany();
  }

  async heimspiel(contestId: number): Promise<any> {
    return this.heimspielEventRepository
      .createQueryBuilder('he')
      .innerJoin('he.game', 'g')
      .addSelect('he.id', 'eventId')
      .addSelect('he.game_id', 'gameId')
      .addSelect('he.team_id', 'teamId')
      .addSelect('he.team_type', 'teamType')
      .addSelect('he.person_id', 'personId')
      .addSelect('he.name', 'eventName')
      .addSelect('he.shirtnumber', 'shirtNumber')
      .addSelect('he.minute', 'eventMinute')
      .addSelect('he.action', 'eventAction')
      .addSelect('he.kind', 'eventKind')
      .addSelect('he.rolename', 'roleName')
      .addSelect('he.shortrolename', 'shortRoleName')
      .where('g.contest_id = :contestId', { contestId })
      .getRawMany();
  }

  async findAnalysisByContestId(contestId: number): Promise<any> {
    return this.analysisRepository
      .createQueryBuilder('a')
      .innerJoin('a.game', 'g')
      .innerJoin('a.analysisEvents', 'ae')
      .innerJoin('ae.label', 'ael')
      .addSelect('ae.id', 'analysisEventId')
      .addSelect('a.id', 'analysisId')
      .addSelect('a.game_id', 'gameId')
      .addSelect('ae.start', 'eventStart')
      .addSelect('ae.end', 'eventEnd')
      .addSelect('ae.halbzeit', 'halfTime')
      .addSelect('ae.team', 'teamId')
      .addSelect('ae.code', 'eventCode')
      .addSelect('ael.label', 'eventLabel')
      .where('g.contest_id = :contestId', { contestId })
      .getRawMany();
  }

  async findContest(contestId: number): Promise<any> {
    return this.contestRepository
      .createQueryBuilder('c')
      .innerJoin('c.season', 's')
      .innerJoin('c.federation', 'f')
      .innerJoin('f.country', 'c2')
      .addSelect('c.id', 'Contest_ID')
      .addSelect('f.name', 'Verband')
      .addSelect('c2.name', 'Land')
      .addSelect('s.id', 'season_id')
      .addSelect('s.name', 'Saison')
      .addSelect('c.halftime_duration', 'HalftimeDuration')
      .addSelect('c.overtime_duration', 'OvertimeDuration')
      .addSelect('c.name', 'ContestName')
      .addSelect('c.name_short', 'ContestShortName')
      .where('c.id = :contestId', { contestId })
      .getRawOne();
  }

  async findFormation(contestId: number): Promise<any> {
    return this.gameFormationRepository
      .createQueryBuilder('gf')
      .innerJoin('gf.formation', 'f')
      .innerJoin('gf.game', 'g')
      .innerJoin('gf.gameFormationsPositions', 'gfp')
      .addSelect('gf.id', 'gameFormationId')
      .addSelect('gf.game_id', 'gameId')
      .addSelect('f.name', 'formationName')
      .addSelect('gf.team_type', 'teamType')
      .addSelect('gf.formation_type', 'formationType')
      .addSelect('gfp.position', 'position')
      .addSelect('gfp.shirtnumber', 'shirtNumber')
      .where('g.contest_id = :contestId', { contestId })
      .getRawMany();
  }
}
