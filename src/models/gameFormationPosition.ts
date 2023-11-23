import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GameFormation } from './gameformations';

@Entity('game_formations_position')
export class GameFormationsPosition {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => GameFormation, (gf) => gf.gameFormationsPositions)
  @JoinColumn({ name: 'game_formation_id' })
  gameFormation: GameFormation;

  @Column()
  position: string;

  @Column()
  shirtnumber: number;
}
