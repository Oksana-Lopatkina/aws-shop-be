import { APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import { DynamoDB } from 'aws-sdk';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

const db = new DynamoDB.DocumentClient();
const ProductsTableName = process.env.TABLE_NAME_PRODUCTS;
const ProductsStockTableName = process.env.TABLE_NAME_PRODUCTS_STOCK;

import { Product } from '../../model/product';
const getProductsAvailableList = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    console.log('request getProductsAvailableList: ', event);
    const dataProducts: DynamoDB.DocumentClient.ScanOutput = await db
        .scan({
          TableName: ProductsTableName,
        })
        .promise();
    const dataStock: DynamoDB.DocumentClient.ScanOutput = await db
        .scan({
          TableName: ProductsStockTableName,
        })
        .promise();

    if (!dataProducts || !dataStock) {
      return formatJSONResponse({
        message: 'Not found',
        event,
      }, 404);
    }

    dataProducts.Items.forEach((product: Product) => {
      const productCount: number = dataStock.Items.find(stock => stock.productId === product.id)?.count;
      product.count = productCount || 0;
    });
    const data: Product[] = dataProducts?.Items.filter((product: Product) => {
      return product.count > 0;
    });

    return formatJSONResponse({
      data,
      // event,
    });
  } catch (error) {
    return formatJSONResponse({
      error,
      event,
    }, 500);
  }
};

export const main = middyfy(getProductsAvailableList);
