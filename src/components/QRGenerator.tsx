"use client";

import { useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import QRCode from "qrcode";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Copy, QrCode as QrCodeIcon } from "lucide-react";
import { SUPPORTED_TOKENS, TokenConfig } from "@/config/tokens";

export default function QRGenerator() {
  const account = useActiveAccount();
  const [amount, setAmount] = useState<string>("");
  const [selectedToken, setSelectedToken] = useState<TokenConfig>(SUPPORTED_TOKENS[0]);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [paymentData, setPaymentData] = useState<string>("");

  const generateQR = async () => {
    if (!amount || !account) return;

    const data = {
      type: "payment_request",
      amount: amount,
      token: selectedToken.symbol,
      tokenAddress: selectedToken.address,
      tokenDecimals: selectedToken.decimals,
      recipient: account.address,
      timestamp: Date.now(),
    };

    const jsonString = JSON.stringify(data);
    setPaymentData(jsonString);

    try {
      const qrCode = await QRCode.toDataURL(jsonString, {
        width: 300,
        margin: 2,
        color: {
          dark: selectedToken.color || "#000000",
          light: "#FFFFFF",
        },
      });
      setQrCodeDataUrl(qrCode);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  const downloadQR = () => {
    if (qrCodeDataUrl) {
      const link = document.createElement("a");
      link.download = `payment-qr-${amount}-${selectedToken.symbol}.png`;
      link.href = qrCodeDataUrl;
      link.click();
    }
  };

  const copyPaymentData = () => {
    navigator.clipboard.writeText(paymentData);
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
          className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
        >
          <QrCodeIcon className="w-5 h-5 text-white" />
        </motion.div>
        <h3 className="text-xl font-semibold text-white">
          Generate Payment QR
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
                    ? "border-blue-500 bg-blue-500/20 shadow-lg"
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

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Amount ({selectedToken.symbol})
          </label>
          <motion.input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300"
            whileFocus={{ scale: 1.02 }}
          />
        </div>

        <motion.button
          onClick={generateQR}
          disabled={!amount}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <QrCodeIcon className="w-5 h-5" />
          <span>Generate QR Code</span>
        </motion.button>

        <AnimatePresence>
          {qrCodeDataUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="text-center">
                <motion.img
                  src={qrCodeDataUrl}
                  alt="Payment QR Code"
                  className="mx-auto border-2 border-gray-600 rounded-xl shadow-2xl"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
                />
              </div>

              <div className="flex space-x-3">
                <motion.button
                  onClick={downloadQR}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </motion.button>
                <motion.button
                  onClick={copyPaymentData}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Data</span>
                </motion.button>
              </div>

              <div className="bg-gray-700/50 p-4 rounded-xl">
                <p className="text-xs text-gray-400 mb-2">Payment Data:</p>
                <p className="text-xs font-mono text-gray-300 break-all">
                  {paymentData}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}