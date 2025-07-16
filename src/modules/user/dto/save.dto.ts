import { IsOptional, IsString, IsArray, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SaveProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @ApiPropertyOptional({
    example: 'Ishga oid eslatmalar, yillik maqsadlar va h.k.',
    description: 'Foydalanuvchi eslatmalari (maksimal 500 belgidan iborat)',
    maxLength: 500,
  })
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiPropertyOptional({
    example: ['developer', 'nestjs', 'portfolio'],
    description: 'Teglar ro‘yxati (string array)',
    type: [String],
  })
  tags?: string[];
}
