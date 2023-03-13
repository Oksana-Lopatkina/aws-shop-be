import { SQSClient } from "@aws-sdk/client-sqs";
// Set the AWS Region.
const REGION = process.env.REGION;
// Create an Amazon DynamoDB service client object.
const sqsClient = new SQSClient({ region: REGION });
export { sqsClient };
