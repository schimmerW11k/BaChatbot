import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne, OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Game } from './games';
import { Formation } from './formations';
import { GameFormationsPosition } from './gameFormationPosition';

@Entity('game_formations')
export class GameFormation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  game_id: number;

  @ManyToOne(() => Game)
  @JoinColumn({ name: 'game_id' })
  game: Game;

  @ManyToOne(() => Formation)
  @JoinColumn({ name: 'formation_id' })
  formation: Formation;

  @OneToMany(() => GameFormationsPosition, (gfp) => gfp.gameFormation)
  gameFormationsPositions: GameFormationsPosition[];

  @Column()
  team_type: string;

  @Column()
  formation_type: string;
}
