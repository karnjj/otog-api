import { ApiProperty, OmitType, PickType } from '@nestjs/swagger';

export class ProblemDTO {
  @ApiProperty()
  readonly id: number;

  readonly name: string;

  readonly score: number;

  readonly timeLimit: number;

  readonly memoryLimit: number;

  readonly case: string;
}

export class EditProblemDTO extends ProblemDTO {
  readonly pdf?: File;

  readonly zip?: File;
}

export class CreateProblemDTO extends OmitType(EditProblemDTO, [
  'id',
] as const) {}

export class UploadedFilesObject {
  readonly pdf?: Express.Multer.File;

  readonly zip?: Express.Multer.File;
}
