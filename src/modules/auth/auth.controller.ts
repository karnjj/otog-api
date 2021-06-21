import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import {
  CreateUserDTO,
  LoginReqDTO,
  AuthResDTO,
  SignupResDTO,
} from './dto/auth.dto';
import { LocalAuthGuard } from '../../core/guards/local-auth.guard';
import { Public } from '../../core/decorators/isPublic.decorator';
import { User } from 'src/core/decorators/user.decorator';
import { UserDTO } from '../user/dto/user.dto';

@ApiBearerAuth()
@ApiTags('auth')
@Public()
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post()
  @ApiBody({
    type: CreateUserDTO,
  })
  @ApiResponse({
    status: 201,
    type: UserDTO,
    description: 'User created successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'username or showName already exists',
  })
  newUser(@Body() data: CreateUserDTO) {
    return this.authService.create(data);
  }

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
