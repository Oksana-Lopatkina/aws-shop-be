import { sqsClient } from  "@libs/sqsClient.js";
import { SendMessageCommand } from  "@aws-sdk/client-sqs";

const QueueUrl = process.env.SQS_URL;

export const sendSQSMessage = async (msg): Promise<void> => {
    try {
        const sendResponse = await sqsClient.send(new SendMessageCommand({
            QueueUrl,
            MessageBody: JSON.stringify(msg),
        }));
        console.log('[sendSQSMessage] Message is sent. sendResponse:', sendResponse);
    } catch (error) {
        console.error('[sendSQSMessage] error: ', error);
    }
}
