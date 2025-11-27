import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  UseGuards,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/decorators/user.decorator';
import { User } from '@prisma/client';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  // doc creates slot
  @Post()
  @Roles(Role.doc)
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(@CurrentUser() user: User, @Body() dto: CreateAvailabilityDto) {
    return this.availabilityService.create(user.id, dto);
  }

  // doc sees their own slots
  @Get('my')
  @Roles(Role.doc)
  @UseGuards(JwtAuthGuard, RolesGuard)
  mySlots(@CurrentUser() user: User) {
    return this.availabilityService.findForDoc(user.id);
  }

  // client gets free slots of a doc
  @Get('doc/:docId')
  @UseGuards(JwtAuthGuard)
  freeSlots(@Param('docId', ParseIntPipe) docId: number) {
    return this.availabilityService.findFreeSlotsForDoc(docId);
  }

  // doc removes their own slot
  @Delete(':slotId')
  @Roles(Role.doc)
  @UseGuards(JwtAuthGuard, RolesGuard)
  remove(
    @CurrentUser() user: User,
    @Param('slotId', ParseIntPipe) slotId: number,
  ) {
    return this.availabilityService.remove(user.id, slotId);
  }
}
