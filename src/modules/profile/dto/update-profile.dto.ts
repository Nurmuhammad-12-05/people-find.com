import { IsOptional, IsString, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    example: 'Ali Valiyev',
    description: 'Yangi ism',
  })
  name?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    example: 'Dasturchiman, 5 yillik tajriba bor',
    description: 'Bio qisqacha maʼlumot',
  })
  bio?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    example: 'Toshkent, O‘zbekiston',
    description: 'Manzil yoki joylashuv',
  })
  location?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiPropertyOptional({
    example: ['NestJS', 'TypeScript', 'PostgreSQL'],
    description: 'Foydalanuvchining ko‘nikmalari',
    type: [String],
  })
  skills?: string[];
}
