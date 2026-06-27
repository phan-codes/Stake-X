import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Wallet, Plus } from 'lucide-react';

export default function PortfolioPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-1 sm:mb-2">My Portfolios</h2>
          <p className="text-white/60 text-sm sm:text-base">Manage your staked assets across different yield strategies.</p>
        </div>
        <Button className="flex items-center gap-2 w-full sm:w-auto justify-center">
          <Plus size={18} /> New Staking Portfolio
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* Main Portfolio Mock */}
        <Card className="border border-brand-500/20">
          <CardHeader className="flex flex-row justify-between items-center pb-2 border-none">
            <CardTitle className="flex items-center gap-2">
              <Wallet className="text-brand-400" size={20} />
              Primary Staking Portfolio
            </CardTitle>
            <span className="text-xs font-semibold px-2 py-1 bg-brand-500/10 text-brand-400 rounded-md">Primary</span>
          </CardHeader>
          <CardContent>
            <h3 className="text-2xl sm:text-3xl font-bold mb-1">$124,563.00</h3>
            <p className="text-green-400 text-sm mb-6">+2.5% All time</p>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-surface-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F7931A]/20 text-[#F7931A] flex items-center justify-center font-bold">₿</div>
                  <div>
                    <p className="font-semibold text-sm">Bitcoin (BTC)</p>
                    <p className="text-xs text-white/50">1.25 BTC</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">$85,250.00</p>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-surface-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#627EEA]/20 text-[#627EEA] flex items-center justify-center font-bold">Ξ</div>
                  <div>
                    <p className="font-semibold text-sm">Ethereum (ETH)</p>
                    <p className="text-xs text-white/50">14.5 ETH</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">$39,313.00</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 border-t border-white/10 pt-4 text-center">
              <Button variant="ghost" className="text-sm">View Details</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
