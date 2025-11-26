import { Controller, Get, UseGuards } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { CurrentUser } from 'src/decorators/user.decorator';
import { Role, User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { DocWithProfileEntity } from '../profiles/entities/doc-with-profile.entity';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Roles(Role.user)
  @UseGuards(JwtAuthGuard)
  @UseGuards(RolesGuard)
  @Get()
  async getMatchedDocs(@CurrentUser() user: User) {
    const profiles = await this.matchesService.getMatchedDocs(user.id);
    return profiles.map((p) => new DocWithProfileEntity(p));
  }

  @Get('problems')
  async getProblems() {
    return await this.matchesService.getProblems();
  }
}
