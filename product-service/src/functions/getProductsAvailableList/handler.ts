import { APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
// import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

// import schema from './schema';

import { Product } from '../../model/product';
import productsData from '../../store/products.json';
const getProductsAvailableList = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const data: Product[] = productsData?.filter((product: Product) => {
      return product.count > 0;
    });

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
    return formatJSONResponse({
      error,
      event,
    }, 500);
  }
};

export const main = middyfy(getProductsAvailableList);
