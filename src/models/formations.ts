import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('formations')
export class Formation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  // Weitere Spalten und Beziehungen...
}
