import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { col } from 'sequelize';
import { fn } from 'sequelize';
import { Op, literal } from 'sequelize';
import {
  PROBLEMCONTEST_REPOSITORY,
  CONTEST_REPOSITORY,
  Role,
  USERCONTEST_REPOSITORY,
} from 'src/core/constants';
import { ProblemContest } from 'src/entities/problemContest.entity';
import { Submission } from 'src/entities/submission.entity';
import { User } from 'src/entities/user.entity';
import { UserContest } from 'src/entities/userContest.entity';
import { Contest } from '../../entities/contest.entity';
import { CreateContestDTO, EditContestDTO } from './dto/contest.dto';

@Injectable()
export class ContestService {
  constructor(
    @Inject(CONTEST_REPOSITORY) private contestRepository: typeof Contest,
    @Inject(PROBLEMCONTEST_REPOSITORY)
    private contestProblemRepository: typeof ProblemContest,
    @Inject(USERCONTEST_REPOSITORY)
    private userContestRepository: typeof UserContest,
  ) {}

  async create(createContest: CreateContestDTO) {
    try {
      const contest = new Contest();
      contest.name = createContest.name;
      contest.timeStart = createContest.timeStart;
      contest.timeEnd = createContest.timeEnd;
      return await contest.save();
    } catch {
      throw new BadRequestException();
    }
  }

  async replaceContest(contestId: number, newContest: EditContestDTO) {
    try {
      const contest = await this.findOneById(contestId);
      contest.name = newContest.name;
      contest.timeStart = newContest.timeStart;
      contest.timeEnd = newContest.timeEnd;
      return await contest.save();
    } catch {
      throw new BadRequestException();
    }
  }

  async delete(contestId: number) {
    try {
      const contest = await this.findOneById(contestId);
      return await contest.destroy();
    } catch {
      throw new BadRequestException();
    }
  }

  findAll(): Promise<Contest[]> {
    return this.contestRepository.findAll({
      order: [['id', 'DESC']],
    });
  }

  findOneById(contestId: number): Promise<Contest> {
    return this.contestRepository
      .scope('full')
      .findOne({ where: { id: contestId } });
  }

  async scoreboardByContestId(contestId: number) {
    return await this.contestRepository.scope('full').findOne({
      include: [
        {
          model: User.scope('noPass'),
          through: {
            attributes: [],
          },
          where: { role: Role.User },
          include: [
            {
              model: Submission,
              attributes: ['id', 'problemId', 'score', 'timeUsed', 'status'],
              where: {
                id: {
                  [Op.in]: [
                    literal(
                      `SELECT MAX(id) FROM submission WHERE contestId = ${contestId} GROUP BY problemId,userId`,
                    ),
                  ],
                },
              },
            },
          ],
          required: false,
        },
      ],
      where: { id: contestId },
    });
  }

  async currentContest() {
    const contest = await this.contestRepository.scope('full').findOne({
      where: {
        timeEnd: {
          [Op.gte]: Date.now() - 60 * 60 * 1000,
        },
      },
      order: [['id', 'DESC']],
    });
    if (!contest) throw new NotFoundException();
    if (contest.timeStart.getTime() > Date.now()) {
      contest.problems = [];
    }
    return contest;
  }

  getStartedAndUnFinishedContest(): Promise<Contest> {
    return this.contestRepository.scope('full').findOne({
      where: {
        timeStart: {
          [Op.lte]: Date.now(),
        },
        timeEnd: {
          [Op.gte]: Date.now(),
        },
      },
      order: [['id', 'DESC']],
    });
  }

  async addProblemToContest(
    contestId: number,
    problemId: number,
    show: boolean,
  ) {
    try {
      if (show) {
        const contestProblem = new ProblemContest();
        contestProblem.problemId = problemId;
        contestProblem.contestId = contestId;
        await contestProblem.save();
        return { problemId, contestId, show };
      } else {
        const contestProblem = await this.contestProblemRepository.findOne({
          where: {
            contestId,
            problemId,
          },
        });
        await contestProblem.destroy();
        return { problemId, contestId, show };
      }
    } catch {
      throw new BadRequestException();
    }
  }

  async addUserToContest(contestId: number, userId: number) {
    return await this.userContestRepository.findOrCreate({
      where: { userId, contestId },
      defaults: {
        userId,
        contestId,
      },
    });
  }
}
