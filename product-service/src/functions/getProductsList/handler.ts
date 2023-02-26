import { APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
// import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

// import schema from './schema';

import { Product } from '../../model/product';
import productsData from '../../store/products.json';
const getProductsList = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const data: Product[] = productsData;

    if (!data) {
      return formatJSONResponse({
        message: 'Not found',
        event,
      }, 404);
    }

    return formatJSONResponse({
      data,
      event,
    });
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(error),
    };
  }
};

export const main = middyfy(getProductsList);
