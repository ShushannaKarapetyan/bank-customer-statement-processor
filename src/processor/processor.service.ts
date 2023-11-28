import {Injectable} from '@nestjs/common';
import * as fs from 'fs';
import * as xml2js from 'xml2js';
import * as fastcsv from 'fast-csv';
import * as PDFDocument from 'pdfkit';
import {Response} from 'express';
import {IParsedXMLRecord} from './interfaces/parsed.xml.record.interface';
import {IFailedRecord} from './interfaces/failed.record.interface';
import {IParsedCSVRecord} from './interfaces/parsed.csv.record.interface';

@Injectable()
export class ProcessorService {
    /**
     * Parse the XML file
     *
     * @param filePath
     */
    async parseXMLFile(filePath: string): Promise<any> {
        const parser = new xml2js.Parser({explicitArray: false});

        return new Promise((resolve, reject) => {
            const records: any[] = [];

            const xmlStream = fs.createReadStream(filePath, {encoding: 'utf-8'});
            let xmlChunks = '';

            xmlStream.on('data', (chunk) => {
                xmlChunks += chunk;
                // Process the chunk and parse if necessary (based on your XML structure)
                parser.parseString(xmlChunks, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        // Process the parsed result (record)
                        records.push(result);
                    }
                });
                xmlChunks = ''; // Reset xmlChunks after processing
            });

            xmlStream.on('end', () => {
                resolve(records);
            });

            xmlStream.on('error', (error) => {
                reject(error);
            });
        });
    }

    /**
     * Parse the CSV file
     *
     * @param filePath
     */
    async parseCSVFile(filePath: string): Promise<any[]> {
        const results: any[] = [];

        return new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(fastcsv.parse({headers: true}))
                .on('data', (data) => results.push(data))
                .on('end', () => resolve(results))
                .on('error', (error) => reject(error));
        });
    }

    /**
     * Get all failed XML records
     *
     * @param records
     */
    getFailedXMLRecords(records: IParsedXMLRecord[]): IFailedRecord[] {
        const failedRecords: IFailedRecord[] = [];
        const referenceSet = new Set<string>();

        for (const record of records) {
            //Perform validation checks on each record
            if (referenceSet.has(record['$'].reference) || parseInt(record.endBalance) < 0) {
                failedRecords.push({
                    'reference': record['$']['reference'],
                    'description': record['description'],
                });
            }

            referenceSet.add(record['$'].reference);
        }

        return failedRecords;
    }

    /**
     * Get all failed CSV records
     *
     * @param records
     */
    getFailedCSVRecords(records: IParsedCSVRecord[]): IFailedRecord[] {
        const failedRecords: IFailedRecord[] = [];
        const referenceSet = new Set<string>();

        for (const record of records) {
            //Perform validation checks on each record
            if (referenceSet.has(record.Reference) || parseInt(record['End Balance']) < 0) {
                failedRecords.push({
                    'reference': record.Reference,
                    'description': record.Description,
                });
            }

            referenceSet.add(record.Reference);
        }

        return failedRecords;
    }

    /**
     * Generates PDF report for failed records
     *
     * @param res
     * @param failedRecords
     */
    async generateReport(res: Response, failedRecords: IFailedRecord[]): Promise<void> {
        // Create a PDF document
        const doc = new PDFDocument();
        doc.pipe(res);

        // Add content to the PDF
        doc.fontSize(20).text('Failed Records', {align: 'center'});

        failedRecords.forEach((record: IFailedRecord, index: number) => {
            doc.fontSize(16)
                .text(`Record ${index + 1}: \nreference: ${record.reference}, description: ${record.description}`);
        });

        // Finalize the PDF
        doc.end();

        // Set response headers for PDF file
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="failed_records.pdf"');
    }
}
