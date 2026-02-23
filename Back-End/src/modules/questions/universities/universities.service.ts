import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DrizzleService } from '../../../database/drizzle.service';
import { universities } from '../../../database/entities/universities';
import { eq } from 'drizzle-orm';
import { CreateUniversityDto } from './dto';

@Injectable()
export class UniversitiesService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(dto: CreateUniversityDto) {
    const existing = await this.drizzleService.db.query.universities.findFirst({
      where: eq(universities.name, dto.name),
      columns: { id: true },
    });

    if (existing) {
      throw new ConflictException(`University "${dto.name}" already exists`);
    }

    const [university] = await this.drizzleService.db
      .insert(universities)
      .values({ name: dto.name })
      .returning();

    return university;
  }

  async findAll() {
    return this.drizzleService.db.query.universities.findMany({
      orderBy: (u, { asc }) => [asc(u.name)],
    });
  }

  async findOne(id: number) {
    const university = await this.drizzleService.db.query.universities.findFirst({
      where: eq(universities.id, id),
    });

    if (!university) throw new NotFoundException(`University with ID ${id} not found`);

    return university;
  }

  async remove(id: number) {
    const [deleted] = await this.drizzleService.db
      .delete(universities)
      .where(eq(universities.id, id))
      .returning();

    if (!deleted) throw new NotFoundException(`University with ID ${id} not found`);

    return deleted;
  }
}
