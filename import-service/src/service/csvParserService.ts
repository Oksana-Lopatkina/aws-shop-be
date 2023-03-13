import csv from 'csv-parser';
import { sendSQSMessage } from '@service/sqsService';
import { Product } from '../model/Product';

export const parseCsvStream = async (stream: NodeJS.ReadableStream): Promise<Array<Product>> => {
  const parseResult = [];
  return await new Promise((resolve, reject) => {
      stream.pipe(csv())
          .on('data', async (data) => {
              console.info('[parseCsvStream] onData: ', data);
              parseResult.push(data);
              await sendSQSMessage(data);
          })
          .on('end', () => {
              console.log('[parseCsvStream] onEnd: ', parseResult);
              resolve(parseResult);
          })
          .on('error', (error) => {
              console.error('[parseCsvStream] onError: ', error);
              reject(error);
          });
  });
}
