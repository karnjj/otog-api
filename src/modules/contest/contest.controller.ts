import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from 'src/core/constants';
import { Roles } from 'src/core/decorators/roles.decorator';
import { User } from 'src/core/decorators/user.decorator';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { UserDTO } from '../user/dto/user.dto';
import { ContestService } from './contest.service';
import {
  ContestDTO,
  CreateContestDTO,
  EditContestDTO,
  PatchContestDTO,
  ResPatchContestDTO,
  ScoreboardDTO,
} from './dto/contest.dto';

@ApiBearerAuth()
@ApiTags('contest')
@Controller('contest')
@UseGuards(RolesGuard)
export class ContestController {
  constructor(private contestService: ContestService) {}
  @Roles(Role.Admin, Role.User)
  @Get('/now')
  @ApiOkResponse({
    type: ContestDTO,
    description: 'Get current contest',
  })
  getCurrentContest() {
    return this.contestService.currentContest();
  }

  @Roles(Role.Admin, Role.User)
  @Get('/:contestId')
  @ApiOkResponse({
    type: ContestDTO,
    description: 'Get contest by id',
  })
  @ApiNotFoundResponse({ description: 'Contest not found' })
  getContestById(
    @Param('contestId', ParseIntPipe) contestId: number,
    @User() user: UserDTO,
  ) {
    if (user.role == Role.Admin)
      return this.contestService.findOneById(contestId);
    else if (user.role == Role.User)
      return this.contestService.findOneByIdBlockProblem(contestId);
  }

  @Roles(Role.Admin)
  @Get()
  @ApiOkResponse({
    type: ContestDTO,
    isArray: true,
    description: 'Get all contests',
  })
  getAllContest() {
    return this.contestService.findAll();
  }

  @Roles(Role.Admin)
  @Get('/:contestId/scoreboard')
  @ApiOkResponse({
    type: ScoreboardDTO,
    description: 'Get scoreboard contest by id',
  })
  @ApiNotFoundResponse({ description: 'Contest not found' })
  async getContestScoreBoardById(
    @Param('contestId', ParseIntPipe) contestId: number,
  ) {
    const scoreboard = await this.contestService.scoreboardByContestId(
      contestId,
    );
    if (!scoreboard) throw new NotFoundException();
    return scoreboard;
  }

  @Roles(Role.Admin)
  @Post()
  @ApiBody({ type: CreateContestDTO })
  @ApiCreatedResponse({ description: 'Contest created successfully' })
  create(@Body() createContest: CreateContestDTO) {
    return this.contestService.create(createContest);
  }

  @Roles(Role.Admin)
  @Put('/:contestId')
  @ApiBody({ type: EditContestDTO })
  @ApiOkResponse({
    type: ContestDTO,
    description: 'New contest detail',
  })
  editContest(
    @Param('contestId', ParseIntPipe) contestId: number,
    @Body() newContest: EditContestDTO,
  ) {
    return this.contestService.replaceContest(contestId, newContest);
  }

  @Roles(Role.Admin)
  @Delete('/:contestId')
  @ApiOkResponse({
    type: ContestDTO,
    description: 'contest deleted detail',
  })
  deleteContest(@Param('contestId', ParseIntPipe) contestId: number) {
    return this.contestService.delete(contestId);
  }

  @Roles(Role.Admin)
  @Patch('/:contestId')
  @ApiBody({ type: PatchContestDTO })
  @ApiResponse({
    status: 200,
    type: ResPatchContestDTO,
  })
  @ApiNotFoundResponse({ description: 'Contest not found' })
  addProblemToContest(
    @Param('contestId', ParseIntPipe) contestId: number,
    @Body('problemId', ParseIntPipe) problemId: number,
    @Body('show', ParseBoolPipe) show: boolean,
  ) {
    return this.contestService.addProblemToContest(contestId, problemId, show);
  }

  @Roles(Role.Admin)
  @Post('/:contestId/signup')
  @ApiCreatedResponse({ description: 'Add user to contest successfully' })
  addUserToContest(
    @Param('contestId', ParseIntPipe) contestId: number,
    @Body('userId', ParseIntPipe) userId: number,
  ) {
    return this.contestService.addUserToContest(contestId, userId);
  }
}
