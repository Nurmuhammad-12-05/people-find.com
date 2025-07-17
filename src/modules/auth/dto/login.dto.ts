import { IsEmail, IsString, IsStrongPassword } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'ali@example.com',
    description: 'Foydalanuvchining email manzili',
  })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'P@ssw0rd123!',
    description:
      'Kuchli parol: kamida 1 katta harf, 1 kichik harf, 1 raqam va 1 belgi bo‘lishi kerak',
  })
  @IsString()
  password: string;
}
