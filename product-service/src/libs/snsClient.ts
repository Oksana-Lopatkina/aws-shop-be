import { SNSClient } from "@aws-sdk/client-sns";
// Set the AWS Region.
const REGION = process.env.REGION;
// Create an Amazon DynamoDB service client object.
const snsClient = new SNSClient({ region: REGION });
export { snsClient };
