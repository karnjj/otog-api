import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDTO } from '../auth/dto/auth.dto';
import { UserDTO } from './dto/user.dto';
import { UserService } from './user.service';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @ApiOkResponse({
    type: UserDTO,
    isArray: true,
    description: 'Get all registered users',
  })
  getAllUsers(): Promise<UserDTO[]> {
    return this.userService.findAll();
  }

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
    return this.userService.create(data);
  }
}
