import { ddbDocClient } from "@libs/ddbDocClient";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

const getProductsData = async (): Promise<Product[]> => {
  const { Items } = await ddbDocClient.send(new ScanCommand({
    TableName: process.env.TABLE_NAME_PRODUCTS
  }))
  return Items as Product[];
}

const getStockData = async (): Promise<ProductCount[]> => {
  const { Items } = await ddbDocClient.send(new ScanCommand({
    TableName: process.env.TABLE_NAME_PRODUCTS_STOCK
  }))
  return Items as ProductCount[];
}

import {Product, ProductCount} from '../../model/product';
const getProductsAvailableList = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    console.log('request getProductsAvailableList: ', event);
    const dataProducts: Product[] = await getProductsData();
    const dataStock: ProductCount[] = await getStockData();

    if (!dataProducts) {
      return formatJSONResponse({
        message: 'Products not found',
        event,
      }, 404);
    }

    if (!dataStock) {
      return formatJSONResponse({
        message: 'Stock data not found',
        event,
      }, 404);
    }

    dataProducts.forEach((product: Product) => {
      const productCount: number = dataStock.find(stock => stock.productId === product.id)?.count;
      product.count = productCount || 0;
    });
    const data: Product[] = dataProducts?.filter((product: Product) => {
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
