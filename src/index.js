console.log("index.ts exec");
/**
* This shows how to use standard Apollo client on Node.js
*/
global.WebSocket = require('ws');
require('es6-promise').polyfill();
require('isomorphic-fetch');
// Require exports file with endpoint and auth info
var aws_exports = require('./aws-exports')["default"];
// Require AppSync module
var AUTH_TYPE = require('aws-appsync-auth-link/lib/auth-link').AUTH_TYPE;
var AWSAppSyncClient = require('aws-appsync')["default"];
var url = aws_exports.aws_appsync_endpoint;
var region = aws_exports.aws_appsync_region;
// const type = AUTH_TYPE.AWS_IAM;
var type = AUTH_TYPE.API_KEY;
// If you want to use AWS...
var AWS = require('aws-sdk');
AWS.config.update({ region: region });
// Import gql helper and craft a GraphQL query
var gql = require('graphql-tag');
var queries = require('./auto_gerated_codes_apppsync/graphql/queries');
var listEventsQuery = gql(queries.listEvents);
var subscriptions = require('./auto_gerated_codes_apppsync/graphql/subscriptions');
var eventSubscribe = gql(subscriptions.subscribeToEventComments);
// Set up Apollo client
var client = new AWSAppSyncClient({
    url: url,
    region: region,
    auth: {
        type: type,
        apiKey: aws_exports.aws_appsync_apiKey
    }
    //disableOffline: true      //Uncomment for AWS Lambda
});
client.hydrated().then(function (client) {
    //Now run a query
    client.query({ query: listEventsQuery })
        //client.query({ query: query, fetchPolicy: 'network-only' })   //Uncomment for AWS Lambda
        .then(function logData(data) {
        console.log('results of query: ', data);
    })["catch"](console.error);
    //Now subscribe to results
    var observable = client.subscribe({ query: eventSubscribe });
    var realtimeResults = function realtimeResults(data) {
        console.log('realtime data: ', data);
    };
    observable.subscribe({
        next: realtimeResults,
        complete: console.log,
        error: console.log
    });
});
