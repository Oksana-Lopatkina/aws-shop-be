import { CreateTableCommand } from "@aws-sdk/client-dynamodb";
import { ddbClient } from "@libs/ddbClient";

// Set the parameters
const params = {
    TableName: "aws-shop-products-stock",
    AttributeDefinitions: [
        {
            AttributeName: "productId",
            AttributeType: "S",
        },
    ],
    KeySchema: [
        {
            AttributeName: "productId",
            KeyType: "HASH",
        },
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1,
    },
};

export const run = async () => {
    try {
        const data = await ddbClient.send(new CreateTableCommand(params));
        console.log("Table Created", data);
        return data;
    } catch (err) {
        console.log("Error", err);
    }
};
run();
