import { Body, Controller, Get, Param, Patch, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUsernameDto } from './dto/update-username.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateEmailDto } from './dto/update-email.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}
  @Patch('update/username')
  updateUsername(
    @Req() req: Request & { user: { userId: number } },
    @Body() dto: UpdateUsernameDto,
  ) {
    return this.usersService.updateUsername(req.user.userId, dto.username);
  }

  @Patch('update/password')
  updatePassword(
    @Req() req: Request & { user: { userId: number } },
    @Body() dto: UpdatePasswordDto,
  ) {
    return this.usersService.updatePassword(
      req.user.userId,
      dto.currentPassword,
      dto.newPasswrod,
    );
  }

  @Patch('update/email')
  updateEmail(
    @Req() req: Request & { user: { userId: number } },
    @Body() dto: UpdateEmailDto,
  ) {
    return this.usersService.updateEmail(req.user.userId, dto.email);
  }

  @Get(':id')
  findProfile(@Param() id: string) {
    return this.usersService.findProfile(Number(id));
  }
}
