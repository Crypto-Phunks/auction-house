import { NgModule } from '@angular/core';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { ApolloClientOptions, InMemoryCache } from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';

const uri = 'https://api.studio.thegraph.com/query/4302/crypto-phunks-auction-house/v0.0.1';

export function createApollo(httpLink: HttpLink): ApolloClientOptions<any> {
  return {
    link: httpLink.create({ uri }),
    cache: new InMemoryCache(),
    defaultOptions: {
      query: {
        fetchPolicy: 'network-only'
      }
    }
  };
}

@NgModule({
  exports: [ApolloModule],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink],
    }
  ]
})
export class GraphQLModule {}
