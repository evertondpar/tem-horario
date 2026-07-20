import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CollaboratorServiceService } from './collaborator-service.service';
import { CreateCollaboratorServiceDto } from './dto/create-collaborator-service.dto';
import { UpdateCollaboratorServiceDto } from './dto/update-collaborator-service.dto';

@Controller('collaborator-service')
export class CollaboratorServiceController {
  constructor(private readonly collaboratorServiceService: CollaboratorServiceService) {}

  @Post()
  create(@Body() createCollaboratorServiceDto: CreateCollaboratorServiceDto) {
    return this.collaboratorServiceService.create(createCollaboratorServiceDto);
  }

  @Get()
  findAll() {
    return this.collaboratorServiceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.collaboratorServiceService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCollaboratorServiceDto: UpdateCollaboratorServiceDto) {
    return this.collaboratorServiceService.update(+id, updateCollaboratorServiceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.collaboratorServiceService.remove(+id);
  }
}
