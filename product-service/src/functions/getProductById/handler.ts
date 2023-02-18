import { ddbDocClient } from "@libs/ddbDocClient";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { GetCommandInput } from "@aws-sdk/lib-dynamodb/dist-types/commands";
import { APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

const getProductById = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { id } = event.pathParameters;

    if (!id) {
      return formatJSONResponse({
        message: 'Bad request',
        event,
      }, 400);
    }

    const paramsProduct: GetCommandInput = {
      TableName: process.env.TABLE_NAME_PRODUCTS,
      Key: {
        id
      },
    };
    const data = await ddbDocClient.send(new GetCommand(paramsProduct));

    if (!data) {
      return formatJSONResponse({
        message: 'Product not found',
        event,
      }, 404);
    }

    return formatJSONResponse({
      data: data.Item,
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
