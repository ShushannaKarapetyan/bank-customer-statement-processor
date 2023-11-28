import { Module } from '@nestjs/common';
import { ProcessorService } from './processor.service';
import { ProcessorController } from './processor.controller';
import {MulterModule} from "@nestjs/platform-express";

@Module({
  imports:[
    MulterModule.register({
      dest: './uploads', // Destination directory for uploaded files
    }),
  ],
  controllers: [ProcessorController],
  providers: [ProcessorService],
})
export class ProcessorModule {}
