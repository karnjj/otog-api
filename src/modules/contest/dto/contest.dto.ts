import { ApiProperty, OmitType } from '@nestjs/swagger';
import { ProblemDTO } from 'src/modules/problem/dto/problem.dto';
import { UserDTO, UserForScoreboardDTO } from 'src/modules/user/dto/user.dto';

class ContestDTOBase {
  readonly id: number;

  readonly name: string;

  readonly timeStart: Date;

  readonly timeEnd: Date;
}

export class ContestDTO extends ContestDTOBase {
  @ApiProperty()
  readonly problems: ProblemDTO[] | undefined;
}

export class CreateContestDTO extends OmitType(ContestDTOBase, [
  'id',
] as const) {}

export class EditContestDTO extends CreateContestDTO {}

export class ScoreboardDTO extends ContestDTOBase {
  @ApiProperty()
  readonly problems: ProblemDTO[];

  readonly users: UserForScoreboardDTO[];
}

export class PatchContestDTO {
  problemId: number;
  show: boolean;
}

export class ResPatchContestDTO {
  contestId: number;
  problemId: number;
  show: boolean;
}
