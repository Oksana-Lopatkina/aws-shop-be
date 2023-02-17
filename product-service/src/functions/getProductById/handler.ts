import { APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import { DynamoDB } from 'aws-sdk';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

const db = new DynamoDB.DocumentClient();
const TableName = process.env.TABLE_NAME_PRODUCTS;
const getProductById = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { id } = event.pathParameters;
    const data: DynamoDB.DocumentClient.GetItemOutput = await db
        .get({
          TableName,
          Key: {
            id
          },
        })
        .promise();

    if (!data) {
      return formatJSONResponse({
        message: 'Product not found',
        event,
      }, 404);
    }

    return formatJSONResponse({
      data: data.Item,
      event,
    });
  } catch (error) {
    return formatJSONResponse({
      error,
      event,
    }, 500);
  }
};

export const main = middyfy(getProductById);
