import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { notifyAdmin } from "../lib/email";
import { ShieldCheck, Edit2, Clock, CheckCircle2, Camera, Image as ImageIcon, AlertTriangle, X } from "lucide-react";
import SEOHead from '../components/SEOHead';

const CRYPTO_LIST = ["USDT (ERC20)", "USDT (BEP20)", "USDC (ERC20)", "USDC (BEP20)", "Dogecoin", "Litecoin", "Tron", "USDT(trc20)", "Bitcoin", "XRP", "BNB", "Ethereum", "XLM"];

export default function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("personal");

  // Personal Info State
  const [name, setName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Wallet Settings State
  const [cryptoAddresses, setCryptoAddresses] = useState<Record<string, string>>({});
  const [editingCrypto, setEditingCrypto] = useState<string | null>(null);
  const [editAddress, setEditAddress] = useState("");
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // KYC State
  const [kycStatus, setKycStatus] = useState("unverified");
  const [idDocumentFront, setIdDocumentFront] = useState<string | null>(null);
  const [idDocumentBack, setIdDocumentBack] = useState<string | null>(null);
  const [proofOfAddress, setProofOfAddress] = useState<string | null>(null);
  const [passportPhotograph, setPassportPhotograph] = useState<string | null>(null);
  const [isSubmittingKyc, setIsSubmittingKyc] = useState(false);
  const [kycError, setKycError] = useState<string | null>(null);

  const idFrontInputRef = useRef<HTMLInputElement>(null);
  const idBackInputRef = useRef<HTMLInputElement>(null);
  const poaInputRef = useRef<HTMLInputElement>(null);
  const passportInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await (supabase as any).from("profiles").select("*").eq("id", user.id).single();
      if (data) {
        setName(data.full_name || "");
        setKycStatus(data.kyc_status || "unverified");
      }
    };
    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const loadWalletAddresses = async () => {
      const { data } = await (supabase as any).from("wallet_addresses").select("crypto_name, address").eq("user_id", user.id);
      if (data) {
        const addresses: Record<string, string> = {};
        data.forEach((row: any) => { addresses[row.crypto_name] = row.address; });
        setCryptoAddresses(addresses);
      }
    };
    loadWalletAddresses();
  }, [user]);



  const handleUpdateProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const updateData: any = { full_name: name };
      if (newPassword.trim()) {
        const { error: passwordError } = await supabase.auth.updateUser({ password: newPassword });
        if (passwordError) throw passwordError;
        updateData.user_password = newPassword;
        setNewPassword("");
      }
      const { error: profileError } = await (supabase as any).from("profiles").update(updateData).eq("id", user.id);
      if (profileError) throw profileError;
      setSaveMessage("Profile updated successfully!");
    } catch {
      setSaveMessage("Error: Failed to update profile.");
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };



  const saveWalletAddress = async () => {
    if (!editingCrypto || !user) return;
    setIsSavingAddress(true);
    try {
      const { error } = await (supabase as any).from("wallet_addresses").upsert(
        { user_id: user.id, crypto_name: editingCrypto, address: editAddress, updated_at: new Date().toISOString() },
        { onConflict: "user_id,crypto_name" },
      );
      if (error) throw error;
      setCryptoAddresses({ ...cryptoAddresses, [editingCrypto]: editAddress });
      setEditingCrypto(null);
      setEditAddress("");
    } catch {
      alert("Failed to save address due to an unexpected error.");
    } finally {
      setIsSavingAddress(false);
    }
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
          let width = img.width; let height = img.height;
          const MAX = 800;
          if (width > height) { if (width > MAX) { height *= MAX / width; width = MAX; } }
          else { if (height > MAX) { width *= MAX / height; height = MAX; } }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) { ctx.drawImage(img, 0, 0, width, height); resolve(canvas.toDataURL("image/jpeg", 0.7)); }
          else { resolve(reader.result as string); }
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleKycFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: "id_front" | "id_back" | "poa" | "passport") => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64Img = await processImage(e.target.files[0]);
        if (type === "id_front") setIdDocumentFront(base64Img);
        else if (type === "id_back") setIdDocumentBack(base64Img);
        else if (type === "poa") setProofOfAddress(base64Img);
        else setPassportPhotograph(base64Img);
      } catch {
        setKycError("Failed to process image. Please try another one.");
        setTimeout(() => setKycError(null), 5000);
      }
    }
  };

  const handleKycSubmit = async () => {
    if (!user) return;
    if (!idDocumentFront || !idDocumentBack) {
      setKycError("Please upload both the front and back of your Government ID.");
      setTimeout(() => setKycError(null), 5000);
      return;
    }
    if (!proofOfAddress) {
      setKycError("Please upload your Proof of Address.");
      setTimeout(() => setKycError(null), 5000);
      return;
    }
    if (!passportPhotograph) {
      setKycError("Please upload your Passport Photograph.");
      setTimeout(() => setKycError(null), 5000);
      return;
    }

    setIsSubmittingKyc(true);
    try {
      const uploadFile = async (base64Img: string, pathPrefix: string) => {
        const base64Data = base64Img.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });
        const fileName = `${user.id}-${pathPrefix}-${Date.now()}.jpg`;
        const { data: uploadData, error: uploadError } = await supabase.storage.from('kyc_documents').upload(fileName, blob, { contentType: 'image/jpeg' });
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('kyc_documents').getPublicUrl(uploadData.path);
        return publicUrl;
      };

      const frontUrl = await uploadFile(idDocumentFront, 'id_front');
      const backUrl = await uploadFile(idDocumentBack, 'id_back');
      const poaUrl = await uploadFile(proofOfAddress, 'poa');
      const passportUrl = await uploadFile(passportPhotograph, 'passport');

      const { error } = await (supabase as any).from("profiles").update({
        kyc_status: "pending",
        id_document: frontUrl,
        id_document_back: backUrl,
        proof_of_address: poaUrl,
        passport_photograph: passportUrl,
      }).eq("id", user.id);

      if (error) throw error;
      setKycStatus("pending");

      // Send email notifications (fire-and-forget)
      notifyAdmin('kyc_submitted_admin', { email: user.email });
    } catch (err: any) {
      console.error("KYC Submission error:", err);
      setKycError(err.message || "Verification failed due to an unexpected error.");
      setTimeout(() => setKycError(null), 5000);
    } finally {
      setIsSubmittingKyc(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <SEOHead title="Profile" description="Manage your account settings, wallet connections, and KYC verification." path="/dashboard/profile" noIndex />
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight text-white">Account Settings</h1>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="flex border-b border-white/5 bg-surface-900/60 overflow-x-auto">
          {['personal', 'settings', 'kyc'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 sm:px-6 py-4 text-xs sm:text-sm font-bold tracking-widest uppercase transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? "text-brand-400 border-b-2 border-brand-400 bg-white/5"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab === 'settings' ? 'Wallet Settings' : tab === 'kyc' ? 'KYC Verification' : 'Personal Info'}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "personal" && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-xl font-bold text-brand-400 tracking-wide uppercase">Account Settings</h2>
                <p className="text-white/50 text-sm mt-1">You can change your profile info and password here.</p>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full bg-surface-950 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 transition-colors"
                />
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full bg-surface-950/50 text-white/50 border border-white/10 rounded-xl px-4 py-3 cursor-not-allowed"
                />
                <div className="space-y-2 pt-2">
                  <label className="text-sm font-bold">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter your new password"
                    className="w-full bg-surface-950 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>

                {saveMessage && (
                  <div className={`p-3 rounded-lg text-sm text-center ${saveMessage.startsWith("Error") ? "bg-red-500/10 text-red-400 border border-red-500/30" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"}`}>
                    {saveMessage}
                  </div>
                )}

                <button
                  onClick={handleUpdateProfile}
                  disabled={isSaving}
                  className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-8 py-3 rounded-xl transition-colors"
                >
                  {isSaving ? "Saving..." : "Update Profile"}
                </button>
              </div>
            </div>
          )}



          {activeTab === "settings" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-brand-400 tracking-wide uppercase">Add Your Withdrawal Address</h2>
                <p className="text-white/50 text-sm mt-1">Address must be of wallet connected to your account.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-surface-900/80 text-white/60 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 font-bold rounded-tl-xl">Payment Name</th>
                      <th className="px-4 py-3 font-bold">Payment Wallet</th>
                      <th className="px-4 py-3 font-bold rounded-tr-xl w-24 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CRYPTO_LIST.map((crypto) => (
                      <tr key={crypto} className="border-b border-white/5 bg-surface-950 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-4 font-bold text-white">{crypto}</td>
                        <td className="px-4 py-4 text-brand-400 font-mono text-xs">{cryptoAddresses[crypto] || "Empty.."}</td>
                        <td className="px-4 py-4 text-center">
                          <button onClick={() => { setEditingCrypto(crypto); setEditAddress(cryptoAddresses[crypto] || ""); }} className="p-2 bg-brand-500/20 text-brand-400 hover:bg-brand-500 hover:text-white rounded-lg transition-colors">
                            <Edit2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "kyc" && (
            <div className="space-y-6">
              <div className="text-center pb-6">
                <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${kycStatus === "verified" ? "bg-emerald-500/10 text-emerald-400" : "bg-brand-500/10 text-brand-400"}`}>
                  <ShieldCheck size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{kycStatus === "verified" ? "Identity Verified" : kycStatus === "pending" ? "Verification Pending" : "Secure Your Account"}</h2>
                <p className="text-sm text-white/60 max-w-md mx-auto">
                  {kycStatus === "verified" ? "Your account is fully verified and all platform features are unlocked." : kycStatus === "pending" ? "Your documents are currently under review." : "Verify your identity to ensure a secure staking environment and full access to platform features."}
                </p>
              </div>

              {kycError && (
                <div className="flex items-center gap-3 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400">
                  <AlertTriangle size={20} />
                  <p className="text-sm flex-1">{kycError}</p>
                  <button onClick={() => setKycError(null)}><X size={16} /></button>
                </div>
              )}

              {kycStatus === "unverified" && (
                <div className="space-y-6 max-w-2xl mx-auto">
                  {/* Front ID */}
                  <div className="space-y-3 bg-surface-950 p-6 rounded-xl border border-white/5">
                    <h3 className="font-semibold text-lg flex items-center gap-2">1. Government ID (Front) {idDocumentFront && <CheckCircle2 className="text-emerald-400" size={20} />}</h3>
                    <p className="text-sm text-white/50">Upload a clear photo of the front of your driver's license or ID card.</p>
                    {!idDocumentFront ? (
                      <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => { idFrontInputRef.current?.removeAttribute("capture"); idFrontInputRef.current?.click(); }} className="h-24 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-white/5 hover:border-brand-500/50 transition-all text-white/50 hover:text-brand-400">
                          <ImageIcon size={24} /> <span className="text-xs">Upload File</span>
                        </button>
                        <button onClick={() => { idFrontInputRef.current?.setAttribute("capture", "environment"); idFrontInputRef.current?.click(); }} className="h-24 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-white/5 hover:border-brand-500/50 transition-all text-white/50 hover:text-brand-400">
                          <Camera size={24} /> <span className="text-xs">Take Photo</span>
                        </button>
                      </div>
                    ) : (
                      <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/50 h-48 flex items-center justify-center">
                        <img src={idDocumentFront} alt="ID Front" className="max-h-full object-contain" />
                        <button onClick={() => setIdDocumentFront(null)} className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-lg">Remove</button>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" ref={idFrontInputRef} onChange={(e) => handleKycFileChange(e, "id_front")} />
                  </div>

                  {/* Back ID */}
                  <div className="space-y-3 bg-surface-950 p-6 rounded-xl border border-white/5">
                    <h3 className="font-semibold text-lg flex items-center gap-2">2. Government ID (Back) {idDocumentBack && <CheckCircle2 className="text-emerald-400" size={20} />}</h3>
                    <p className="text-sm text-white/50">Upload a clear photo of the back of your ID.</p>
                    {!idDocumentBack ? (
                      <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => { idBackInputRef.current?.removeAttribute("capture"); idBackInputRef.current?.click(); }} className="h-24 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-white/5 hover:border-brand-500/50 transition-all text-white/50 hover:text-brand-400">
                          <ImageIcon size={24} /> <span className="text-xs">Upload File</span>
                        </button>
                        <button onClick={() => { idBackInputRef.current?.setAttribute("capture", "environment"); idBackInputRef.current?.click(); }} className="h-24 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-white/5 hover:border-brand-500/50 transition-all text-white/50 hover:text-brand-400">
                          <Camera size={24} /> <span className="text-xs">Take Photo</span>
                        </button>
                      </div>
                    ) : (
                      <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/50 h-48 flex items-center justify-center">
                        <img src={idDocumentBack} alt="ID Back" className="max-h-full object-contain" />
                        <button onClick={() => setIdDocumentBack(null)} className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-lg">Remove</button>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" ref={idBackInputRef} onChange={(e) => handleKycFileChange(e, "id_back")} />
                  </div>

                  {/* POA */}
                  <div className="space-y-3 bg-surface-950 p-6 rounded-xl border border-white/5">
                    <h3 className="font-semibold text-lg flex items-center gap-2">3. Proof of Address {proofOfAddress && <CheckCircle2 className="text-emerald-400" size={20} />}</h3>
                    <p className="text-sm text-white/50">Upload a utility bill or bank statement not older than 3 months.</p>
                    {!proofOfAddress ? (
                      <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => { poaInputRef.current?.removeAttribute("capture"); poaInputRef.current?.click(); }} className="h-24 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-white/5 hover:border-brand-500/50 transition-all text-white/50 hover:text-brand-400">
                          <ImageIcon size={24} /> <span className="text-xs">Upload File</span>
                        </button>
                        <button onClick={() => { poaInputRef.current?.setAttribute("capture", "environment"); poaInputRef.current?.click(); }} className="h-24 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-white/5 hover:border-brand-500/50 transition-all text-white/50 hover:text-brand-400">
                          <Camera size={24} /> <span className="text-xs">Take Photo</span>
                        </button>
                      </div>
                    ) : (
                      <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/50 h-48 flex items-center justify-center">
                        <img src={proofOfAddress} alt="POA" className="max-h-full object-contain" />
                        <button onClick={() => setProofOfAddress(null)} className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-lg">Remove</button>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" ref={poaInputRef} onChange={(e) => handleKycFileChange(e, "poa")} />
                  </div>

                  {/* Passport Photo */}
                  <div className="space-y-3 bg-surface-950 p-6 rounded-xl border border-white/5">
                    <h3 className="font-semibold text-lg flex items-center gap-2">4. Passport Photograph {passportPhotograph && <CheckCircle2 className="text-emerald-400" size={20} />}</h3>
                    <p className="text-sm text-white/50">Kindly upload a clear passport-style photograph of yourself showing your full face clearly.</p>
                    {!passportPhotograph ? (
                      <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => { passportInputRef.current?.removeAttribute("capture"); passportInputRef.current?.click(); }} className="h-24 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-white/5 hover:border-brand-500/50 transition-all text-white/50 hover:text-brand-400">
                          <ImageIcon size={24} /> <span className="text-xs">Upload File</span>
                        </button>
                        <button onClick={() => { passportInputRef.current?.setAttribute("capture", "user"); passportInputRef.current?.click(); }} className="h-24 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-white/5 hover:border-brand-500/50 transition-all text-white/50 hover:text-brand-400">
                          <Camera size={24} /> <span className="text-xs">Take Photo</span>
                        </button>
                      </div>
                    ) : (
                      <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/50 h-48 flex items-center justify-center">
                        <img src={passportPhotograph} alt="Passport Photograph" className="max-h-full object-contain" />
                        <button onClick={() => setPassportPhotograph(null)} className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-lg">Remove</button>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" ref={passportInputRef} onChange={(e) => handleKycFileChange(e, "passport")} />
                  </div>

                  <button onClick={handleKycSubmit} disabled={isSubmittingKyc} className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-4 rounded-xl transition-colors">
                    {isSubmittingKyc ? "Submitting securely..." : "Submit Documents"}
                  </button>
                </div>
              )}

              {kycStatus === "pending" && (
                <div className="p-8 bg-brand-500/5 border border-brand-500/20 rounded-xl text-center max-w-lg mx-auto">
                  <Clock className="h-12 w-12 text-brand-500 mx-auto mb-4" />
                  <p className="font-bold tracking-widest uppercase text-brand-500 mb-2">Under Review</p>
                  <p className="text-white/60 text-sm">We are reviewing your submission. You will be notified once the review is complete.</p>
                </div>
              )}
              {kycStatus === "verified" && (
                <div className="p-8 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-center max-w-lg mx-auto">
                  <ShieldCheck className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                  <p className="font-bold tracking-widest uppercase text-emerald-400 mb-2">Verification Complete</p>
                  <p className="text-white/60 text-sm">Thank you for verifying your identity. Your account is now in good standing.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {editingCrypto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/5">
              <h2 className="text-xl font-bold font-heading">Update {editingCrypto} Address</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-white/70 font-semibold">Wallet Address</label>
                <input value={editAddress} onChange={(e) => setEditAddress(e.target.value)} placeholder="Enter your wallet address here" className="w-full bg-surface-950 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500" />
              </div>
            </div>
            <div className="p-4 bg-surface-900/60 border-t border-white/5 flex justify-end gap-3">
              <button onClick={() => setEditingCrypto(null)} className="px-6 py-2 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={saveWalletAddress} disabled={isSavingAddress} className="px-6 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold transition-colors">
                {isSavingAddress ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
