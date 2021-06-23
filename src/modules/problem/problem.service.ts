import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PROBLEM_REPOSITORY } from 'src/core/constants';
import { Problem } from '../../entities/problem.entity';
import { existsSync, mkdirSync, renameSync, rmdirSync, unlinkSync } from 'fs';
import {
  CreateProblemDTO,
  EditProblemDTO,
  UploadedFilesObject,
} from './dto/problem.dto';
import { createReadStream } from 'fs';
import { Extract } from 'unzipper';
@Injectable()
export class ProblemService {
  constructor(
    @Inject(PROBLEM_REPOSITORY) private problemRepository: typeof Problem,
  ) {}

  async create(
    createProblem: CreateProblemDTO,
    files: UploadedFilesObject,
  ): Promise<Problem> {
    try {
      const problem = new Problem();
      problem.name = createProblem.name;
      problem.score = createProblem.score;
      problem.timeLimit = createProblem.timeLimit;
      problem.memoryLimit = createProblem.memoryLimit;
      problem.case = createProblem.case;
      await problem.save();

      //save pdf file
      if (files.pdf) {
        const newDir = `./docs`;
        // check source dir is exist
        if (!existsSync(newDir)) {
          mkdirSync(newDir);
        }
        const newPath = `${newDir}/${problem.id}.pdf`;
        // move pdf file to source folder
        renameSync(files.pdf[0].path, newPath);
      }

      if (files.zip) {
        const newDir = `./source/${problem.id}`;
        // check source dir is exist
        if (!existsSync(newDir)) {
          mkdirSync(newDir, { recursive: true });
        }
        const newPath = `${newDir}/tmp.zip`;
        // move zip file to source folder
        renameSync(files.zip[0].path, newPath);
        // unzip source file
        const fileContents = createReadStream(newPath);
        fileContents.pipe(Extract({ path: newDir }));
        rmdirSync(newPath, { recursive: true });
      }
      return problem;
    } catch (err) {
      throw new BadRequestException();
    }
  }

  async ReplaceByProblemId(
    problemId: number,
    newProblem: EditProblemDTO,
    files: UploadedFilesObject,
  ): Promise<Problem> {
    try {
      const problem = await this.findOneById(problemId);
      problem.name = newProblem.name;
      problem.score = newProblem.score;
      problem.timeLimit = newProblem.timeLimit;
      problem.memoryLimit = newProblem.memoryLimit;
      problem.case = newProblem.case;
      await problem.save();

      //save pdf file
      if (files.pdf) {
        const newDir = `./docs`;
        // check source dir is exist
        if (!existsSync(newDir)) {
          mkdirSync(newDir);
        }
        const newPath = `${newDir}/${problem.id}.pdf`;
        //remove old file
        unlinkSync(newPath);
        // move pdf file to source folder
        renameSync(files.pdf[0].path, newPath);
      }

      if (files.zip) {
        const newDir = `./source/${problem.id}`;
        //remove old dir
        rmdirSync(newDir, { recursive: true });
        // check source dir is exist
        if (!existsSync(newDir)) {
          mkdirSync(newDir, { recursive: true });
        }
        const newPath = `${newDir}/tmp.zip`;
        // move zip file to source folder
        renameSync(files.zip[0].path, newPath);
        // unzip source file
        const fileContents = createReadStream(newPath);
        fileContents.pipe(Extract({ path: newDir }));
        unlinkSync(newPath);
      }
      return problem;
    } catch (err) {
      throw new BadRequestException();
    }
  }
  async findAll() {
    return await this.problemRepository.findAll();
  }

  async findOneById(id: number): Promise<Problem> {
    return await this.problemRepository.findOne({ where: { id } });
  }

  async delete(problemId: number) {
    try {
      const problem = await this.findOneById(problemId);

      const pdfPath = `./docs/${problem.id}.pdf`;
      if (existsSync(pdfPath)) unlinkSync(pdfPath);

      const testCasePath = `./source/${problem.id}`;
      if (existsSync(testCasePath))
        rmdirSync(testCasePath, { recursive: true });

      return await problem.destroy();
    } catch (e) {
      console.log(e);

      throw new BadRequestException();
    }
  }

  async getProblemDocDir(problem: Problem): Promise<string> {
    const dir = `${process.cwd()}/docs/${problem?.id}.pdf`;
    if (!existsSync(dir)) throw new NotFoundException();
    return `${process.cwd()}/docs/${problem.id}.pdf`;
  }
}
