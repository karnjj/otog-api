import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { sha256 } from 'js-sha256';
import { v4 as uuidv4 } from 'uuid';
import { UserDTO } from '../user/dto/user.dto';
import { UserService } from '../user/user.service';
import { CreateUserDTO } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { JWT_PUBLIC } from 'src/core/constants';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<UserDTO> {
    const user = await this.userService.findOneByUsername(username);
    if (!user) return null;

    const isMatch = await bcrypt.compare(pass, user.password);
    if (isMatch) {
      return new UserDTO(user);
    }
  }

  async login(user: UserDTO) {
    const accessToken = this.jwtService.sign(user);
    return { accessToken, user };
  }

  decodeJwt(accessToken: string) {
    return this.jwtService.decode(accessToken);
  }
}
