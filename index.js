"use strict";
/**
* This shows how to use standard Apollo client on Node.js
*/

global.WebSocket = require('ws');
require('es6-promise').polyfill();
require('isomorphic-fetch');

// Require exports file with endpoint and auth info
const aws_exports = require('./aws-exports').default;

// Require AppSync module
const AUTH_TYPE = require('aws-appsync-auth-link/lib/auth-link').AUTH_TYPE;
const AWSAppSyncClient = require('aws-appsync').default;

const url = aws_exports.aws_appsync_endpoint;
const region = aws_exports.aws_appsync_region;
// const type = AUTH_TYPE.AWS_IAM;
const type = AUTH_TYPE.API_KEY;

// If you want to use AWS...
const AWS = require('aws-sdk');
AWS.config.update({ region });

// Import gql helper and craft a GraphQL query
const gql = require('graphql-tag');
const queries = require('./auto_gerated_codes_apppsync/graphql/queries')
const listEventsQuery = gql(queries.listEvents);

const subscriptions = require('./auto_gerated_codes_apppsync/graphql/subscriptions')
const eventSubscribe = gql(subscriptions.subscribeToEventComments)

// Set up Apollo client
const client = new AWSAppSyncClient({
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
    })
    .catch(console.error);

  //Now subscribe to results
  const observable = client.subscribe({ query: eventSubscribe });

  const realtimeResults = function realtimeResults(data) {
    console.log('realtime data: ', data);
  };

  observable.subscribe({
    next: realtimeResults,
    complete: console.log,
    error: console.log,
  });
});
