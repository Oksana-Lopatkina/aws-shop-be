import { APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
// import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

// import schema from './schema';

import { Product } from '../../model/product';
import productsData from '../../store/products.json';
const getProductById = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { id } = event.pathParameters;
    const data: Product = productsData.find((product: Product) => {
      return product.id === id;
    });

    if (!data) {
      return formatJSONResponse({
        message: 'Product not found',
        event,
      }, 404);
    }

    return formatJSONResponse({
      data,
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
