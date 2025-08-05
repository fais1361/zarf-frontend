import { useState, useEffect } from "react";
import { ethers } from "ethers";

const tokenAddress = "0xFF6fb70f3c458A1a27376FA2F2db9060a01eB14b";
const tokenABI = [
  "function transfer(address to, uint amount) returns (bool)",
  "function decimals() view returns (uint8)"
];

export default function Airdrop() {
  const [walletAddress, setWalletAddress] = useState("");
  const [airdrops, setAirdrops] = useState([]);
  const [status, setStatus] = useState("");

  // Load saved addresses from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("airdrops");
    if (saved) setAirdrops(JSON.parse(saved));
  }, []);

  // Save airdrops to localStorage on change
  useEffect(() => {
    localStorage.setItem("airdrops", JSON.stringify(airdrops));
  }, [airdrops]);

  const sendTokens = async (to) => {
    if (!window.ethereum) {
      setStatus("MetaMask نصب نیست.");
      return false;
    }
    try {
      setStatus("در حال ارسال تراکنش...");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(tokenAddress, tokenABI, signer);

      const decimals = await contract.decimals();
      const amount = ethers.parseUnits("100", decimals); // 100 ZARF برای ایردراپ

      const tx = await contract.transfer(to, amount);
      await tx.wait();

      setStatus("ارسال موفق! Tx Hash: " + tx.hash);
      return true;
    } catch (error) {
      setStatus("خطا در ارسال: " + error.message);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ethers.isAddress(walletAddress)) {
      setStatus("آدرس کیف پول نامعتبر است.");
      return;
    }
    if (airdrops.includes(walletAddress.toLowerCase())) {
      setStatus("این آدرس قبلاً ثبت شده است.");
      return;
    }

    const success = await sendTokens(walletAddress);
    if (success) {
      setAirdrops(prev => [...prev, walletAddress.toLowerCase()]);
      setWalletAddress("");
    }
  };

  return (
    <div style={{marginTop: 30, maxWidth: 400}}>
      <h2>فرم ایردراپ ZARF</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="آدرس کیف پول"
          value={walletAddress}
          onChange={e => setWalletAddress(e.target.value)}
          style={{width: "100%", padding: 8, fontSize: 16}}
        />
        <button type="submit" style={{marginTop: 10, padding: 10, width: "100%"}}>
          دریافت 100 ZARF
        </button>
      </form>
      <p>{status}</p>

      <h3>آدرس‌های ثبت‌شده:</h3>
      <ul>
        {airdrops.map(addr => (
          <li key={addr}>{addr}</li>
        ))}
      </ul>
    </div>
  );
}
