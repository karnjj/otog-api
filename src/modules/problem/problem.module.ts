import { Module } from '@nestjs/common';
import { ProblemController } from './problem.controller';
import { ProblemService } from './problem.service';
import { problemProvider } from './problem.provider';
import { ContestModule } from '../contest/contest.module';
import { AuthModule } from '../auth/auth.module';
import { SubmissionModule } from '../submission/submission.module';

@Module({
  imports: [ContestModule, AuthModule],
  controllers: [ProblemController],
  providers: [ProblemService, ...problemProvider],
  exports: [ProblemService],
})
export class ProblemModule {}
