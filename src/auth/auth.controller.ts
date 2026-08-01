import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { SignupDTO } from './dto/signup.dto';
import { LoginDTO } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}
  @Post('signup')
  signup(@Body() dto: SignupDTO) {
    return this.authService.signup(dto.email, dto.username, dto.password);
  }

  @Post('login')
  login(@Body() dto: LoginDTO) {
    return this.authService.login(dto.username, dto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  whoAMI(@Req() req: Request & { user: { userID: number } }) {
    return this.usersService.findById(req.user.userID);
  }
}
