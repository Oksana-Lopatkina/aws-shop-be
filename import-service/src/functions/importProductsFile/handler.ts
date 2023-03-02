import { s3Client } from "@libs/s3Client";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { SRC_PREFIX, CONTENT_TYPE } from '@setup/constants';

const importProductsFile = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    console.log('importProductsFile event: ', event);
    const { name } = event.queryStringParameters;

    if (!name) {
      return formatJSONResponse({
        message: 'Bad Request: the query param \'name\' is not specified',
      }, 400);
    }

    const s3Params = {
      Bucket : process.env.S3_BUCKET_NAME,
      Key : `${SRC_PREFIX}/${name}`,
      ContentType: CONTENT_TYPE,
    };

    const putCommand = new PutObjectCommand(s3Params);
    const signedUrl = await getSignedUrl(s3Client, putCommand, { expiresIn: 60 });

    return formatJSONResponse({
      url: signedUrl,
    });
  } catch (error) {
    return formatJSONResponse({
      error,
    }, 500);
  }
};

export const main = middyfy(importProductsFile);
