import { APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import { DynamoDB } from 'aws-sdk';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
// models
import { Product } from "../../model/Product";

const db = new DynamoDB.DocumentClient();
const ProductsTableName = process.env.TABLE_NAME_PRODUCTS;
const ProductsStockTableName = process.env.TABLE_NAME_PRODUCTS_STOCK;

const getProductsList = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    console.log('request getProductsList: ', event);
    const dataProducts: DynamoDB.ScanOutput = await db
        .scan({
          TableName: ProductsTableName,
        })
        .promise();
    const dataStock: DynamoDB.ScanOutput = await db
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

    const data: Product[] = dataProducts.Items.map((product: Product) => {
      const productCount: number = dataStock.Items.find(stock => stock.productId === product.id)?.count;
      product.count = productCount || 0;
      return product;
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

export const main = middyfy(getProductsList);
