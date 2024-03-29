import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
