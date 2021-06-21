import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Role } from 'src/core/constants';
import { Roles } from 'src/core/decorators/roles.decorator';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { AuthService } from '../auth/auth.service';
import { ContestService } from '../contest/contest.service';
import {
  CreateProblemDTO,
  EditProblemDTO,
  ProblemDTO,
  UploadedFilesObject,
} from './dto/problem.dto';
import { ProblemService } from './problem.service';

@ApiBearerAuth()
@ApiTags('problem')
@Controller('problem')
@UseGuards(RolesGuard)
export class ProblemController {
  constructor(
    private problemService: ProblemService,
    private contestService: ContestService,
    private authService: AuthService,
  ) {}

  @Roles(Role.Admin)
  @Get()
  @ApiOkResponse({
    type: ProblemDTO,
    isArray: true,
    description: 'Get problems depends on user permission',
  })
  async getAllProblems() {
    return await this.problemService.findAll();
  }

  @Get('doc/:problemId')
  @ApiOkResponse({ description: 'Get problem document (pdf)' })
  @ApiNotFoundResponse({ description: 'Problem not found' })
  async getDocById(
    @Param('problemId', ParseIntPipe) problemId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    let user = null;
    const accessToken = await req.cookies['accessToken'];
    if (accessToken) {
      user = this.authService.decodeJwt(accessToken);
    }

    const problem = await this.problemService.findOneById(problemId);
    if (!problem) throw new NotFoundException();

    if (user?.role != Role.Admin) {
      const contest =
        await this.contestService.getStartedAndUnFinishedContest();
      if (!contest || !contest.problems.some((e) => e.id === problem.id))
        throw new ForbiddenException();
    }
    return res.sendFile(await this.problemService.getProblemDocDir(problem));
  }

  //Admin route
  @Roles(Role.Admin)
  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateProblemDTO })
  @ApiCreatedResponse({
    type: ProblemDTO,
    description: 'Create new problem',
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'pdf', maxCount: 1 },
        { name: 'zip', maxCount: 1 },
      ],
      {
        dest: './tmp/upload',
      },
    ),
  )
  createProblem(
    @Body() createProblem: CreateProblemDTO,
    @UploadedFiles() files: UploadedFilesObject,
  ) {
    return this.problemService.create(createProblem, files);
  }

  @Roles(Role.Admin)
  @Put('/:problemId')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: EditProblemDTO })
  @ApiOkResponse({
    type: ProblemDTO,
    description: 'New problem detail',
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'pdf', maxCount: 1 },
        { name: 'zip', maxCount: 1 },
      ],
      {
        dest: './tmp/upload',
      },
    ),
  )
  replaceProblem(
    @Body() newProblem: EditProblemDTO,
    @UploadedFiles() files: UploadedFilesObject,
  ) {
    return this.problemService.ReplaceByProblemId(newProblem, files);
  }
}
