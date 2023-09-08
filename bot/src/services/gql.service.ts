import { Injectable } from '@nestjs/common';

import { GraphQLClient, gql } from 'graphql-request';

import dotenv from 'dotenv';
import { AuctionData } from 'src/interfaces/gql.interface';
dotenv.config();

const endpoint = process.env.GRAPHQL_ENDPOINT;
const graphQLClient = new GraphQLClient(endpoint);

@Injectable()
export class GraphQLService {

  async getAuction(id: string): Promise<any> {
    const auctionQuery = gql`
      {
        auction(id: "${id}") {
          id
          amount
          endTime
          startTime
          settled
          bidder {
            id
          }
          phunk {
            id
          }
          bids {
            amount
          }
        }
      }
    `;

    const data: any = await graphQLClient.request(auctionQuery);
    return data?.auction as AuctionData;
  }
}