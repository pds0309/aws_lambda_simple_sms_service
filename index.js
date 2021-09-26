const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = 'covid-sms-user';
 const scanTable = async (tableName) => {
    const params = {
        TableName: tableName,
    };
    const scanResults = [];
    var items;
    do{
        items =  await docClient.scan(params).promise();
        items.Items.forEach((item) => scanResults.push(item));
        params.ExclusiveStartKey  = items.LastEvaluatedKey;
    }while(typeof items.LastEvaluatedKey !== "undefined");
    
    return scanResults;

};
exports.handler = async (event) => {
    return  scanTable(tableName);
};
