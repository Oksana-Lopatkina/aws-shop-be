import { ddbDocClient } from "@libs/ddbDocClient";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ScanCommandInput } from "@aws-sdk/lib-dynamodb/dist-types/commands";
import { APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
// models
import { Product } from "../../model/Product";

const paramsProducts: ScanCommandInput = {
  TableName: process.env.TABLE_NAME_PRODUCTS,
};

const paramsStock: ScanCommandInput = {
  TableName: process.env.TABLE_NAME_PRODUCTS_STOCK,
};

const getProductsList = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    console.log('request getProductsList: ', event);
    const dataProducts = await ddbDocClient.send(new ScanCommand(paramsProducts));
    const dataStock = await ddbDocClient.send(new ScanCommand(paramsStock));

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
