"use client";

import { useState, useEffect } from "react";
import { useActiveAccount } from "thirdweb/react";
import { getContract } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { getContractEvents } from "thirdweb";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, RefreshCw, History, ArrowUpRight, ArrowDownLeft } from "lucide-react";
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

interface Transaction {
  transactionHash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
}

export default function TransactionHistory() {
  const account = useActiveAccount();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const contract = getContract({
    client: client,
    chain: kaia,
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
    abi: [
      {
        type: "function",
        name: "balanceOf",
        inputs: [{ name: "account", type: "address" }],
        outputs: [{ name: "balance", type: "uint256" }],
        stateMutability: "view",
      },
      {
        type: "event",
        name: "Transfer",
        inputs: [
          { name: "from", type: "address", indexed: true },
          { name: "to", type: "address", indexed: true },
          { name: "value", type: "uint256", indexed: false },
        ],
      },
    ],
  });

  const fetchTransactions = async () => {
    if (!contract || !account) return;

    setIsLoading(true);
    try {
      const events = await getContractEvents({
        contract,
        fromBlock: "earliest",
        toBlock: "latest",
      });
      
      const allEvents = events.filter((event) => 
        event.eventName === "Transfer" && 
        (event.args.from === account.address || event.args.to === account.address)
      );
      
      const formattedTxs = allEvents.map((event) => ({
        transactionHash: event.transactionHash,
        from: event.args.from,
        to: event.args.to,
        value: (Number(event.args.value) / 1e6).toString(),
        timestamp: Number((event as any).timestamp ?? (event as any).blockTimestamp ?? 0),
      }));

      formattedTxs.sort((a, b) => b.timestamp - a.timestamp);
      setTransactions(formattedTxs.slice(0, 10));
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [contract, account]);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <motion.div
            className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <History className="w-5 h-5 text-white" />
          </motion.div>
          <h3 className="text-xl font-semibold text-white">
            Transaction History
          </h3>
        </div>
        <motion.button
          onClick={fetchTransactions}
          disabled={isLoading}
          className="text-sm text-blue-400 hover:text-blue-300 disabled:opacity-50 transition-colors duration-200 flex items-center space-x-2"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? "Loading..." : "Refresh"}</span>
        </motion.button>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {transactions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <History className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-400 text-lg">No transactions found</p>
              <p className="text-gray-500 text-sm mt-2">
                Your transaction history will appear here
              </p>
            </motion.div>
          ) : (
            transactions.map((tx, index) => (
              <motion.div
                key={tx.transactionHash}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className="border border-gray-700 rounded-xl p-4 hover:bg-gray-700/40 bg-gray-800/60 transition-all duration-300 group"
                whileHover={{ scale: 1.02, x: 5 }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <motion.div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          tx.from.toLowerCase() === account?.address.toLowerCase()
                            ? "bg-red-500/20 text-red-400"
                            : "bg-green-500/20 text-green-400"
                        }`}
                        whileHover={{ rotate: 180 }}
                        transition={{ duration: 0.3 }}
                      >
                        {tx.from.toLowerCase() === account?.address.toLowerCase() ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownLeft className="w-4 h-4" />
                        )}
                      </motion.div>
                      <div>
                        <span
                          className={`text-sm font-medium ${
                            tx.from.toLowerCase() === account?.address.toLowerCase()
                              ? "text-red-400"
                              : "text-green-400"
                          }`}
                        >
                          {tx.from.toLowerCase() === account?.address.toLowerCase()
                            ? "Sent"
                            : "Received"}
                        </span>
                        <p className="text-lg font-bold text-white">
                          {tx.value} USDT
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 space-y-1">
                      <p>From: {formatAddress(tx.from)}</p>
                      <p>To: {formatAddress(tx.to)}</p>
                      <p>{formatDate(tx.timestamp)}</p>
                    </div>
                  </div>
                  <motion.a
                    href={`https://scope.kaia.one/tx/${tx.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </motion.a>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}