import {
  Column,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Contest } from './contest.entity';
import { Problem } from './problem.entity';
@Table({ tableName: 'problemContest' })
export class ProblemContest extends Model {
  @PrimaryKey
  @ForeignKey(() => Contest)
  @Column
  contestId: number;

  @PrimaryKey
  @ForeignKey(() => Problem)
  @Column
  problemId: number;
}
