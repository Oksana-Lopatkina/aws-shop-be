import { s3Client } from "@libs/s3Client";
import {
    GetObjectCommand,
    CopyObjectCommand,
    DeleteObjectCommand,
    GetObjectCommandOutput
} from "@aws-sdk/client-s3";
import { parseCsvStream } from '@service/csvParserService';
import { S3CreateEvent } from 'aws-lambda';
import { SRC_PREFIX, DEST_PREFIX } from '@setup/constants';

const Bucket = process.env.S3_BUCKET_NAME;
const importFileParser = async (event: S3CreateEvent): Promise<void> => {
    console.log('[importFileParser] event: ', event);
    try {
        for (const record of event.Records) {
            const Key = record.s3.object.key;

            if (Key.endsWith('.csv')) {
                // GET the object from the Amazon S3 bucket
                const getObjectResult: GetObjectCommandOutput = await s3Client.send(new GetObjectCommand({
                    Bucket,
                    Key,
                }));
                const parseResult = await parseCsvStream(getObjectResult.Body as NodeJS.ReadableStream);
                console.log('[importFileParser] parseResult: ', parseResult);

                // COPY the object from the folder 'uploaded' to the 'parsed'
                const copyParams = {
                    Bucket,
                    CopySource: `${Bucket}/${Key}`,
                    Key: Key.replace(SRC_PREFIX, DEST_PREFIX),
                };
                await s3Client.send(new CopyObjectCommand(copyParams));

                // DELETE the parsed object from the folder 'uploaded'
                const deleteParams = {
                    Bucket,
                    Key,
                };
                await s3Client.send(new DeleteObjectCommand(deleteParams));
            } else {
                console.error('Error (importFileParser): The object is not .csv file');
            }
        }
    } catch (err) {
        console.error('Error (importFileParser): ', err);
    }
};

export const main = importFileParser;
