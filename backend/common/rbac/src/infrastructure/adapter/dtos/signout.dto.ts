import { ApiProperty } from '@nestjs/swagger';

export class SignOutRequestDto {
  @ApiProperty({
    description: 'A valid email.',
    example: 'myemail@gmail.com',
    required: true,
  })
  email!: string;
}

export class SignOutResponseDto {
  @ApiProperty({
    description: 'message for signout successful',
    example: 'myemail@gmail.com successfully sign out',
  })
  message!: string;
}