import { IsEmail, IsString, IsStrongPassword } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRegisterDto {
  @ApiProperty({
    example: 'Ali Valiyev',
    description: 'Foydalanuvchi to‘liq ismi',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'ali@example.com',
    description: 'Foydalanuvchi email manzili',
  })
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty({
    example: 'P@ssw0rd123!',
    description:
      'Kuchli parol: kamida 1 katta harf, 1 kichik harf, 1 raqam va 1 belgi bo‘lishi kerak',
  })
  @IsString()
  password: string;
}
