import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('formations')
export class Formation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
