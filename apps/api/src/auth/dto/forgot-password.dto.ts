import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'juan.perez@example.com', description: 'Correo electrónico registrado' })
  @IsEmail({}, { message: 'El correo debe ser válido' })
  email: string;
}
