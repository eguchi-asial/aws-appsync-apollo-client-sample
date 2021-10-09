console.log(`index.ts exec`)
// apollo-clientのquery内部で使っているfetchがwindowのfetchなので、nodeではpolyfill使う
import 'cross-fetch/polyfill';
import { createAuthLink } from 'aws-appsync-auth-link';
import { createSubscriptionHandshakeLink } from 'aws-appsync-subscription-link';

import { ApolloLink } from 'apollo-link';
import { createHttpLink } from 'apollo-link-http';
import ApolloClient from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';

import appSyncConfig from './aws-exports';
import { AUTH_TYPE } from 'aws-appsync-auth-link';
import { listEvents } from './auto_gerated_codes_apppsync/graphql/queries';
import { gql } from 'graphql-tag';

const url = appSyncConfig.aws_appsync_endpoint;
const region = appSyncConfig.aws_appsync_region;
const auth = {
  // 
  type: AUTH_TYPE.API_KEY as 'API_KEY',
  apiKey: appSyncConfig.aws_appsync_apiKey
};

const httpLink = createHttpLink({
  uri: url
});

const link = ApolloLink.from([
  createAuthLink({ url, region, auth }),
  createSubscriptionHandshakeLink(url, httpLink),
]);

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

//Now run a query
//client.query({ query: query, fetchPolicy: 'network-only' })   //Uncomment for AWS Lambda
client.query({ query: gql(listEvents) })
  .then(function logData({ data }: any) {
    console.log('results of query: ', data.listEvents);
  })
  .catch(console.error);
