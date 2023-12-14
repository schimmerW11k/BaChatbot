import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Team } from './teams';
import { Analysis } from './analysis';

@Entity('games')
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  contest_id: number;

  @Column()
  uuid: string;

  @ManyToOne(() => Team)
  @JoinColumn({ name: 'home_team_id' })
  homeTeam: Team;

  @ManyToOne(() => Team)
  @JoinColumn({ name: 'away_team_id' })
  awayTeam: Team;

  @Column()
  score_home: number;

  @Column()
  score_away: number;

  @Column()
  spieltag: number;

  @Column()
  game_date: Date;

  @Column()
  venue: string;

  @OneToMany(() => Analysis, (analysis) => analysis.game)
  analyses: Analysis[];
}
