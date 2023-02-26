import type { AWS } from '@serverless/typescript';

import getProductById  from '@functions/getProductById';
import getProductsList  from '@functions/getProductsList';
import getProductsAvailableList  from '@functions/getProductsAvailableList';

const serverlessConfiguration: AWS = {
  service: 'product-service',
  frameworkVersion: '3',
  plugins: ['serverless-auto-swagger', 'serverless-esbuild', 'serverless-offline'],
  provider: {
    name: 'aws',
    runtime: 'nodejs18.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
  },
  // import the function via paths
  functions: { getProductsList, getProductsAvailableList, getProductById },
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
      // host: 'qrc6eg3r7d.execute-api.us-east-1.amazonaws.com',
    },
  },
};

module.exports = serverlessConfiguration;
