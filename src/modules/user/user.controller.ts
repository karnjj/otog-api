import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
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
}
