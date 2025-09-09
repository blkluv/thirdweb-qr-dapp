"use client";

import { useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import { getContract } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { prepareContractCall, sendTransaction } from "thirdweb";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CreditCard } from "lucide-react";
import { SUPPORTED_TOKENS, TokenConfig } from "@/config/tokens";
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

export default function PaymentForm() {
  const account = useActiveAccount();
  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [selectedToken, setSelectedToken] = useState<TokenConfig>(SUPPORTED_TOKENS[0]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string>("");

  const contract = getContract({
    client: client,
    chain: kaia,
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
    abi: [
      {
        type: "function",
        name: "transfer",
        inputs: [
          { name: "to", type: "address" },
          { name: "amount", type: "uint256" }
        ],
        outputs: [{ name: "success", type: "bool" }],
        stateMutability: "nonpayable",
      },
    ],
  });

  const handlePayment = async () => {
    if (!contract || !recipient || !amount || !account) return;

    setIsLoading(true);
    try {
      const amountInWei = (parseFloat(amount) * Math.pow(10, selectedToken.decimals)).toString();

      const transaction = prepareContractCall({
        contract,
        method: "transfer",
        params: [recipient, BigInt(amountInWei)],
      });

      const result = await sendTransaction({
        transaction,
        account
      });
      setTxHash(result.transactionHash);
      setRecipient("");
      setAmount("");
    } catch (error) {
      console.error("Payment failed:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card"
    >
      <div className="flex items-center space-x-3 mb-6">
        <motion.div
          className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center"
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
        >
          <Send className="w-5 h-5 text-white" />
        </motion.div>
        <h3 className="text-xl font-semibold text-white">
          Send Payment
        </h3>
      </div>

      <div className="space-y-6">
        {/* Token Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Select Token
          </label>
          <div className="grid grid-cols-3 gap-3">
            {SUPPORTED_TOKENS.map((token, index) => (
              <motion.button
                key={token.symbol}
                onClick={() => setSelectedToken(token)}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  selectedToken.symbol === token.symbol
                    ? "border-green-500 bg-green-500/20 shadow-lg"
                    : "border-gray-600 hover:border-gray-500 bg-gray-700/50"
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex items-center space-x-3">
                  <motion.div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: token.color }}
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.3 }}
                  >
                    {token.symbol.charAt(0)}
                  </motion.div>
                  <span className="text-sm font-medium text-white">{token.symbol}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Recipient Address */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Recipient Address
          </label>
          <motion.input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300"
            whileFocus={{ scale: 1.02 }}
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Amount ({selectedToken.symbol})
          </label>
          <motion.input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300"
            whileFocus={{ scale: 1.02 }}
          />
        </div>

        <motion.button
          onClick={handlePayment}
          disabled={!recipient || !amount || isLoading}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <Send className="w-5 h-5" />
          <span>{isLoading ? "Sending..." : "Send Payment"}</span>
        </motion.button>

        <AnimatePresence>
          {txHash && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="bg-green-500/10 border border-green-500/30 rounded-xl p-4"
            >
              <div className="flex items-center space-x-2 mb-2">
                <CreditCard className="w-5 h-5 text-green-400" />
                <h4 className="font-medium text-green-200">Payment Successful!</h4>
              </div>
              <p className="text-sm text-green-300 mb-2">
                Transaction has been sent successfully.
              </p>
              <p className="text-xs text-green-200 break-all font-mono">
                TX: {txHash}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}