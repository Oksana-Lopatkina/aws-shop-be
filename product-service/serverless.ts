import type { AWS } from '@serverless/typescript';

import {
  createProduct,
  getProductById,
  getProductsList,
  getProductsAvailableList,
  catalogBatchProcess,
}  from '@functions/index';

const serverlessConfiguration: AWS = {
  service: 'product-service',
  frameworkVersion: '3',
  plugins: ['serverless-auto-swagger', 'serverless-esbuild', 'serverless-offline'],
  provider: {
    name: 'aws',
    runtime: 'nodejs18.x',
    region: 'us-east-1',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      TABLE_NAME_PRODUCTS: 'aws-shop-products',
      TABLE_NAME_PRODUCTS_STOCK: 'aws-shop-products-stock',
      REGION: '${self:provider.region}',
      SNS_ARN: {
        Ref: 'SNSCreateProductTopic'
      },
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: 'dynamodb:*',
        Resource: ['*'],
      },
      {
        Effect: 'Allow',
        Action: 'sqs:*',
        Resource: [
          { 'Fn::GetAtt': ['SQSCatalogItemsQueue', 'Arn'] },
        ],
      },
      {
        Effect: 'Allow',
        Action: 'sns:*',
        Resource: [
          { Ref: 'SNSCreateProductTopic' },
        ],
      },
    ],
  },
  resources: {
    Resources: {
      SQSCatalogItemsQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 'aws-shop-catalog-queue',
        }
      },
      SNSCreateProductTopic : {
        Type: 'AWS::SNS::Topic',
        Properties: {
          TopicName: 'aws-shop-create-product-topic',
        }
      },
      SNSSubscriptionPriceUnder20: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: 'Oksana_Lopatkina@epam.com',
          Protocol: 'email',
          TopicArn: {
            Ref: 'SNSCreateProductTopic',
          },
          FilterPolicy: {
            price: [{"numeric": ["<", 20]}],
          },
        }
      },
      SNSSubscriptionPriceOver20: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: 'oxy86xxl@mail.ru',
          Protocol: 'email',
          TopicArn: {
            Ref: 'SNSCreateProductTopic',
          },
          FilterPolicy: {
            price: [{"numeric": [">=", 20]}],
          },
        }
      }
    }
  },
  // import the function via paths
  functions: {
    createProduct,
    getProductsList,
    getProductsAvailableList,
    getProductById,
    catalogBatchProcess,
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
    autoswagger: {
      useStage: true,
      basePath: '/dev',
      typefiles: ['./src/model/Product.ts' ],
      apiType: 'http',
    },
  },
};

module.exports = serverlessConfiguration;
