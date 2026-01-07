import React, { useState } from 'react';
import { generateAILearningContent } from '../services/geminiService';
import { generateFullDataset, getRecommendedRowCount } from '../utils/syntheticDataEngine';
import { publishCourseToGraph } from '../services/adminService';
import { useNavigate } from 'react-router-dom';

// Helper to parse uploaded CSV text into JSON
const parseCSV = (text: string) => {
  const lines = text.split('\n').filter(l => l.trim());
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const row: any = {};
    headers.forEach((h, i) => row[h] = values[i]?.trim());
    return row;
  });
};

const ContentLab: React.FC = () => {
  const navigate = useNavigate();
  
  // Input State
  const [topic, setTopic] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('HR / People Analytics');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Intermediate');
  
  // Process State
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Data State
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [fullDataset, setFullDataset] = useState<any[]>([]);
  const [dataSource, setDataSource] = useState<'ai' | 'synthetic' | 'manual'>('ai');

  // --- 1. AI GENERATION ---
  const handleGenerate = async () => {
    setLoading(true);
    setGeneratedContent(null);
    setFullDataset([]);
    
    const content = await generateAILearningContent(topic, selectedDomain);
    
    setGeneratedContent(content);
    setLoading(false);
    setDataSource('ai'); // Reset source
  };

  // --- 2. DATA FACTORY: SYNTHETIC ---
  const handleGenerateData = () => {
    if (!generatedContent?.datasetContext?.previewRows) return;
    
    // Auto-detect domain for row count (HR=100+, Ops=1000+)
    const count = getRecommendedRowCount(selectedDomain);
    
    const data = generateFullDataset({
      previewRows: generatedContent.datasetContext.previewRows,
      messyFactors: generatedContent.datasetContext.messyFactors,
      domain: selectedDomain
    });

    setFullDataset(data);
    setDataSource('synthetic');
    alert(`⚡ Successfully generated ${data.length} realistic rows for ${selectedDomain}`);
  };

  // --- 3. DATA FACTORY: MANUAL UPLOAD ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const parsedData = parseCSV(text);
      
      if (parsedData.length > 0) {
        setFullDataset(parsedData);
        setDataSource('manual');
        alert(`📂 Loaded ${parsedData.length} rows from ${file.name}`);
      }
    };
    reader.readAsText(file);
  };

  // --- 4. COMMIT TO DB ---
  const handleCommit = async () => {
    if (!generatedContent) return;
    setIsSaving(true);
    
    // Merge the high-volume data into the final object
    const finalContent = {
      ...generatedContent,
      fullDataset: fullDataset.length > 0 ? fullDataset : generatedContent.datasetContext.previewRows,
      dataSourceType: dataSource
    };

    const courseId = await publishCourseToGraph(finalContent, selectedDomain, selectedDifficulty);

    setIsSaving(false);
    if (courseId) {
      alert("Success! Case Study & Dataset published to Learning Graph.");
      navigate('/'); // Redirect to dashboard
    } else {
      alert("Error saving to database. Check console.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8 pb-24 space-y-8">
      
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Content Lab</h1>
        <p className="text-slate-500">Generate, Data-Fication, and Deployment Pipeline.</p>
      </div>

      {/* INPUT CARD */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Domain</label>
          <select 
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500"
          >
            <option>HR / People Analytics</option>
            <option>Supply Chain & Ops</option>
            <option>Marketing Analytics</option>
            <option>Finance & Risk</option>
          </select>
        </div>
        <div>
           <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Difficulty</label>
           <select 
             value={selectedDifficulty}
             onChange={(e) => setSelectedDifficulty(e.target.value)}
             className="w-full p-3 rounded-xl border border-slate-200 font-bold text-slate-700"
           >
             <option>Beginner</option>
             <option>Intermediate</option>
             <option>Advanced</option>
           </select>
        </div>
        <div className="md:col-span-3">
           <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Case Topic</label>
           <div className="flex gap-4">
             <input 
               type="text" 
               value={topic}
               onChange={(e) => setTopic(e.target.value)}
               placeholder="e.g. Employee Attrition in Bangalore Tech Sector"
               className="flex-1 p-3 rounded-xl border border-slate-200 font-medium"
             />
             <button 
               onClick={handleGenerate}
               disabled={loading || !topic}
               className="bg-indigo-600 text-white px-8 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2"
             >
               {loading ? 'Designing...' : '✨ Generate Blueprint'}
             </button>
           </div>
        </div>
      </div>

      {/* RESULTS AREA */}
      {generatedContent && (
         <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            {/* NARRATIVE PREVIEW */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
               <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase mb-4 inline-block">
                 AI Blueprint Ready
               </span>
               <h2 className="text-2xl font-bold text-slate-900 mb-4">{generatedContent.caseTitle}</h2>
               <p className="text-slate-600 leading-relaxed mb-6">{generatedContent.narrative}</p>
            </div>

            {/* === THE HYBRID DATA FACTORY === */}
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 shadow-inner">
               <div className="flex justify-between items-center mb-6">
                 <div>
                   <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                     <span className="text-2xl">🏭</span> Data Factory
                   </h2>
                   <p className="text-slate-500 text-sm">Scale your dataset or bring your own.</p>
                 </div>
                 
                 {/* SOURCE INDICATOR */}
                 <span className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border
                   ${dataSource === 'ai' ? 'bg-white text-slate-500 border-slate-200' : 
                     dataSource === 'synthetic' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 
                     'bg-amber-100 text-amber-700 border-amber-200'}`}>
                   Active Source: {dataSource}
                 </span>
               </div>

               {/* FACTORY CONTROLS */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                 
                 {/* BUTTON A: AUTO-SCALE */}
                 <button 
                   onClick={handleGenerateData}
                   className="p-4 bg-white border-2 border-indigo-100 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all group text-left"
                 >
                   <span className="block text-indigo-600 font-black text-lg mb-1 group-hover:scale-105 transition-transform">
                     ⚡ Synthetic Scale-Up
                   </span>
                   <span className="text-xs text-slate-500 font-medium">
                     Generate {getRecommendedRowCount(selectedDomain)}+ realistic rows based on this blueprint.
                   </span>
                 </button>

                 {/* BUTTON B: MANUAL UPLOAD */}
                 <label className="p-4 bg-white border-2 border-slate-200 rounded-xl hover:border-slate-500 hover:shadow-md transition-all cursor-pointer text-left">
                   <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                   <span className="block text-slate-700 font-black text-lg mb-1">
                     📂 Upload Real Data
                   </span>
                   <span className="text-xs text-slate-500 font-medium">
                     Override AI data with your own CSV file.
                   </span>
                 </label>
               </div>

               {/* DATA PREVIEW TABLE */}
               <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 text-slate-500">
                      <tr>
                        {Object.keys(fullDataset[0] || generatedContent.datasetContext.previewRows[0] || {}).map(k => (
                          <th key={k} className="px-4 py-3 font-bold uppercase text-xs">{k}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(fullDataset.length > 0 ? fullDataset.slice(0, 5) : generatedContent.datasetContext.previewRows).map((row: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-50">
                          {Object.values(row).map((v: any, j) => (
                             <td key={j} className="px-4 py-3 text-slate-600 font-mono text-xs whitespace-nowrap">{v}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="bg-slate-50 px-4 py-2 text-center text-xs text-slate-400 font-bold border-t border-slate-200">
                    {fullDataset.length > 0 
                      ? `Previewing 5 of ${fullDataset.length} rows`
                      : "Previewing AI Draft (3 rows)"}
                  </div>
               </div>
            </div>

            {/* COMMIT ACTION */}
            <button 
              onClick={handleCommit}
              disabled={isSaving}
              className={`w-full py-6 rounded-2xl font-black text-xl shadow-xl transition-all flex items-center justify-center gap-3
                ${isSaving ? 'bg-slate-800 text-slate-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'}`}
            >
              {isSaving ? 'Publishing to Graph...' : '🚀 Launch Case Study'}
            </button>
         </div>
       )}
    </div>
  );
};

export default ContentLab;
