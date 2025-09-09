"use client";

import { useState, useEffect } from "react";
import { useActiveAccount } from "thirdweb/react";
import { getContract } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { readContract } from "thirdweb";
import { motion, AnimatePresence } from "framer-motion";
import { SUPPORTED_TOKENS, TokenConfig } from "../config/tokens";
import { client } from "@/app/client";

const kaia = defineChain({
  id: 8217,
  name: "Kaia",
  rpc: "https://public-en.node.kaia.io",
  nativeCurrency: {
    name: "Kaia",
    symbol: "KAI",
    decimals: 18,
  },
});

interface TokenBalance {
  token: TokenConfig;
  balance: string;
  isLoading: boolean;
}

export default function BalanceDisplay() {
  const account = useActiveAccount();
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBalances = async () => {
    if (!account) return;

    setIsLoading(true);
    const balancePromises = SUPPORTED_TOKENS.map(async (token) => {
      try {
        if (token.symbol === "KAI") {
          const response = await fetch(kaia.rpc, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_getBalance',
              params: [account.address, 'latest'],
              id: 1
            })
          });
          const data = await response.json();
          console.log(data);
          const balance = parseInt(data.result, 16) / Math.pow(10, token.decimals);
          
          return {
            token,
            balance: balance > 0 ? balance.toFixed(6) : "0",
            isLoading: false,
          };
        } else {
          if (!token.address || token.address === "" || token.address === "0x0000000000000000000000000000000000000000") {
            return {
              token,
              balance: "0",
              isLoading: false,
            };
          }

          const contract = getContract({
            client,
            chain: kaia,
            address: token.address,
            abi: [
              {
                type: "function",
                name: "balanceOf",
                inputs: [{ name: "account", type: "address" }],
                outputs: [{ name: "balance", type: "uint256" }],
                stateMutability: "view",
              },
            ],
          });

          const balance = await readContract({
            contract,
            method: "balanceOf",
            params: [account.address],
          });

          const formattedBalance = Number(balance) / Math.pow(10, token.decimals);
          
          return {
            token,
            balance: formattedBalance > 0 ? formattedBalance.toFixed(6) : "0",
            isLoading: false,
          };
        }
      } catch (error) {
        console.error(`Error fetching ${token.symbol} balance:`, error);
        return {
          token,
          balance: "0",
          isLoading: false,
        };
      }
    });

    const results = await Promise.all(balancePromises);
    setBalances(results);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBalances();
  }, [account]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-white">Balances</h3>
        <motion.button
          onClick={fetchBalances}
          disabled={isLoading}
          className="text-sm text-blue-400 hover:text-blue-300 disabled:opacity-50 transition-colors duration-200"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isLoading ? "Loading..." : "Refresh"}
        </motion.button>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {balances.map(({ token, balance, isLoading: tokenLoading }, index) => (
            <motion.div
              key={token.symbol}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl hover:bg-gray-700/70 transition-all duration-300"
              whileHover={{ scale: 1.02, x: 5 }}
            >
              <div className="flex items-center space-x-4">
                <motion.div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg"
                  style={{ backgroundColor: token.color }}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  {token.symbol.charAt(0)}
                </motion.div>
                <div>
                  <p className="font-semibold text-white">{token.symbol}</p>
                  <p className="text-xs text-gray-400">{token.name}</p>
                </div>
              </div>
              <div className="text-right">
                <motion.p
                  className="font-bold text-white text-lg"
                  key={balance}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {tokenLoading ? "..." : `${balance}`}
                </motion.p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}