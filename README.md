## Description

### Bank Customer Statement Processor
Bank receives monthly deliveries of customer statement records. This information is delivered in two formats, CSV and XML. These records need to be validated.

#### Input
The format of the file is a simplified version of the MT940 format. The format is as follows:
#### Transaction reference - A numeric value
#### Account number - An IBAN
#### Start Balance - The starting balance in Euros
#### Mutation - Either an addition (+) or a deduction (-)
#### Description - Free text
#### End Balance - The end balance in Euros 

#### Output
There are two validations:

1. all transaction references should be unique

2. the end balance needs to be validated

At the end of the processing, a report needs to be created which will display both the transaction reference and description of each of the failed records.

## Ideas and the approach I used
1. First, I implement uploading for XML and CSV files and also have validation for file types.
2. Then I do file parsing to work with the data. 
3. After that I do validation for each record. I check that the reference is unique and the end balance is not less than 0, and I collect failed records.
4. At the end, I generate a pdf report and show failed records.

I used **xml2js** package to parse the XML file. 
I used **fast-csv** package to parse the CSV file.
I used **pdfkit** package to generate PDF report for failed records.

The project includes a postman collection, so you can use that. You need to upload the file(XML or CSV) and it will generate a report for failed records.

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```
