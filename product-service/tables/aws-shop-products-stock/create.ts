const AWS = require('aws-sdk');

const dynamoDB = new AWS.DynamoDB({ region: "us-east-1" });
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

dynamoDB
    .createTable(params)
    .promise()
    .then(data => console.log("Success!", data))
    .catch(console.error);
