import {
  AutoIncrement,
  Column,
  DefaultScope,
  HasOne,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Submission } from './submission.entity';

@DefaultScope(() => ({
  order: [['id', 'DESC']],
}))
@Table({ tableName: 'problem' })
export class Problem extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column
  score: number;

  @Column
  timeLimit: number;

  @Column
  memoryLimit: number;

  @Column
  case: string;

  @HasOne(() => Submission)
  submission: Submission;
}
