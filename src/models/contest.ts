import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Federation } from './federation';
import {Season} from "./seasons";


@Entity('contests')
export class Contest {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Season)
    @JoinColumn({ name: 'season_id' })
    season: Season;

    @ManyToOne(() => Federation)
    @JoinColumn({ name: 'federation_id' })
    federation: Federation;

    @Column()
    halftime_duration: number;

    @Column()
    overtime_duration: number;

    @Column()
    name: string;

    @Column()
    name_short: string;

    // Weitere Spalten...
}
