import { ddbDocClient } from "@libs/ddbDocClient";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { PutCommandInput } from "@aws-sdk/lib-dynamodb/dist-types/commands";
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { v4 as uuidv4 } from 'uuid';
import schema from './schema';

const createProduct: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  try {
    console.log('request createProduct: ', event);
    const id = uuidv4();
    const { count, ...product } = event.body;

    if (product.article && product.title && product.description && product.image && product.price && count) {
        const paramsProduct: PutCommandInput = {
            TableName: process.env.TABLE_NAME_PRODUCTS,
            Item: { id, ...product },
        };
        const putResultProduct = await ddbDocClient.send(new PutCommand(paramsProduct));

        const putResultStock = await ddbDocClient.send(new PutCommand({
            TableName: process.env.TABLE_NAME_PRODUCTS_STOCK,
            Item: {
                productId: id,
                count,
            },
        }));

        return formatJSONResponse({
            data: { putResultProduct, putResultStock},
            // event,
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
