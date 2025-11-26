import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocRateDto } from './dto/create-doc-rate.dto';

@Injectable()
export class RatingService {
  constructor(private prisma: PrismaService) {}

  async addDocRate(createDocRateDto: CreateDocRateDto) {
    const { docId } = createDocRateDto;

    const rate = await this.prisma.ratings.create({
      data: createDocRateDto,
    });

    if (rate) {
      const avgAndCount = await this.prisma.ratings.aggregate({
        where: {
          docId,
        },
        _count: {
          rate: true,
        },
        _avg: {
          rate: true,
        },
      });

      if (avgAndCount) {
        return this.prisma.docProfile.update({
          where: {
            docId,
          },
          data: {
            rate: avgAndCount._avg.rate,
            ratesLot: avgAndCount._count.rate,
          },
        });
      }
    }
    return rate;
  }
}
