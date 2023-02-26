import { ddbDocClient } from "@libs/ddbDocClient";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
// models
import { Product } from "../../model/Product";

const getProductDataByID = async (id: string): Promise<Product> => {
  const { Item } = await ddbDocClient.send(new GetCommand({
    TableName: process.env.TABLE_NAME_PRODUCTS,
    Key: {
      id
    },
  }));
  return Item as Product;
}

const getStockDataByID = async (productId: string): Promise<number> => {
  const { Item } = await ddbDocClient.send(new GetCommand({
    TableName: process.env.TABLE_NAME_PRODUCTS_STOCK,
    Key: {
      productId
    },
  }));
  return (Item && Item.count) || 0;
}
const getProductById = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { id } = event.pathParameters;

    if (!id) {
      return formatJSONResponse({
        message: 'Bad request: ID is not specified',
        event,
      }, 400);
    }

    const product: Product = await getProductDataByID(id);
    const count: number = await getStockDataByID(id);

    if (!product) {
      return formatJSONResponse({
        message: 'Product not found',
        event,
      }, 404);
    }

    return formatJSONResponse({
      data: { ...product, count },
      // event,
    });
  } catch (error) {
    return formatJSONResponse({
      error,
      event,
    }, 500);
  }
};

export const main = middyfy(getProductById);
