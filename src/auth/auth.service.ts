import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { hash, compare } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  private buildToken(user_id: number) {
    const payload = { user_id };
    return { access_token: this.jwtService.sign(payload) };
  }

  async signup(email: string, username: string, password: string) {
    const exisingEmail = await this.usersService.findByEmail(email);
    if (exisingEmail)
      throw new ConflictException('This email is already in use');
    const exisingUser = await this.usersService.findByUsername(username);
    if (exisingUser)
      throw new ConflictException('This username is already in use');

    const hashedPassword = await hash(password, 10);
    const user = await this.usersService.create(
      email,
      username,
      hashedPassword,
    );
    return this.buildToken(user.id);
  }

  async login(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user) throw new UnauthorizedException('The credentials do not match');
    const doesPasswordMatch = await compare(password, user.password);
    if (!doesPasswordMatch)
      throw new UnauthorizedException('The credentials do not match');
    return this.buildToken(user.id);
  }
}
