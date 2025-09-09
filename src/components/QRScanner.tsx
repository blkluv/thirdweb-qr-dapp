"use client";

import { useState, useRef, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, Send, X, Camera, CheckCircle } from "lucide-react";
import { useActiveAccount } from "thirdweb/react";
import { getContract } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { prepareContractCall, sendTransaction } from "thirdweb";
import { SUPPORTED_TOKENS } from "@/config/tokens";
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

interface PaymentData {
  type: string;
  amount: string;
  token: string;
  tokenAddress: string;
  tokenDecimals: number;
  recipient: string;
  timestamp: number;
}

export default function QRScanner() {
  const account = useActiveAccount();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string>("");
  const [parsedPayment, setParsedPayment] = useState<PaymentData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState<string>("");
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const startScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }

    setTimeout(() => {
      const qrElement = document.getElementById("qr-reader");
      if (!qrElement) {
        console.error("QR reader element not found");
        return;
      }

      qrElement.innerHTML = "";

      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        {
          qrbox: { width: 250, height: 250 },
          fps: 5,
        },
        false
      );

      scannerRef.current.render(
        (decodedText) => {
          setScannedData(decodedText);
          setIsScanning(false);
          if (scannerRef.current) {
            scannerRef.current.clear();
            scannerRef.current = null;
          }
          
          try {
            const paymentData = JSON.parse(decodedText);
            if (paymentData.type === "payment_request") {
              setParsedPayment(paymentData);
            }
          } catch (error) {
            alert("Invalid QR code format");
          }
        },
        (error) => {
          console.log("QR scan error:", error);
        }
      );

      setIsScanning(true);
    }, 100);
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const processPayment = async () => {
    if (!parsedPayment || !account) return;

    setIsProcessing(true);
    try {
      const token = SUPPORTED_TOKENS.find(t => t.symbol === parsedPayment.token);
      if (!token) {
        alert("Unsupported token");
        return;
      }

      if (token.symbol === "KAI") {
        const transaction = prepareContractCall({
          contract: getContract({
            client,
            chain: kaia,
            address: parsedPayment.recipient,
          }),
          method: "transfer" as any,
          params: [parsedPayment.amount],
          value: BigInt(parseFloat(parsedPayment.amount) * Math.pow(10, token.decimals)),
        });

        const result = await sendTransaction({
          transaction,
          account,
        });

        setTxHash(result.transactionHash);
      } else {
        const contract = getContract({
          client,
          chain: kaia,
          address: token.address,
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

        const amountInWei = BigInt(parseFloat(parsedPayment.amount) * Math.pow(10, token.decimals));
        
        const transaction = prepareContractCall({
          contract,
          method: "transfer",
          params: [parsedPayment.recipient, amountInWei],
        });

        const result = await sendTransaction({
          transaction,
          account,
        });

        setTxHash(result.transactionHash);
      }

      setParsedPayment(null);
      setScannedData("");
    } catch (error) {
      console.error("Payment failed:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetScanner = () => {
    setScannedData("");
    setParsedPayment(null);
    setTxHash("");
    setIsScanning(false);
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card"
    >
      <div className="flex items-center space-x-3 mb-6">
        <motion.div
          className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center"
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
        >
          <QrCode className="w-5 h-5 text-white" />
        </motion.div>
        <h3 className="text-xl font-semibold text-white">
          Scan Payment QR
        </h3>
      </div>

      <div className="space-y-6">
        <div 
          id="qr-reader" 
          className={`w-full ${isScanning ? 'block' : 'hidden'} bg-gray-900 rounded-xl border border-gray-700 p-4`}
        ></div>

        {!isScanning && !scannedData && !parsedPayment && (
          <motion.button
            onClick={startScanning}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Camera className="w-5 h-5" />
            <span>Start Scanning</span>
          </motion.button>
        )}

        {isScanning && (
          <motion.button
            onClick={stopScanning}
            className="w-full bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <X className="w-5 h-5" />
            <span>Stop Scanning</span>
          </motion.button>
        )}

        <AnimatePresence>
          {parsedPayment && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-blue-400" />
                  <h4 className="font-medium text-blue-200">Payment Request Detected</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-300">Amount:</span>
                    <span className="font-medium text-white">{parsedPayment.amount} {parsedPayment.token}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-300">To:</span>
                    <span className="font-mono text-xs text-gray-300">{parsedPayment.recipient.slice(0, 6)}...{parsedPayment.recipient.slice(-4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-300">Token:</span>
                    <span className="font-medium text-white">{parsedPayment.token}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <motion.button
                  onClick={processPayment}
                  disabled={isProcessing}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send className="w-4 h-4" />
                  <span>{isProcessing ? "Processing..." : "Send Payment"}</span>
                </motion.button>
                <motion.button
                  onClick={resetScanner}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
                <CheckCircle className="w-5 h-5 text-green-400" />
                <h4 className="font-medium text-green-200">Payment Successful!</h4>
              </div>
              <p className="text-sm text-green-300 mb-2">
                Transaction has been sent successfully.
              </p>
              <p className="text-xs text-green-200 break-all font-mono mb-3">
                TX: {txHash}
              </p>
              <motion.button
                onClick={resetScanner}
                className="text-sm text-green-300 hover:text-green-200 underline transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Scan Another QR
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {scannedData && !parsedPayment && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4"
            >
              <div className="flex items-center space-x-2 mb-2">
                <QrCode className="w-5 h-5 text-yellow-400" />
                <p className="text-sm text-yellow-200 font-medium">QR Code Scanned Successfully!</p>
              </div>
              <p className="text-xs text-yellow-200 break-all mb-3 font-mono">
                {scannedData}
              </p>
              <motion.button
                onClick={resetScanner}
                className="text-sm text-yellow-300 hover:text-yellow-200 underline transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Scan Another
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}