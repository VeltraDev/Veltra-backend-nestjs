import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersInterface } from '../../users/users.interface';
import { RolesService } from 'src/roles/roles.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private rolesService: RolesService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(payload: UsersInterface) {
    const { id, email, firstName, lastName, role } = payload;

    const userRole = role as unknown as { id: string; name: string };

    const roleWithPermissions = await this.rolesService.getRoleById(
      userRole.id,
    );

    return {
      id,
      email,
      firstName,
      lastName,
      role: {
        id: userRole.id,
        name: userRole.name,
        permissions: roleWithPermissions?.permissions ?? [],
      },
    };
  }
}
