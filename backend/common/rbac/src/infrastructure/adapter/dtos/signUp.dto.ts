import { ApiProperty } from '@nestjs/swagger';

export class SignUpRequestDto {
  @ApiProperty({
    description: 'A valid email.',
    example: 'myemail@gmail.com',
    required: true,
  })
  email!: string;
  @ApiProperty({
    description: 'A valid password',
    example: 'paSSw0rd!',
    required: true,
  })
  password!: string;
  @ApiProperty({
    description: 'A valid L1Address.',
    example: '4CF6CF5C03E567C6D3E52EF4F382EF10877ECD8',
    required: true,
  })
  L1Address!: string;
}

export class SignUpResponseDto {
  @ApiProperty({
    description: 'message for signup successful',
    example:
      'myemail@gmail.com successfully sign up',
  })
  message!: string;
}