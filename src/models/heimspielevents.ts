import { Game } from './games';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('heimspiel_events')
export class HeimspielEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  game_id: number;

  @Column()
  team_type: string;

  @Column()
  name: string;

  @Column()
  shirtnumber: number;

  @Column()
  minute: number;

  @Column()
  action: string;

  @Column()
  kind: string;

  @Column()
  rolename: string;

  @Column()
  shortrolename: string;

  @ManyToOne(() => Game)
  @JoinColumn({ name: 'game_id' })
  game: Game;
}
