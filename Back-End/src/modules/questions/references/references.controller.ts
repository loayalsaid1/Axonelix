import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { ReferencesService } from './references.service';
import { CreateReferenceDto } from './dto/reference.dto';

@Controller('questions/references')
export class ReferencesController {
  constructor(private readonly referencesService: ReferencesService) { }

  @Get()
  async findAll() {
    return this.referencesService.findAll();
  }

  @Post()
  async create(@Body() dto: CreateReferenceDto) {
    return this.referencesService.create(dto);
  }
}
