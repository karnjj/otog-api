import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JWT_PRIVATE } from 'src/core/constants';
import { ContestModule } from '../contest/contest.module';
import { SubmissionController } from './submission.controller';
import { SubmissionGateway } from './submission.gateway';
import { submissionProvider } from './submission.provider';
import { SubmissionService } from './submission.service';

@Module({
  imports: [
    JwtModule.register({
      secret: JWT_PRIVATE,
      signOptions: {
        algorithm: 'RS256',
        expiresIn: '5h',
      },
    }),
    ContestModule,
  ],
  controllers: [SubmissionController],
  providers: [SubmissionService, SubmissionGateway, ...submissionProvider],
  exports: [SubmissionService],
})
export class SubmissionModule {}
