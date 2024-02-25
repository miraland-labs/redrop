import { AccountInfo } from '@solarti/web3.js';

import { AccountInfo as TokenAccountInfo } from '@solarti/spl-token';

export interface TokenAccount {
  pubkey: string;
  account: AccountInfo<Buffer>;
  info: TokenAccountInfo;
}
