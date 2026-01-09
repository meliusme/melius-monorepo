import { Controller, Get, UseGuards, Body, Post, HttpCode } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { MatchesService } from './matches.service';
import { CurrentUser } from 'src/decorators/user.decorator';
import { Role, User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { SearchMatchesDto } from './dto/search-matches.dto';
import { ProblemEntity } from '../profiles/entities/problem.entity';
import { SearchMatchesResultDto } from './dto/search-docs-with-slots-response.dto';
import { DocWithProfilePublicResponseDto } from '../profiles/dtos/doc-with-profile-public-response.dto';
import { toDocWithProfilePublicResponse } from '../profiles/profiles.mapper';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Roles(Role.user)
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Get()
  @ApiOkResponse({ type: DocWithProfilePublicResponseDto, isArray: true })
  async getMatchedDocs(@CurrentUser() user: User) {
    const profiles = await this.matchesService.getMatchedDocs(user.id);
    return profiles.map((p) => toDocWithProfilePublicResponse(p));
  }

  @Get('problems')
  @ApiOkResponse({ type: ProblemEntity, isArray: true })
  async getProblems(): Promise<ProblemEntity[]> {
    const problems = await this.matchesService.getProblems();
    return problems.map((p) => new ProblemEntity(p));
  }

  @Post('search-with-slots')
  @HttpCode(200)
  @ApiOkResponse({ type: SearchMatchesResultDto, isArray: true })
  async searchDocsWithSlots(
    @Body() dto: SearchMatchesDto,
  ): Promise<SearchMatchesResultDto[]> {
    return this.matchesService.searchDocsWithSlots(dto);
  }
}
