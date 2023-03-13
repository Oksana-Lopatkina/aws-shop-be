// DynamoDB
import { putItem } from '@service/dynamoDBService'
// libs
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { v4 as uuidv4 } from 'uuid';
import schema from './schema';

const createProduct: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  try {
    console.log('request [createProduct]: ', event);
    const { count, ...product } = event.body;

    if (product.article && product.title && product.description && product.image && product.price && count) {
        const id = uuidv4();
        await putItem(process.env.TABLE_NAME_PRODUCTS, { ...product, id });
        await putItem(process.env.TABLE_NAME_PRODUCTS_STOCK, {
            productId: id,
            count,
        });

        return formatJSONResponse({
            message: 'A product has been created',
        });
    }

    return formatJSONResponse({
      message: 'Bad Request',
      event,
    }, 400);
  } catch (error) {
    return formatJSONResponse({
      error,
      event,
    }, 500);
  }
};

export const main = middyfy(createProduct);
