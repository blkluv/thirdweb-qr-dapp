export interface TokenConfig {
    symbol: string;
    name: string;
    address: string;
    decimals: number;
    logoUrl?: string;
    color?: string;
  }
  
  export const SUPPORTED_TOKENS: TokenConfig[] = [
    {
      symbol: "USDC",
      name: "USD Coin",
      address: "0xe2053bcf56d2030d2470fb454574237cf9ee3d4b",
      decimals: 6,
      color: "#2775CA",
    },
    {
      symbol: "USDT",
      name: "Tether USD",
      address: "0xd077a400968890eacc75cdc901f0356c943e4fdb",
      decimals: 6,
      color: "#26A17B",
    },
    {
      symbol: "KAI",
      name: "Kaia",
      address: "0x0000000000000000000000000000000000000000", 
      decimals: 18,
      color: "#00D4AA",
    },
  ];
  
  export const getTokenBySymbol = (symbol: string): TokenConfig | undefined => {
    return SUPPORTED_TOKENS.find(token => token.symbol === symbol);
  };
  
  export const getTokenByAddress = (address: string): TokenConfig | undefined => {
    return SUPPORTED_TOKENS.find(token => token.address.toLowerCase() === address.toLowerCase());
  };