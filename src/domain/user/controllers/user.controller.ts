import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { CustomerJwtAuthGuard } from 'src/domain/auth/guards/customer-auth.guard';
import { BaseController } from 'src/shared/base.controller';
import { Public } from 'src/shared/base.decorators';
import { HttpExceptionFilter } from 'src/shared/http-exception.filter';
import { CreateUserDto, SignInDto } from '../dto/create-user.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { SendOtpDto } from '../dto/send-otp.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { UserService } from '../services/user.service';

@Controller('users')
@UseGuards(CustomerJwtAuthGuard)
@UseFilters(new HttpExceptionFilter())
@Throttle({ options: { limit: 5, ttl: 60 * 30 } })
export class UserController extends BaseController {
  constructor(private readonly _userService: UserService) {
    super();
  }

  @Post('sign-up')
  @Public()
  async signUp(@Body() createUserDto: CreateUserDto) {
    return this.responseCustom(await this._userService.singUp(createUserDto));
  }

  @Post('sign-in')
  @Public()
  @SkipThrottle()
  async signIn(@Body() body: SignInDto, @Req() req: Request) {
    const headers = this.getHeaders(req);
    const data = await this._userService.signIn(body, headers);

    return this.responseCustom(data);
  }

  @Get('profile')
  async getProfile(@Req() req: Request) {
    const user = this.getUserInfo(req);
    const data = await this._userService.getProfile(user);
    return this.responseCustom(data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this._userService.update(+id, updateUserDto);
  }

  @Public()
  @Post('send-otp')
  async sendOtp(@Body() body: SendOtpDto) {
    const data = await this._userService.sendOtp(body);
    return this.responseCustom(data, {
      message: 'OTP sent successfully',
    });
  }

  @Post('verify-otp')
  @Public()
  async verifyOtp(@Body() body: VerifyOtpDto) {
    const data = await this._userService.verifyOtp(body);
    return this.responseCustom(data, {
      message: 'OTP verified successfully',
    });
  }

  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto, @Req() req: Request) {
    const user = this.getUserInfo(req);
    const data = await this._userService.resetPassword(user, body);
    return this.responseCustom(data);
  }
}
