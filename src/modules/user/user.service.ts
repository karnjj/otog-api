import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role, USER_REPOSITORY } from 'src/core/constants';
import { User } from '../../entities/user.entity';
import { CreateUserDTO } from '../auth/dto/auth.dto';
import { UserDTO } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(@Inject(USER_REPOSITORY) private userRepository: typeof User) {}

  async create(data: CreateUserDTO) {
    const userNameExists = await this.findOneByUsername(data.username);
    if (userNameExists) {
      throw new ConflictException('username was taken.');
    }
    const showNameExists = await this.findOneByShowName(data.showName);
    if (showNameExists) {
      throw new ConflictException('showName was taken.');
    }
    const user = new User();
    try {
      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(data.password, salt);
      user.username = data.username;
      user.password = hash;
      user.showName = data.showName;
      user.role = data.role;
      await user.save();
    } catch (e) {
      throw new BadRequestException();
    }
    return new UserDTO(user);
  }

  async findAll(): Promise<UserDTO[]> {
    const result = await this.userRepository.findAll();
    const userDTO = result.map((item) => new UserDTO(item));
    return userDTO;
  }

  async findOneByUsername(username: string): Promise<User> {
    return await this.userRepository.findOne({
      where: { username },
    });
  }

  async findOneByShowName(showName: string): Promise<User> {
    return await this.userRepository.findOne({
      where: { showName },
    });
  }
}
