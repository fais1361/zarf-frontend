import { useEffect, useState } from "react";
import { ethers } from "ethers";
import Airdrop from "./Airdrop";

// آدرس قرارداد توکن ZARF
const tokenAddress = "0xFF6fb70f3c458A1a27376FA2F2db9060a01eB14b";
const tokenABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function balanceOf(address) view returns (uint)",
  "function decimals() view returns (uint8)"
];

function App() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [symbol, setSymbol] = useState("");

  const connectWallet = async () => {
    if (!window.ethereum) return alert("لطفاً MetaMask نصب کن");

    try {
      const [selectedAccount] = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(selectedAccount);
    } catch (error) {
      console.error("خطا در اتصال:", error);
    }
  };

  const getTokenBalance = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const tokenContract = new ethers.Contract(tokenAddress, tokenABI, provider);
      const rawBalance = await tokenContract.balanceOf(account);
      const decimals = await tokenContract.decimals();
      const tokenSymbol = await tokenContract.symbol();
      const formatted = ethers.formatUnits(rawBalance, decimals);
      setBalance(formatted);
      setSymbol(tokenSymbol);
    } catch (error) {
      console.error("خطا در گرفتن موجودی:", error);
    }
  };

  useEffect(() => {
    if (account) getTokenBalance();
  }, [account]);

  return (
    <div style={{ padding: 30, fontFamily: "sans-serif", maxWidth: 600, margin: "auto" }}>
      <h1>ZARF Token DApp</h1>

      <button
        onClick={connectWallet}
        style={{ padding: "10px 20px", marginBottom: 20 }}
      >
        {account ? `✅ ${account.slice(0, 6)}...${account.slice(-4)}` : "🔌 اتصال کیف پول"}
      </button>

      {account && (
        <div style={{ marginBottom: 30 }}>
          <p><strong>آدرس:</strong> {account}</p>
          <p><strong>موجودی ZARF:</strong> {balance ?? "در حال بارگذاری..."} {symbol}</p>
        </div>
      )}

      <Airdrop />
    </div>
  );
}

export default App;
