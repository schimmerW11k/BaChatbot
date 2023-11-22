import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';


@Entity('seasons')
export class Season {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    // Weitere Spalten...
}
