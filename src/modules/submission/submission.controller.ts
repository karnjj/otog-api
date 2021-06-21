import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SubmissionService } from './submission.service';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  SubmissionDTO,
  SubmissionWithSourceCodeDTO,
  UploadFileDTO,
} from './dto/submission.dto';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { Roles } from 'src/core/decorators/roles.decorator';
import { Role } from 'src/core/constants';
import { User } from 'src/core/decorators/user.decorator';
import { UserDTO } from '../user/dto/user.dto';
import { ContestService } from '../contest/contest.service';

@ApiTags('submission')
@Controller('submission')
@UseGuards(RolesGuard)
export class SubmissionController {
  constructor(
    private submissionService: SubmissionService,
    private contestService: ContestService,
  ) {}

  @Roles(Role.Admin)
  @Get()
  @ApiQuery({ name: 'offset', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiOkResponse({
    type: SubmissionDTO,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed (numeric string is expected)',
  })
  getAllSubmission(@Query('offset') os: string, @Query('limit') lm: string) {
    const offset: number = parseInt(os);
    const limit: number = parseInt(lm);
    if ((os && isNaN(offset)) || (lm && isNaN(limit)))
      throw new BadRequestException(
        'Validation failed (numeric string is expected)',
      );
    return this.submissionService.findAll(offset, limit);
  }

  @Roles(Role.Admin, Role.User)
  @Get('/problem/:problemId/latest')
  @ApiOkResponse({ type: SubmissionWithSourceCodeDTO })
  @ApiNotFoundResponse({ description: 'Submission for the problem not found' })
  @ApiNotFoundResponse({ description: 'Problem not found' })
  getLatestSubmissionByProblemId(
    @Param('problemId', ParseIntPipe) problemId: number,
    @User() user: UserDTO,
  ) {
    return this.submissionService.findOneByProblemIdAndUserId(
      problemId,
      user.id,
    );
  }

  @Roles(Role.User, Role.Admin)
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadFileDTO })
  @Post('/problem/:problemId')
  @ApiCreatedResponse({ description: 'Submit successfully' })
  @ApiNotFoundResponse({ description: 'Problem not found' })
  @UseInterceptors(FileInterceptor('sourceCode'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('problemId', ParseIntPipe) problemId: number,
    @User() user: UserDTO,
    @Body() data: UploadFileDTO,
  ) {
    if (data.contestId) {
      await this.contestService.addUserToContest(data.contestId, user.id);
    }
    return this.submissionService.create(user, problemId, data, file);
  }

  @Roles(Role.Admin)
  @Get('/:resultId')
  @ApiOkResponse({
    type: SubmissionWithSourceCodeDTO,
    description: 'Get submission by id',
  })
  @ApiNotFoundResponse({ description: 'Submission not found' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  async getSubmissionById(@Param('resultId', ParseIntPipe) resultId: number) {
    const submission = await this.submissionService.findOneByResultId(resultId);
    if (!submission) throw new NotFoundException();
    return submission;
  }
}
