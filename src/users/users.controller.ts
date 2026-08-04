import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUsernameDto } from './dto/update-username.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard/jwt-auth.guard';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(JwtAuthGuard)
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

  @Patch('update-avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, cb) => {
          cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),
    }),
  )
  updateAvatar(
    @Req() req: Request & { user: { userId: number } },
    @UploadedFile() file: Express.Multer.File,
  ) {
    {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }
      const avatarUrl = `/uploads/avatars/${file.filename}`;
      return this.usersService.updateAvatar(req.user.userId, avatarUrl);
    }
  }

  @Get(':id')
  findProfile(@Param() id: string) {
    return this.usersService.findProfile(Number(id));
  }
}
