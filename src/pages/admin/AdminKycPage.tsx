import { useEffect, useState } from 'react';
import { Check, X, Loader2, Search, ShieldCheck, Eye, Download, XCircle, ZoomIn } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { sendEmailNotification } from '../../lib/email';
import SEOHead from '../../components/SEOHead';

export default function AdminKycPage() {
  const [kycRequests, setKycRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ src: string; label: string } | null>(null);

  useEffect(() => {
    fetchKycRequests();
  }, []);

  const fetchKycRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('id, full_name, email, created_at, kyc_status, id_document, id_document_back, proof_of_address, passport_photograph')
        .neq('kyc_status', 'unverified')
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Error fetching KYC requests.', error);
        setKycRequests([]);
      } else if (data) {
        setKycRequests(data);
      }
    } catch (error) {
      console.error('Error fetching KYC requests:', error);
      setKycRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (userId: string, newStatus: 'verified' | 'rejected' | 'unverified') => {
    try {
      setProcessingId(userId);

      const { error } = await (supabase as any)
        .from('profiles')
        .update({ kyc_status: newStatus })
        .eq('id', userId);

      if (error) throw error;

      setKycRequests(prev => prev.map(req => 
        req.id === userId ? { ...req, kyc_status: newStatus } : req
      ));
      
      if (selectedRequest?.id === userId) {
         setSelectedRequest({ ...selectedRequest, kyc_status: newStatus });
      }

      // Send email to user (fire-and-forget)
      const userEmail = kycRequests.find(r => r.id === userId)?.email;
      if (userEmail && (newStatus === 'verified' || newStatus === 'rejected')) {
        sendEmailNotification({
          to: userEmail,
          type: newStatus === 'verified' ? 'kyc_approved' : 'kyc_rejected',
          data: {},
        });
      }

    } catch (error) {
      console.error(`Error updating KYC status to ${newStatus}:`, error);
    } finally {
      setProcessingId(null);
    }
  };

  const hasDocuments = (req: any) => {
    return !!(req.id_document || req.id_document_back || req.proof_of_address || req.passport_photograph);
  };

  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename + '.jpg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading image:", error);
      // Fallback for direct download if fetch fails (e.g. CORS issues, though supabase storage usually allows it)
      window.open(url, '_blank');
    }
  };

  const filteredRequests = kycRequests.filter(req => 
    req.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    req.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <SEOHead title="Admin KYC" description="Review and verify user identity documents." path="/admin/kyc" noIndex />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white">KYC Applications</h1>
          <p className="text-white/60 mt-1">Review and verify user identity documents.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-900 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-surface-900 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs uppercase bg-black/20 text-white/40 border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 font-bold tracking-wider">User</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Status</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Documents</th>
                  <th className="px-6 py-4 font-bold tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-white">{req.full_name || 'N/A'}</span>
                        <span className="text-xs text-white/40">{req.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg flex items-center gap-1 w-fit ${
                        req.kyc_status === 'verified' ? 'bg-emerald-500/10 text-emerald-400' :
                        req.kyc_status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                        'bg-orange-500/10 text-orange-400'
                      }`}>
                        {req.kyc_status === 'verified' && <ShieldCheck size={12} />}
                        {req.kyc_status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {req.id_document && <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="ID Front" />}
                        {req.id_document_back && <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="ID Back" />}
                        {req.proof_of_address && <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Proof of Address" />}
                        {req.passport_photograph && <span className="w-2.5 h-2.5 rounded-full bg-brand-500" title="Passport Photograph" />}
                        {!hasDocuments(req) && <span className="text-xs text-white/40">None</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {hasDocuments(req) && (
                          <button
                            onClick={() => setSelectedRequest(req)}
                            className="px-3 py-1.5 text-xs font-medium text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center gap-1 transition-colors"
                          >
                            <Eye size={14} /> View Docs
                          </button>
                        )}
                        
                        {(req.kyc_status === 'pending' || req.kyc_status === 'unverified') && hasDocuments(req) && (
                          <button
                            onClick={() => handleStatusUpdate(req.id, 'verified')}
                            disabled={processingId === req.id}
                            className="p-1.5 text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors disabled:opacity-50"
                            title="Approve KYC"
                          >
                            {processingId === req.id ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                          </button>
                        )}
                        {(req.kyc_status === 'pending' || req.kyc_status === 'verified') && hasDocuments(req) && (
                          <button
                            onClick={() => handleStatusUpdate(req.id, 'rejected')}
                            disabled={processingId === req.id}
                            className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-50"
                            title="Reject/Revoke KYC"
                          >
                            {processingId === req.id ? <Loader2 size={18} className="animate-spin" /> : <X size={18} />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredRequests.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center">
                      <div className="flex flex-col items-center justify-center text-white/40">
                        <ShieldCheck size={32} className="mb-2 opacity-50" />
                        <p>No KYC applications found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Document Viewer Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm mt-0">
          <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-surface-900 border border-white/10 rounded-2xl shadow-2xl relative">
            <button 
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/80 border border-white/10 text-white/70 hover:text-white transition-colors"
              onClick={() => setSelectedRequest(null)}
            >
              <X size={20} />
            </button>
            
            <div className="border-b border-white/5 bg-surface-950 p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-brand-500/10 rounded-xl">
                  <ShieldCheck className="h-6 w-6 text-brand-500" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white">KYC Documents: {selectedRequest.full_name || "User"}</h2>
                  <p className="text-white/60 mt-1 text-sm">{selectedRequest.email}</p>
                  <div className="mt-2">
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg inline-flex items-center gap-1 ${
                      selectedRequest.kyc_status === 'verified' ? 'bg-emerald-500/10 text-emerald-400' :
                      selectedRequest.kyc_status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                      'bg-orange-500/10 text-orange-400'
                    }`}>
                      {selectedRequest.kyc_status === 'verified' && <Check size={12} />}
                      {selectedRequest.kyc_status || 'pending'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Government ID Front */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-white/50">ID (Front)</h4>
                  <div 
                    className="bg-black/50 border border-white/10 rounded-xl overflow-hidden min-h-[150px] flex items-center justify-center relative group cursor-pointer" 
                    onClick={() => selectedRequest.id_document && setLightboxImage({ src: selectedRequest.id_document, label: 'Government ID (Front)' })}
                  >
                    {selectedRequest.id_document ? (
                      <>
                        <img src={selectedRequest.id_document} alt="Government ID Front" className="w-full h-40 object-contain" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium text-sm gap-2">
                          <ZoomIn size={20} /> Enlarge
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-white/20">
                        <XCircle size={32} className="mb-2" />
                        <p className="text-xs">No document</p>
                      </div>
                    )}
                  </div>
                  {selectedRequest.id_document && (
                    <button
                      className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-white/80 transition-colors flex items-center justify-center gap-2"
                      onClick={() => downloadImage(selectedRequest.id_document, `${selectedRequest.full_name || 'user'}_id_front`)}
                    >
                      <Download size={14} /> Download
                    </button>
                  )}
                </div>

                {/* Government ID Back */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-white/50">ID (Back)</h4>
                  <div 
                    className="bg-black/50 border border-white/10 rounded-xl overflow-hidden min-h-[150px] flex items-center justify-center relative group cursor-pointer" 
                    onClick={() => selectedRequest.id_document_back && setLightboxImage({ src: selectedRequest.id_document_back, label: 'Government ID (Back)' })}
                  >
                    {selectedRequest.id_document_back ? (
                      <>
                        <img src={selectedRequest.id_document_back} alt="Government ID Back" className="w-full h-40 object-contain" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium text-sm gap-2">
                          <ZoomIn size={20} /> Enlarge
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-white/20">
                        <XCircle size={32} className="mb-2" />
                        <p className="text-xs">No document</p>
                      </div>
                    )}
                  </div>
                  {selectedRequest.id_document_back && (
                    <button
                      className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-white/80 transition-colors flex items-center justify-center gap-2"
                      onClick={() => downloadImage(selectedRequest.id_document_back, `${selectedRequest.full_name || 'user'}_id_back`)}
                    >
                      <Download size={14} /> Download
                    </button>
                  )}
                </div>

                {/* Proof of Address */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-white/50">Proof of Address</h4>
                  <div 
                    className="bg-black/50 border border-white/10 rounded-xl overflow-hidden min-h-[150px] flex items-center justify-center relative group cursor-pointer" 
                    onClick={() => selectedRequest.proof_of_address && setLightboxImage({ src: selectedRequest.proof_of_address, label: 'Proof of Address' })}
                  >
                    {selectedRequest.proof_of_address ? (
                      <>
                        <img src={selectedRequest.proof_of_address} alt="Proof of Address" className="w-full h-40 object-contain" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium text-sm gap-2">
                          <ZoomIn size={20} /> Enlarge
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-white/20">
                        <XCircle size={32} className="mb-2" />
                        <p className="text-xs">No document</p>
                      </div>
                    )}
                  </div>
                  {selectedRequest.proof_of_address && (
                    <button
                      className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-white/80 transition-colors flex items-center justify-center gap-2"
                      onClick={() => downloadImage(selectedRequest.proof_of_address, `${selectedRequest.full_name || 'user'}_poa`)}
                    >
                      <Download size={14} /> Download
                    </button>
                  )}
                </div>

                {/* Passport Photograph */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-white/50">Passport Photograph</h4>
                  <div 
                    className="bg-black/50 border border-white/10 rounded-xl overflow-hidden min-h-[150px] flex items-center justify-center relative group cursor-pointer" 
                    onClick={() => selectedRequest.passport_photograph && setLightboxImage({ src: selectedRequest.passport_photograph, label: 'Passport Photograph' })}
                  >
                    {selectedRequest.passport_photograph ? (
                      <>
                        <img src={selectedRequest.passport_photograph} alt="Passport Photograph" className="w-full h-40 object-contain" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium text-sm gap-2">
                          <ZoomIn size={20} /> Enlarge
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-white/20">
                        <XCircle size={32} className="mb-2" />
                        <p className="text-xs">No document</p>
                      </div>
                    )}
                  </div>
                  {selectedRequest.passport_photograph && (
                    <button
                      className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-white/80 transition-colors flex items-center justify-center gap-2"
                      onClick={() => downloadImage(selectedRequest.passport_photograph, `${selectedRequest.full_name || 'user'}_passport`)}
                    >
                      <Download size={14} /> Download
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons inside modal */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-6 border-t border-white/5">
                {(selectedRequest.kyc_status === 'pending' || selectedRequest.kyc_status === 'verified') && (
                  <button
                    className="w-full sm:w-auto px-6 py-3 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    onClick={() => handleStatusUpdate(selectedRequest.id, 'rejected')}
                    disabled={processingId === selectedRequest.id}
                  >
                    <X size={18} /> {selectedRequest.kyc_status === 'verified' ? 'Revoke Verification' : 'Reject Documents'}
                  </button>
                )}
                {(selectedRequest.kyc_status === 'pending' || selectedRequest.kyc_status === 'rejected' || selectedRequest.kyc_status === 'unverified') && (
                  <button
                    className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    onClick={() => handleStatusUpdate(selectedRequest.id, 'verified')}
                    disabled={processingId === selectedRequest.id}
                  >
                    <Check size={18} /> Approve Verification
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-6 bg-gradient-to-b from-black/80 to-transparent">
            <span className="text-white font-medium">{lightboxImage.label}</span>
            <div className="flex items-center gap-3">
              <button
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  downloadImage(lightboxImage.src, `${selectedRequest?.full_name || 'user'}_${lightboxImage.label.replace(/[\s()]/g, '_').toLowerCase()}`);
                }}
              >
                <Download size={16} /> Download
              </button>
              <button
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxImage(null);
                }}
              >
                <X size={20} />
              </button>
            </div>
          </div>
          <img 
            src={lightboxImage.src} 
            alt={lightboxImage.label}
            className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 text-sm">Click outside to close</p>
        </div>
      )}
    </div>
  );
}
