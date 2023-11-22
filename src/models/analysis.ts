import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Game } from './games';
import { AnalysisEvent } from './analysisEvents';

@Entity('analysis')
export class Analysis {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  game_id: number;

  @ManyToOne(() => Game, (game) => game.analyses)
  @JoinColumn({ name: 'game_id' })
  game: Game;

  @OneToMany(() => AnalysisEvent, (ae) => ae.analysis)
  analysisEvents: AnalysisEvent[];

  // Weitere Spalten ...
}
