export interface Message {
  title: string,
  text: string;
  image: { base64: string, color: string },
  tokenId: string,
}

export type NotifType = 'all' | 'bids' | 'sales' | 'offers';

export interface Channel {
  channelId: string,
  type: NotifType,
}