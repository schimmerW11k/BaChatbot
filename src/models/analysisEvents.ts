import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Analysis } from './analysis';
import { AnalysisEventLabel } from './analysisEventLabel';

@Entity('analysis_events')
export class AnalysisEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Analysis, (analysis) => analysis.analysisEvents)
  @JoinColumn({ name: 'analysis_id' })
  analysis: Analysis;

  @OneToOne(() => AnalysisEventLabel)
  @JoinColumn({ name: 'id' })
  label: AnalysisEventLabel;

  // Weitere Spalten ...
}
