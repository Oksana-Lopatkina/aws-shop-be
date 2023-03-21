import type { AWS } from '@serverless/typescript';

import { importFileParser, importProductsFile } from '@functions/index';

const serverlessConfiguration: AWS = {
  service: 'import-service',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-offline'],
  provider: {
    name: 'aws',
    runtime: 'nodejs18.x',
    region: 'us-east-1',
    stage: 'dev',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      S3_BUCKET_NAME: 'aws-shop-catalog',
      REGION: '${self:provider.region}',
      SQS_URL: 'https://sqs.us-east-1.amazonaws.com/${aws:accountId}/aws-shop-catalog-queue',
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: ['s3:ListBucket'],
        Resource: ['arn:aws:s3:::aws-shop-catalog'],
      },
      {
        Effect: 'Allow',
        Action: ['s3:GetObject', 's3:PutObject',  's3:DeleteObject'],
        Resource: ['arn:aws:s3:::aws-shop-catalog/*'],
      },
      {
        Effect: 'Allow',
        Action: ['sqs:*'],
        // Resource: 'arn:aws:sqs:us-east-1:${aws:accountId}:aws-shop-catalog-queue',
        Resource: 'arn:aws:sqs:us-east-1:000296682679:aws-shop-catalog-queue',
      }
    ],
  },
  // import the function via paths
  functions: { importFileParser, importProductsFile },
  resources: {
    Resources: {
      GatewayResponseDefault4XX: {
        Type: "AWS::ApiGateway::GatewayResponse",
        Properties: {
          ResponseParameters: {
            "gatewayresponse.header.Access-Control-Allow-Origin": "'*'",
            "gatewayresponse.header.Access-Control-Allow-Headers": "'*'",
          },
          ResponseType: "DEFAULT_4XX",
          RestApiId: {
            Ref: "ApiGatewayRestApi",
          },
        },
      },
    },
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;
