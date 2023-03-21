import { ddbDocClient } from "@libs/ddbDocClient";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

export const putItem = async (TableName, Item): Promise<boolean> => {
    try {
        const data = await ddbDocClient.send(new PutCommand({ TableName, Item }));
        console.log('[dynamoDBService: putItem] Success - item added or updated: ', data);
        return true;
    } catch (error) {
        console.log('[dynamoDBService: putItem] Error: ', error);
        return false;
    }
};
