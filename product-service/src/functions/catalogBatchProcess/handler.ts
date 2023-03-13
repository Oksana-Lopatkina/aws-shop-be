// DynamoDB
import { putItem } from '@service/dynamoDBService'
// SQS
import { SQSEvent } from 'aws-lambda';
// SNS
import { sendSNSNotification } from '@service/snsService'
// libs
import { v4 as uuidv4 } from 'uuid';
// interfaces
import { Product } from '../../model/Product';

const catalogBatchProcess = async (event: SQSEvent) => {
  console.log('[catalogBatchProcess] event: ', event);
  try {
    for (const record of event.Records) {
      const i = event.Records.indexOf(record);
      console.info(`[catalogBatchProcess] record ${i}: `, record);

      const product: Product = JSON.parse(record.body);

      // create product in DB
      const id = uuidv4();
      const resultCreateProduct = await putItem(process.env.TABLE_NAME_PRODUCTS, { ...product, id });
      const resultCreateStock = await putItem(process.env.TABLE_NAME_PRODUCTS_STOCK, {
        productId: id,
        count: 1,
      });

      if (resultCreateProduct && resultCreateStock) {
        await sendSNSNotification(record);
      }
    }
  } catch (error) {
    console.error(`[catalogBatchProcess] error: `, error);
  }
};

export const main = catalogBatchProcess;
