import { PublishCommand } from '@aws-sdk/client-sns';
import { snsClient } from "@libs/snsClient.js";

const TopicArn = process.env.SNS_ARN;

export const sendSNSNotification = async (msg): Promise<void> => {
    try {
        console.log('[sendSNSNotification] msg: ', msg);
        console.log('[sendSNSNotification] msg: ', JSON.parse(msg.body).price);
        const snsPublishData = await snsClient.send(new PublishCommand({
            Subject: 'A product is added to DB',
            Message: JSON.stringify(`
              MessageId: ${msg.messageId},
              Body: ${msg.body}
            `),
            TopicArn,
            MessageAttributes: {
                price: {
                    DataType: 'Number',
                    StringValue: JSON.parse(msg.body).price,
                },
            },
        }));
        console.log("[snsService: sendSNSNotification] Success: ",  snsPublishData);
    } catch (error) {
        console.error("[snsService: sendSNSNotification] Error: ",  error);
    }
}
