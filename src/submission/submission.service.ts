import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { readFileSync } from 'fs';
import { Op } from 'sequelize';
import { Problem } from 'src/models/problem.model';
import { User } from 'src/models/user.model';
import { Submission } from '../models/submission.model';

const fileExt = {
  C: '.c',
  'C++': '.cpp',
};

@Injectable()
export class SubmissionService {
  constructor(
    @InjectModel(Submission)
    private submissionModel: typeof Submission,
  ) {}

  findAll(): Promise<Submission[]> {
    return this.submissionModel.findAll({
      attributes: {
        exclude: ['userId', 'probId'],
      },
      where: {
        contestId: null,
      },
      limit: 100,
      order: [['id', 'DESC']],
      include: [
        Problem,
        { model: User, attributes: { exclude: ['password', 'history'] } },
      ],
    });
  }

  findAllWithContest(): Promise<Submission[]> {
    return this.submissionModel.findAll({
      where: {
        contestId: {
          [Op.not]: null,
        },
      },
      limit: 100,
      order: [['id', 'DESC']],
    });
  }

  findOne(arg: any): Promise<Submission> {
    return this.submissionModel.findOne({ where: arg });
  }

  async findOneByResultId(resultId: number) {
    let resultData = await this.submissionModel.findOne({
      where: { id: resultId },
      raw: true,
      nest: true,
    });
    const filename = `${resultData.probId}_${resultData.timeSent}${
      fileExt[resultData.language]
    }`;
    const dir = `./upload/${resultData.userId}`;
    const scode = readFileSync(`${dir}/${filename}`).toString();
    return { ...resultData, scode };
  }

  async create(data: any, timeSent: number) {
    const result = new Submission();
    result.timeSent = timeSent;
    result.userId = Number(data.userId);
    result.probId = Number(data.probId);
    result.isGrading = false;
    result.language = data.lang;
    result.contestId = Number(data?.contestId) || null;
    const resultData = await result.save();
    return { resultData, status: true };
  }

  findAllByUserId(userId: number): Promise<Submission[]> {
    return this.submissionModel.findAll({
      where: { userId },
      order: [['id', 'DESC']],
    });
  }
}
