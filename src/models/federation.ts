import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import {Country} from "./countries";

@Entity('federations')
export class Federation {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Country)
    @JoinColumn({ name: 'country_id' })
    country: Country;

    @Column()
    name: string;

    // Weitere Spalten...
}
