// import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import type { ValidatedEventAPIGatewayProxyEvent } from '@/libs/apiGateway';
import { DynamoDB } from 'aws-sdk';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { v4 as uuidv4 } from 'uuid';
import schema from './schema';
// models
import { Product } from '../../model/product';

const db = new DynamoDB.DocumentClient();
const ProductsTableName = process.env.TABLE_NAME_PRODUCTS;
const ProductsStockTableName = process.env.TABLE_NAME_PRODUCTS_STOCK;
const createProduct: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  try {
    console.log('request createProduct: ', event);
    const id = uuidv4();

    const product: Product = event.body;

    if (product.article && product.title && product.description && product.image && product.price && product.count) {
        const putResultProduct: DynamoDB.PutItemOutput = await db
            .put({
                TableName: ProductsTableName,
                Item: {
                    id,
                    title: product.title,
                    article: product.article,
                    description: product.description,
                    image: product.image,
                    price: product.price,
                },
            })
            .promise();

        const putResultStock: DynamoDB.DocumentClient.PutItemOutput = await db
            .put({
                TableName: ProductsStockTableName,
                Item: {
                    productId: id,
                    count: product.count,
                },
            })
            .promise();

        return formatJSONResponse({
            data: putResultProduct,
            event,
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
