
import React, { useState, useMemo, useEffect } from 'react';
import { WaterQualityData, SofteningResults, ChartDataPoint } from './types';
import { calculateSoftening } from './services/softeningCalculations';
import { getSofteningAdvice } from './services/geminiService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  Droplets, Beaker, Database, FileText, ChevronRight, Activity, Zap, 
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
    const checkKey = async () => {
      try {
        if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
          const selected = await window.aistudio.hasSelectedApiKey();
          setHasKey(selected);
        } else {
          // If the platform doesn't support the selection API, assume we proceed
          setHasKey(true); 
        }
      } catch (err) {
        console.error("Key check error:", err);
        setHasKey(true); // Fallback to avoid deadlocking the UI
      }
    };
    checkKey();
  }, []);

  const handleOpenKey = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
      setHasKey(true); // Proceed immediately as per instructions
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
    const advice = await getSofteningAdvice(inputs, results);
    if (advice === "ERROR_KEY_REQUIRED") {
      setHasKey(false);
    } else {
      setAiInsights(advice);
    }
    setLoadingInsights(false);
  };

  // Loading Screen while verifying environment
  if (hasKey === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Initializing SoftH2O Engine...</p>
        </div>
      </div>
    );
  }

  // Key Selection Screen
  if (hasKey === false) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-10 h-10 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">API Key Required</h1>
            <p className="text-slate-500 mt-2">To access AI engineering analysis, please select a billing-enabled API key.</p>
          </div>
          <button 
            onClick={handleOpenKey}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg"
          >
            Select API Key
          </button>
          <p className="text-xs text-slate-400">
            Visit the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline text-blue-500">billing documentation</a> for details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur-md bg-opacity-90">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg text-white">
              <Waves className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-slate-900 uppercase leading-none">SoftH2O Pro</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Simulation Engine</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={fetchInsights}
              disabled={loadingInsights}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition-all text-sm font-bold text-white px-5 py-2.5 rounded-full shadow-md"
            >
              {loadingInsights ? (
                <Zap className="w-4 h-4 animate-spin text-blue-400" />
              ) : (
                <BrainCircuit className="w-4 h-4 text-blue-400" />
              )}
              {loadingInsights ? 'Analyzing...' : 'AI Insights'}
            </button>
            <button onClick={() => setHasKey(false)} className="p-2 text-slate-400 hover:text-slate-600">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sidebar: Inputs */}
        <section className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600"></div>
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
              <Activity className="w-5 h-5 text-blue-600" />
              <h2 className="font-extrabold text-slate-800 uppercase tracking-tight text-sm">Raw Water Parameters</h2>
            </div>
            
            <div className="space-y-5">
              <InputGroup label="pH" name="ph" value={inputs.ph} step={0.1} onChange={handleInputChange} unit="" />
              <InputGroup label="Calcium (mg/L Ca)" name="calcium" value={inputs.calcium} onChange={handleInputChange} unit="mg/L" />
              <InputGroup label="Magnesium (mg/L Mg)" name="magnesium" value={inputs.magnesium} onChange={handleInputChange} unit="mg/L" />
              <InputGroup label="Alkalinity" name="alkalinity" value={inputs.alkalinity} onChange={handleInputChange} unit="mg/L CaCO₃" />
              <InputGroup label="Conductivity" name="conductivity" value={inputs.conductivity} onChange={handleInputChange} unit="µS/cm" />
              <InputGroup label="Sulphate" name="sulphate" value={inputs.sulphate} onChange={handleInputChange} unit="mg/L" />
              <InputGroup label="Temperature" name="temperature" value={inputs.temperature} onChange={handleInputChange} unit="°C" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
              <ChevronRight className="w-5 h-5 text-emerald-600" />
              <h2 className="font-extrabold text-slate-800 uppercase tracking-tight text-sm">Target Treatment</h2>
            </div>
            <div className="space-y-5">
              <InputGroup label="Target Calcium" name="targetCa" value={inputs.targetCa} onChange={handleInputChange} unit="mg/L CaCO₃" />
              <InputGroup label="Target Magnesium" name="targetMg" value={inputs.targetMg} onChange={handleInputChange} unit="mg/L CaCO₃" />
            </div>
          </div>
        </section>

        {/* Main Panel: Results */}
        <section className="lg:col-span-8 space-y-6">
          
          {/* Chemical Dosage Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ResultCard 
              label="Lime Demand" 
              value={results.limeDose.toFixed(1)} 
              unit="mg/L Ca(OH)₂" 
              icon={<Beaker className="text-white w-6 h-6" />}
              gradient="bg-gradient-to-br from-indigo-600 to-blue-700"
              footer="Hydroxide Dosage"
            />
            <ResultCard 
              label="Soda Ash Demand" 
              value={results.sodaAshDose.toFixed(1)} 
              unit="mg/L Na₂CO₃" 
              icon={<ArrowRightLeft className="text-white w-6 h-6" />}
              gradient="bg-gradient-to-br from-emerald-600 to-teal-700"
              footer="Carbonate Dosage"
            />
            <ResultCard 
              label="Dry Sludge" 
              value={results.sludgeProduced.toFixed(1)} 
              unit="mg/L Solids" 
              icon={<Trash2 className="text-white w-6 h-6" />}
              gradient="bg-gradient-to-br from-amber-500 to-orange-600"
              footer="Approx. Production"
            />
          </div>

          {/* Visualization Section */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="font-extrabold text-slate-800 text-xl tracking-tight">Hardness Removal Analysis</h2>
                <p className="text-slate-400 text-sm">Comparison of species in mg/L as CaCO₃</p>
              </div>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-slate-200 rounded-full"></div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Raw Water</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Softened</span>
                </div>
              </div>
            </div>
            
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="parameter" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 10}}
                  />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', padding: '12px'}}
                  />
                  <Bar dataKey="raw" fill="#e2e8f0" radius={[6, 6, 0, 0]} barSize={48} />
                  <Bar dataKey="softened" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Secondary Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                <Database className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-tight">Post-Treatment Profile</h3>
              </div>
              <div className="space-y-4">
                <QualityRow label="Equilibrium pH" value={results.softenedPh.toFixed(1)} />
                <QualityRow label="Total Hardness" value={results.softenedHardness.toFixed(1)} unit="mg/L CaCO₃" highlight />
                <QualityRow label="Alkalinity" value={results.softenedAlkalinity.toFixed(1)} unit="mg/L CaCO₃" />
                <QualityRow label="Hardness Reduction" value={(results.initialHardness - results.softenedHardness).toFixed(1)} unit="mg/L" success />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                <Waves className="w-5 h-5 text-cyan-600" />
                <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-tight">Saturation & Stability</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl flex flex-col justify-between">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Langelier Index</p>
                  <div>
                    <p className={`text-2xl font-black ${results.lsi > 0.5 ? 'text-orange-600' : results.lsi < -0.5 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {results.lsi > 0 ? '+' : ''}{results.lsi.toFixed(2)}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                      {results.lsi > 0.5 ? 'Scale Forming' : results.lsi < -0.5 ? 'Corrosive' : 'Stable'}
                    </p>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl flex flex-col justify-between">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">CCPP</p>
                  <div>
                    <p className="text-2xl font-black text-slate-800">
                      {results.ccpp.toFixed(1)}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">mg/L CaCO₃</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Insights Display */}
          {aiInsights && (
            <div className="bg-indigo-900 rounded-3xl p-8 shadow-xl text-indigo-50 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <BrainCircuit className="w-32 h-32" />
              </div>
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-2 bg-indigo-700 rounded-xl">
                  <BrainCircuit className="w-6 h-6 text-blue-300" />
                </div>
                <h2 className="text-xl font-bold">Process Engineering Assessment</h2>
              </div>
              <div className="prose prose-invert max-w-none text-indigo-100 leading-relaxed relative z-10">
                {aiInsights.split('\n').map((line, i) => (
                  <p key={i} className="mb-2 text-sm md:text-base">{line}</p>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 p-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-slate-400">
          <div className="flex items-center gap-2">
            <Waves className="w-5 h-5 text-slate-300" />
            <p className="text-xs font-bold uppercase tracking-widest">SoftH2O Pro v2.5.0</p>
          </div>
          <div className="flex gap-8 items-center">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Calculations based on AWWA Standard Stoichiometry</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// --- Helper Components ---

const InputGroup: React.FC<{ 
  label: string; 
  name: string; 
  value: number; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  unit: string;
  step?: number;
}> = ({ label, name, value, onChange, unit, step = 1 }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
      {label}
    </label>
    <div className="relative group">
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        step={step}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all pr-16"
      />
      <span className="absolute right-3 top-2.5 text-[9px] font-black text-slate-400 uppercase bg-white px-1.5 py-0.5 rounded border border-slate-100">{unit || '—'}</span>
    </div>
  </div>
);

const ResultCard: React.FC<{ label: string; value: string; unit: string; icon: React.ReactNode; gradient: string; footer: string }> = ({ label, value, unit, icon, gradient, footer }) => (
  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 group hover:border-slate-300 transition-all">
    <div className={`w-12 h-12 ${gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <div className="space-y-1">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-black text-slate-900">{value}</span>
        <span className="text-xs font-bold text-slate-400">{unit}</span>
      </div>
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter pt-2 border-t border-slate-50 mt-3">{footer}</p>
    </div>
  </div>
);

const QualityRow: React.FC<{ label: string; value: string; unit?: string; highlight?: boolean; success?: boolean }> = ({ label, value, unit, highlight, success }) => (
  <div className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0 group">
    <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">{label}</span>
    <div className="flex items-baseline gap-1.5">
      <span className={`text-sm font-black ${highlight ? 'text-blue-600' : success ? 'text-emerald-600' : 'text-slate-800'} transition-all`}>
        {value}
      </span>
      {unit && <span className="text-[9px] font-black text-slate-400 uppercase">{unit}</span>}
    </div>
  </div>
);

export default App;
