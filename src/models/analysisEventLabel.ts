import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('analysis_event_labels')
export class AnalysisEventLabel {
  @PrimaryGeneratedColumn()
  id: number;

  // Weitere Spalten ...
}
