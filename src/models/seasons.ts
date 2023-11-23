import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('seasons')
export class Season {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
