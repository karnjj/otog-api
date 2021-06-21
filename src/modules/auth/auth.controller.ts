import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from 'src/core/decorators/user.decorator';
import { Public } from '../../core/decorators/isPublic.decorator';
import { LocalAuthGuard } from '../../core/guards/local-auth.guard';
import { UserDTO } from '../user/dto/user.dto';
import { AuthService } from './auth.service';
import { AuthResDTO, LoginReqDTO } from './dto/auth.dto';

@ApiTags('auth')
@Public()
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  @ApiBody({
    type: LoginReqDTO,
  })
  @ApiResponse({
    status: 201,
    type: AuthResDTO,
    description: 'Login successfully, tokens are in the response header',
  })
  @ApiResponse({
    status: 401,
    description: 'Login failed, username or password is wrong',
  })
  async login(@User() userData: UserDTO) {
    return await this.authService.login(userData);
  }
}
