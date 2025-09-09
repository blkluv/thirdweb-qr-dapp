# QR Payment DApp

A modern, decentralized payment application built with Next.js and thirdweb that enables QR code-based cryptocurrency transactions on the Kaia blockchain. Users can send and receive payments using QR codes with support for multiple tokens including USDC, USDT, and KAI.

## Features

### 💳 **Multi-Token Support**
- **USDC** - USD Coin (6 decimals)
- **USDT** - Tether USD (6 decimals) 
- **KAI** - Native Kaia token (18 decimals)

### 📱 **QR Code Payments**
- **Generate Payment QR**: Create QR codes for payment requests with specified amounts and tokens
- **Scan & Pay**: Scan QR codes to instantly process payments
- **Download QR**: Save payment QR codes as images for sharing

### 💰 **Wallet Integration**
- **Balance Display**: Real-time token balance tracking
- **Transaction History**: Complete transaction log with visual indicators
- **Wallet Connection**: Seamless thirdweb wallet integration



## Application Flow

### 1. **Wallet Connection**
- Connect your wallet using thirdweb's ConnectButton
- View your token balances across all supported tokens
- Refresh balances to get the latest data

### 2. **Sending Payments**
- **Manual Payment**: Enter recipient address and amount directly
- **QR Scan Payment**: Scan a payment QR code to auto-fill payment details
- Select token type and confirm transaction
- View transaction hash and success confirmation

### 3. **Receiving Payments**
- **Generate QR Code**: Specify amount and token for payment request
- **Share QR Code**: Download or copy payment data for sharing
- **Payment Processing**: Recipients can scan your QR to send payment

### 4. **Transaction Management**
- **History View**: See all incoming and outgoing transactions
- **Transaction Details**: View transaction hash, addresses, amounts, and timestamps
- **Block Explorer**: Direct links to Kaia blockchain explorer

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Blockchain**: thirdweb v5, Kaia blockchain
- **UI**: Tailwind CSS, Framer Motion, Lucide React
- **QR Code**: qrcode, html5-qrcode
- **Package Manager**: Yarn

## Prerequisites

- Node.js 18+ 
- Yarn package manager
- Kaia-compatible wallet (MetaMask, etc.)
- thirdweb Client ID

## Installation

1. **Clone the repository**
```bash
git clone https://github.com/Maniteja0126/thirdweb-qr-dapp.git
cd thirdweb-qr-dapp
```

2. **Install dependencies**
```bash
yarn install
```

3. **Environment Setup**
Create a `.env.local` file in the root directory:
```bash
NEXT_PUBLIC_CLIENT_ID=your_thirdweb_client_id
NEXT_PUBLIC_CONTRACT_ADDRESS=your_token_contract_address
```

4. **Get thirdweb Client ID**
- Visit [thirdweb dashboard](https://thirdweb.com/dashboard)
- Create a new project
- Copy your Client ID to the environment file

## Development

**Start development server**
```bash
yarn dev
```

**Build for production**
```bash
yarn build
```

**Start production server**
```bash
yarn start
```

**Code formatting**
```bash
yarn format
```

## Usage

### Making a Payment
1. Connect your wallet
2. Navigate to the "Pay" tab
3. Either:
   - Enter recipient address and amount manually
   - Scan a QR code to auto-fill payment details
4. Select the token type
5. Confirm and send the transaction

### Receiving a Payment
1. Go to the "Receive" tab
2. Select the token and enter the amount
3. Generate the QR code
4. Share the QR code or download it as an image
5. Recipients can scan the QR to send payment

### Viewing History
1. Click on the "History" tab
2. View all your transactions
3. Click on transaction hashes to view on block explorer

## Supported Networks

- **Kaia Mainnet** (Chain ID: 8217)
- **RPC**: https://public-en.node.kaia.io

## Token Configuration

The application supports three tokens configured in `src/config/tokens.ts`:

- **USDC**: `0xe2053bcf56d2030d2470fb454574237cf9ee3d4b`
- **USDT**: `0xd077a400968890eacc75cdc901f0356c943e4fdb`  
- **KAI**: Native token (0x0000000000000000000000000000000000000000)

## Project Structure

```
src/
├── app/
│   ├── client.ts          # thirdweb client configuration
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Main application page
├── components/
│   ├── BalanceDisplay.tsx     # Token balance display
│   ├── PaymentForm.tsx        # Manual payment form
│   ├── QRGenerator.tsx        # QR code generation
│   ├── QRScanner.tsx          # QR code scanning
│   └── TransactionHistory.tsx # Transaction history
└── config/
    └── tokens.ts              # Token configuration
```




