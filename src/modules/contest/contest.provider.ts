import {
  PROBLEMCONTEST_REPOSITORY,
  CONTEST_REPOSITORY,
  USERCONTEST_REPOSITORY,
} from 'src/core/constants';
import { Contest } from 'src/entities/contest.entity';
import { ProblemContest } from 'src/entities/problemContest.entity';
import { UserContest } from 'src/entities/userContest.entity';

export const contestProvider = [
  {
    provide: CONTEST_REPOSITORY,
    useValue: Contest,
  },
  {
    provide: PROBLEMCONTEST_REPOSITORY,
    useValue: ProblemContest,
  },
  {
    provide: USERCONTEST_REPOSITORY,
    useValue: UserContest,
  },
];
