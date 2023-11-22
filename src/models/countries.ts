import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('countries')
export class Country {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    // Weitere Spalten...
}
