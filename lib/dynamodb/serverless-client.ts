import * as AWS from 'aws-sdk';

const localOptions = {
    region: "localhost",
    endpoint: "http://localhost:8000",    
    accessKeyId: "123",
    secretAccessKey: "456",
};

const productionOptions = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
};

const commonOptions = {

};

const options = process.env.IS_OFFLINE
    ? {...localOptions, ...commonOptions}
    : {...productionOptions, ...commonOptions};

export const db = {
    doc: new AWS.DynamoDB.DocumentClient(options),
    raw: new AWS.DynamoDB(options),
};