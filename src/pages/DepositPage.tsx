import { useState, useEffect, useRef } from "react";
import { Copy, CheckCircle2, ChevronRight, Wallet, ArrowLeft, AlertTriangle, X, Camera, Image as ImageIcon } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { notifyAdmin } from "../lib/email";
import SEOHead from '../components/SEOHead';

const CRYPTO_METHODS = [
  "BTC",
  "ETHEREUM",
  "BNB",
  "USDT(ERC20)",
  "USDT(BEP20)",
  "USDT(TRC20)",
  "USDC(ERC20)",
  "USDC(BEP20)",
];

const WALLET_ADDRESSES: Record<string, string> = {
  BTC: "bc1qg3fa0nl0fxz2u2x2382hkq7myjylpgk53vxch2",
  ETHEREUM: "0x87cfae2db40a9c1ae1c3922a373d0cd0022c7d48",
  BNB: "0x87cfae2db40a9c1ae1c3922a373d0cd0022c7d48",
  "USDT(ERC20)": "0x87cfae2db40a9c1ae1c3922a373d0cd0022c7d48",
  "USDT(BEP20)": "0x87cfae2db40a9c1ae1c3922a373d0cd0022c7d48",
  "USDT(TRC20)": "TXyFXyUMZUjjGaaCwcSoJ6v5uYPEfghZjw",
  "USDC(ERC20)": "0x87cfae2db40a9c1ae1c3922a373d0cd0022c7d48",
  "USDC(BEP20)": "0x87cfae2db40a9c1ae1c3922a373d0cd0022c7d48",
};

const getCoinDetails = (method: string) => {
  switch (method) {
    case "BTC": return { coinId: "bitcoin", symbol: "BTC" };
    case "ETHEREUM": return { coinId: "ethereum", symbol: "ETH" };
    case "BNB": return { coinId: "binancecoin", symbol: "BNB" };
    case "USDT(ERC20)":
    case "USDT(BEP20)":
    case "USDT(TRC20)": return { coinId: "tether", symbol: "USDT" };
    case "USDC(ERC20)":
    case "USDC(BEP20)": return { coinId: "usd-coin", symbol: "USDC" };
    default: return null;
  }
};

export default function DepositPage() {
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [amount, setAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("BTC");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const receiptInputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,tether,usd-coin&vs_currencies=usd");
        const data = await response.json();
        const newPrices: Record<string, number> = {};
        if (data) {
          Object.keys(data).forEach((coin) => {
            newPrices[coin] = data[coin].usd;
          });
        }
        setPrices(newPrices);
      } catch {
        // silent fail
      }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  const selectedCryptoDetails = getCoinDetails(paymentMethod);
  const cryptoPrice = selectedCryptoDetails ? prices[selectedCryptoDetails.coinId] : undefined;
  const cryptoEquivalent = amount && cryptoPrice ? (parseFloat(amount) / cryptoPrice).toFixed(6) : "0.000000";
  const walletAddress = WALLET_ADDRESSES[paymentMethod] || "0x603a0f8e7d21a8c13974c1c34625965c9335dc3d";

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  const processImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const MAX = 800;
          if (width > height) {
            if (width > MAX) { height *= MAX / width; width = MAX; }
          } else {
            if (height > MAX) { width *= MAX / height; height = MAX; }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/jpeg", 0.7));
          } else {
            resolve(reader.result as string);
          }
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleReceiptChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64Img = await processImage(e.target.files[0]);
        setReceiptImage(base64Img);
      } catch {
        showError("Failed to process image. Please try another one.");
      }
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleProceedToPayment = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 1) {
      showError("Please enter a valid amount (minimum $1).");
      return;
    }
    setStep(2);
  };

  const handleReceiptSubmit = async () => {
    if (!receiptImage) return showError("Please upload a receipt or screenshot of your payment.");
    if (!user) return showError("You must be logged in to stake.");

    setIsSubmitting(true);
    try {
      // Convert base64 to Blob
      const base64Data = receiptImage.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });

      // Upload to Supabase Storage
      const fileName = `${user.id}-${Date.now()}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(uploadData.path);

      // Insert transaction with public URL
      const { error } = await supabase.from("transactions").insert({
        user_id: user.id,
        type: "deposit",
        asset: paymentMethod,
        amount: parseFloat(amount),
        status: "pending",
        receipt_image: publicUrl,
      });
      if (error) throw error;
      
      // Send email notifications (fire-and-forget)
      notifyAdmin('deposit_notification_admin', {
        email: user.email,
        amount: parseFloat(amount),
      });

      setShowSuccessModal(true);
    } catch (err: any) {
      console.error(err);
      showError("Failed to submit stake request. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <SEOHead title="Stake Assets" description="Stake your cryptocurrency assets to earn yields on StakeX." path="/dashboard/deposit" noIndex />
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight">Stake Assets</h1>
        <p className="text-white/50 mt-1">Stake your cryptocurrency assets into the protocol.</p>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400">
          <AlertTriangle size={20} />
          <p className="text-sm flex-1">{errorMessage}</p>
          <button onClick={() => setErrorMessage(null)}><X size={16} /></button>
        </div>
      )}

      {step === 1 && (
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-surface-900/60">
            <h2 className="text-xs font-bold tracking-widest uppercase text-white/50">Cryptocurrency Staking</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/70">Enter amount (USD)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-surface-950 border border-white/10 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-brand-500 transition-colors notranslate"
                placeholder="Enter any amount"
              />
              <p className="text-xs text-white/40">Minimum stake amount is $1.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/70">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-surface-950 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 transition-colors text-white notranslate"
              >
                {CRYPTO_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {selectedCryptoDetails && amount && !isNaN(parseFloat(amount)) && (
              <div className="p-4 bg-surface-950 rounded-xl text-center border border-white/5 notranslate">
                <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-1">Equivalent Amount</p>
                {prices[selectedCryptoDetails.coinId] ? (
                  <p className="text-2xl font-bold text-emerald-400">~ {cryptoEquivalent} {selectedCryptoDetails.symbol}</p>
                ) : (
                  <p className="text-sm text-white/40 animate-pulse mt-2">Fetching live price...</p>
                )}
              </div>
            )}
          </div>
          <div className="p-4 bg-surface-900/40 border-t border-white/5">
            <button
              onClick={handleProceedToPayment}
              className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-colors"
            >
              Proceed to Stake <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-surface-900/60 flex items-center gap-3">
            <button onClick={() => setStep(1)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <ArrowLeft size={18} />
            </button>
            <h2 className="text-xs font-bold tracking-widest uppercase text-white/50">Complete Your Stake</h2>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="p-5 bg-surface-950 rounded-xl border border-white/5 space-y-4 notranslate">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/50">Amount</span>
                <span className="text-lg font-bold text-emerald-400">${parseFloat(amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/50">Method</span>
                <span className="font-bold">{paymentMethod}</span>
              </div>
              {selectedCryptoDetails && cryptoPrice && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/50">Equivalent</span>
                  <span className="font-bold text-brand-400">~ {cryptoEquivalent} {selectedCryptoDetails.symbol}</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <label className="text-sm font-semibold flex items-center gap-2"><Wallet size={16} /> Send <span className="notranslate">{paymentMethod}</span> to this address</label>
              <div className="flex items-center gap-2 notranslate" translate="no">
                <div className="flex-1 bg-surface-950 border border-white/10 rounded-xl p-4 overflow-hidden">
                  <p className="font-mono text-sm text-brand-400 break-all">{walletAddress}</p>
                </div>
                <button
                  onClick={() => handleCopy(walletAddress)}
                  className="w-14 h-14 shrink-0 bg-surface-900 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/5 transition-colors"
                >
                  {copied ? <CheckCircle2 className="text-emerald-400" /> : <Copy />}
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 space-y-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-1">Upload Receipt</h3>
                <p className="text-xs text-white/50">Upload a screenshot of your payment.</p>
              </div>

              {!receiptImage ? (
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => { receiptInputRef.current?.removeAttribute('capture'); receiptInputRef.current?.click(); }} className="h-24 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-colors text-white/50 hover:text-white">
                    <ImageIcon size={24} />
                    <span className="text-xs">Upload File</span>
                  </button>
                  <button onClick={() => { receiptInputRef.current?.setAttribute('capture', 'environment'); receiptInputRef.current?.click(); }} className="h-24 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-colors text-white/50 hover:text-white">
                    <Camera size={24} />
                    <span className="text-xs">Take Photo</span>
                  </button>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/50 h-48 flex items-center justify-center">
                  <img src={receiptImage} alt="Receipt" className="max-h-full object-contain" />
                  <button onClick={() => setReceiptImage(null)} className="absolute top-2 right-2 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-lg">Remove</button>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" ref={receiptInputRef} onChange={handleReceiptChange} />
            </div>
          </div>
          
          <div className="p-4 bg-surface-900/40 border-t border-white/5 flex gap-3">
            <button onClick={handleReceiptSubmit} disabled={isSubmitting} className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-xl transition-colors">
              {isSubmitting ? "Submitting..." : "Submit Stake Request"}
            </button>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-emerald-500"></div>
            <div className="w-16 h-16 mx-auto bg-emerald-500/10 text-emerald-400 flex items-center justify-center rounded-full mb-6">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-2xl font-bold font-heading mb-2">Stake Request Submitted</h2>
            <p className="text-white/60 text-sm mb-8">
              Your stake request has been submitted. Please be patient while the protocol confirms the funds.
            </p>
            <button onClick={() => { setShowSuccessModal(false); setStep(1); setReceiptImage(null); setAmount(""); }} className="w-full bg-surface-900 hover:bg-surface-800 border border-white/10 text-white font-bold py-3 rounded-xl transition-colors">
              Return to Staking Page
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
