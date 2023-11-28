import {
    BadRequestException,
    Controller,
    FileTypeValidator,
    MaxFileSizeValidator,
    ParseFilePipe,
    Post,
    Res,
    UploadedFile,
    UseInterceptors
} from '@nestjs/common';
import {FileInterceptor} from '@nestjs/platform-express';
import {Response} from 'express';
import {ProcessorService} from './processor.service';
import {getExtension} from '../utils/file';
import {IFailedRecord} from './interfaces/failed.record.interface';

@Controller('processor')
export class ProcessorController {
    constructor(private readonly processorService: ProcessorService) {
    }

    /**
     * Generates PDF report for failed records
     *
     * @param file
     * @param res
     */
    @Post('generate-report')
    @UseInterceptors(FileInterceptor('file', {dest: './uploads'}))
    async generateReport(@UploadedFile(
        new ParseFilePipe({
            validators: [
                new MaxFileSizeValidator({maxSize: 5242880}), //5GB
                new FileTypeValidator({fileType: '.(xml|csv)'}),
            ],
        }),) file: Express.Multer.File, @Res() res: Response) {
        try {
            const extension: string = getExtension(file.originalname);
            let parsedXMLRecords;
            let parsedCSVRecords;
            let failedRecords: IFailedRecord[] = [];

            if (extension === 'xml') {
                parsedXMLRecords = await this.processorService.parseXMLFile(file.path);

                if (parsedXMLRecords[0].records.record) {
                    failedRecords = this.processorService.getFailedXMLRecords(parsedXMLRecords[0].records.record);
                }
            } else {
                parsedCSVRecords = await this.processorService.parseCSVFile(file.path);

                if (parsedCSVRecords.length) {
                    failedRecords = this.processorService.getFailedCSVRecords(parsedCSVRecords);
                }
            }

            return await this.processorService.generateReport(res, failedRecords);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
}
