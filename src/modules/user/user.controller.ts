import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from 'src/core/constants';
import { Roles } from 'src/core/decorators/roles.decorator';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { CreateUserDTO } from '../auth/dto/auth.dto';
import { UserDTO } from './dto/user.dto';
import { UserService } from './user.service';

@ApiBearerAuth()
@ApiTags('user')
@UseGuards(RolesGuard)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Roles(Role.Admin)
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
    console.log(data);

    return this.userService.create(data);
  }
}
