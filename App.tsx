import React, { useState, useMemo, useEffect } from 'react';
import { WaterQualityData, SofteningResults, ChartDataPoint } from './types';
import { calculateSoftening } from './services/softeningCalculations';
import { getSofteningAdvice } from './services/geminiService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  Beaker, Database, ChevronRight, Activity, Zap, 
  Trash2, ArrowRightLeft, Info, BrainCircuit, Waves, Settings, ShieldAlert, Loader2
} from 'lucide-react';

const App: React.FC = () => {
  // Input State
  const [inputs, setInputs] = useState<WaterQualityData>({
    ph: 7.8,
    calcium: 80,
    magnesium: 25,
    alkalinity: 220,
    conductivity: 650,
    sulphate: 45,
    temperature: 20,
    targetCa: 40,
    targetMg: 10
  });

  // UI States
  const [aiInsights, setAiInsights] = useState<string>('');
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  // Check for API Key on mount
  useEffect(() => {
    let mounted = true;
    const checkKey = async () => {
      try {
        const aiStudio = (window as any).aistudio;
        if (aiStudio && typeof aiStudio.hasSelectedApiKey === 'function') {
          const selected = await aiStudio.hasSelectedApiKey();
          if (mounted) setHasKey(!!selected);
        } else {
          if (mounted) setHasKey(true); 
        }
      } catch (err) {
        console.warn("Key check failed, defaulting to active state:", err);
        if (mounted) setHasKey(true);
      }
    };
    checkKey();
    return () => { mounted = false; };
  }, []);

  const handleOpenKey = async () => {
    const aiStudio = (window as any).aistudio;
    if (aiStudio && typeof aiStudio.openSelectKey === 'function') {
      try {
        await aiStudio.openSelectKey();
        setHasKey(true);
      } catch (e) {
        console.error("Failed to open key selector", e);
      }
    }
  };

  // Memoized Calculations
  const results = useMemo(() => calculateSoftening(inputs), [inputs]);

  const chartData: ChartDataPoint[] = useMemo(() => [
    { 
      parameter: 'Calcium', 
      raw: inputs.calcium * 2.497, 
      softened: results.softenedCa 
    },
    { 
      parameter: 'Magnesium', 
      raw: inputs.magnesium * 4.118, 
      softened: results.softenedMg 
    },
    { 
      parameter: 'Hardness', 
      raw: results.initialHardness, 
      softened: results.softenedHardness 
    },
    { 
      parameter: 'Alkalinity', 
      raw: inputs.alkalinity, 
      softened: results.softenedAlkalinity 
    }
  ], [inputs, results]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const fetchInsights = async () => {
    setLoadingInsights(true);
    try {
      const advice = await getSofteningAdvice(inputs, results);
      if (advice === "ERROR_KEY_REQUIRED") {
        setHasKey(false);
      } else {
        setAiInsights(advice);
      }
    } catch (err) {
      console.error("Advice fetch error:", err);
    } finally {
      setLoadingInsights(false);
    }
  };

  // 1. Initial Load State
  if (hasKey === null) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Booting SoftH2O Engine</p>
      </div>
    );
  }

  // 2. Key Selection State
  if (hasKey === false) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Engineering Insights</h1>
            <p className="text-slate-500 mt-2 text-sm leading-relaxed">
              To use AI-powered process analysis, please select a billing-enabled API key.
            </p>
          </div>
          <button 
            onClick={handleOpenKey}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg active:scale-95"
          >
            Select API Key
          </button>
          <p className="text-[10px] text-slate-400">
            Learn more about <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline text-blue-500">Google Gemini Billing</a>.
          </p>
        </div>
      </div>
    );
  }

  // 3. Application State
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-100 antialiased">
      <header className="bg-white/80 border-b border-slate-200 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg text-white shadow-sm">
              <Waves className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900 uppercase leading-none tracking-tight">SoftH2O Pro</h1>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Water Treatment Simulation</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchInsights}
              disabled={loadingInsights}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition-all text-xs font-bold text-white px-4 py-2 rounded-full shadow-lg"
            >
              {loadingInsights ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
              ) : (
                <BrainCircuit className="w-3.5 h-3.5 text-blue-400" />
              )}
              {loadingInsights ? 'Analyzing...' : 'AI Insights'}
            </button>
            <button 
              onClick={() => setHasKey(false)} 
              className="p-2 text-slate-300 hover:text-slate-500 transition-colors"
              title="Reset Project Key"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* SIDEBAR: INPUTS */}
        <section className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
            <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-4">
              <Activity className="w-4 h-4 text-blue-600" />
              <h2 className="font-black text-slate-800 uppercase tracking-tight text-[11px]">Raw Water Profile</h2>
            </div>
            
            <div className="space-y-4">
              <InputGroup label="pH (Initial)" name="ph" value={inputs.ph} step={0.1} onChange={handleInputChange} unit="" />
              <InputGroup label="Calcium (Ca)" name="calcium" value={inputs.calcium} onChange={handleInputChange} unit="mg/L" />
              <InputGroup label="Magnesium (Mg)" name="magnesium" value={inputs.magnesium} onChange={handleInputChange} unit="mg/L" />
              <InputGroup label="Alkalinity" name="alkalinity" value={inputs.alkalinity} onChange={handleInputChange} unit="mg/L CaCO₃" />
              <InputGroup label="Conductivity" name="conductivity" value={inputs.conductivity} onChange={handleInputChange} unit="µS/cm" />
              <InputGroup label="Sulphate" name="sulphate" value={inputs.sulphate} onChange={handleInputChange} unit="mg/L" />
              <InputGroup label="Temperature" name="temperature" value={inputs.temperature} onChange={handleInputChange} unit="°C" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
            <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-4">
              <ChevronRight className="w-4 h-4 text-emerald-600" />
              <h2 className="font-black text-slate-800 uppercase tracking-tight text-[11px]">Softening Targets</h2>
            </div>
            <div className="space-y-4">
              <InputGroup label="Target Calcium" name="targetCa" value={inputs.targetCa} onChange={handleInputChange} unit="mg/L CaCO₃" />
              <InputGroup label="Target Magnesium" name="targetMg" value={inputs.targetMg} onChange={handleInputChange} unit="mg/L CaCO₃" />
            </div>
          </div>
        </section>

        {/* CONTENT: DASHBOARD */}
        <section className="lg:col-span-8 space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ResultCard 
              label="Lime Dose" 
              value={results.limeDose.toFixed(1)} 
              unit="mg/L Ca(OH)₂" 
              icon={<Beaker className="text-white w-5 h-5" />}
              gradient="bg-blue-600"
              footer="Hydroxide Dosage"
            />
            <ResultCard 
              label="Soda Ash" 
              value={results.sodaAshDose.toFixed(1)} 
              unit="mg/L Na₂CO₃" 
              icon={<ArrowRightLeft className="text-white w-5 h-5" />}
              gradient="bg-emerald-600"
              footer="Carbonate Dosage"
            />
            <ResultCard 
              label="Sludge Prod." 
              value={results.sludgeProduced.toFixed(1)} 
              unit="mg/L" 
              icon={<Trash2 className="text-white w-5 h-5" />}
              gradient="bg-amber-600"
              footer="Approx. Dry Solids"
            />
          </div>

          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="font-black text-slate-900 text-lg uppercase tracking-tight leading-none mb-1">Concentration Delta</h2>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Pre vs Post Softening Analysis</p>
              </div>
              <div className="flex gap-4">
                <LegendItem color="bg-slate-200" label="Pre" />
                <LegendItem color="bg-blue-600" label="Post" />
              </div>
            </div>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="parameter" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 9}}
                  />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 20px -5px rgba(0,0,0,0.1)'}}
                  />
                  <Bar dataKey="raw" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={40} />
                  <Bar dataKey="softened" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-5 border-b border-slate-50 pb-3">
                <Database className="w-4 h-4 text-indigo-600" />
                <h3 className="font-black text-slate-800 text-[10px] uppercase tracking-widest">Effluent Chemistry</h3>
              </div>
              <div className="space-y-3">
                <QualityRow label="Equilibrium pH" value={results.softenedPh.toFixed(1)} />
                <QualityRow label="Total Hardness" value={results.softenedHardness.toFixed(1)} unit="mg/L" highlight />
                <QualityRow label="Final Alkalinity" value={results.softenedAlkalinity.toFixed(1)} unit="mg/L" />
                <QualityRow label="Removal %" value={(100 - (results.softenedHardness / results.initialHardness * 100)).toFixed(1)} unit="%" success />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-5 border-b border-slate-50 pb-3">
                <Waves className="w-4 h-4 text-cyan-600" />
                <h3 className="font-black text-slate-800 text-[10px] uppercase tracking-widest">Water Stability</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <StabilityBox 
                  label="LSI" 
                  value={results.lsi.toFixed(2)} 
                  status={results.lsi > 0.5 ? 'Scaling' : results.lsi < -0.5 ? 'Corrosive' : 'Stable'}
                  color={results.lsi > 0.5 ? 'text-orange-600' : results.lsi < -0.5 ? 'text-rose-600' : 'text-emerald-600'}
                />
                <StabilityBox 
                  label="CCPP" 
                  value={results.ccpp.toFixed(1)} 
                  status="mg/L CaCO₃"
                  color="text-slate-800"
                />
              </div>
            </div>
          </div>

          {aiInsights && (
            <div className="bg-slate-900 rounded-3xl p-6 md:p-8 shadow-xl text-slate-50 relative overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-500">
              <div className="absolute -top-10 -right-10 opacity-5">
                <BrainCircuit className="w-40 h-40" />
              </div>
              <div className="flex items-center gap-2.5 mb-5 relative z-10">
                <BrainCircuit className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-black uppercase tracking-tight">Process Assessment</h2>
              </div>
              <div className="space-y-4 relative z-10 text-slate-300 text-sm leading-relaxed border-l-2 border-blue-500/30 pl-4">
                {aiInsights.split('\n').filter(line => line.trim()).map((line, i) => (
                  <p key={i}>{line.replace(/^[•\-\d.]+\s*/, '')}</p>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="bg-white border-t border-slate-200 p-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-300">
          <div className="flex items-center gap-2">
            <Waves className="w-4 h-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">SoftH2O Pro Engineering</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Info className="w-3 h-3" />
              <span className="text-[9px] font-bold uppercase tracking-widest">AWWA Standard Stoichiometry Simulation</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const InputGroup: React.FC<{ 
  label: string; 
  name: string; 
  value: number; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  unit: string;
  step?: number;
}> = ({ label, name, value, onChange, unit, step = 1 }) => (
  <div className="group">
    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center mb-1.5">
      {label}
    </label>
    <div className="relative">
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        step={step}
        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 focus:outline-none transition-all pr-16"
      />
      <span className="absolute right-3 top-2 text-[8px] font-black text-slate-300 uppercase select-none">{unit}</span>
    </div>
  </div>
);

const ResultCard: React.FC<{ label: string; value: string; unit: string; icon: React.ReactNode; gradient: string; footer: string }> = ({ label, value, unit, icon, gradient, footer }) => (
  <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 hover:border-blue-100 transition-colors">
    <div className={`w-10 h-10 ${gradient} rounded-xl flex items-center justify-center mb-5 shadow-inner`}>
      {icon}
    </div>
    <div className="space-y-0.5">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-black text-slate-900 leading-none">{value}</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">{unit}</span>
      </div>
      <p className="text-[8px] font-bold text-slate-300 uppercase tracking-tight mt-1 pt-2 border-t border-slate-50">{footer}</p>
    </div>
  </div>
);

const QualityRow: React.FC<{ label: string; value: string; unit?: string; highlight?: boolean; success?: boolean }> = ({ label, value, unit, highlight, success }) => (
  <div className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{label}</span>
    <div className="flex items-baseline gap-1">
      <span className={`text-xs font-black ${highlight ? 'text-blue-600' : success ? 'text-emerald-600' : 'text-slate-800'}`}>
        {value}
      </span>
      {unit && <span className="text-[8px] font-black text-slate-300 uppercase">{unit}</span>}
    </div>
  </div>
);

const StabilityBox: React.FC<{ label: string; value: string; status: string; color: string }> = ({ label, value, status, color }) => (
  <div className="p-4 bg-slate-50 rounded-2xl">
    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{label}</p>
    <p className={`text-xl font-black ${color} leading-none mb-1`}>{value}</p>
    <p className="text-[8px] font-black text-slate-400 uppercase truncate">{status}</p>
  </div>
);

const LegendItem: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <div className="flex items-center gap-1.5">
    <div className={`w-2 h-2 ${color} rounded-full`}></div>
    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
  </div>
);

export default App;
