import React, { useState } from 'react';
import { generateAILearningContent } from '../services/geminiService';
import { generateFullDataset, getRecommendedRowCount } from '../utils/syntheticDataEngine';
import { publishCourseToGraph } from '../services/adminService';

// Helper to parse uploaded CSV text into JSON
const parseCSV = (text: string) => {
  const lines = text.split('\n').filter(l => l.trim());
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const row: any = {};
    headers.forEach((h, i) => (row[h] = values[i]?.trim()));
    return row;
  });
};

const ContentLab: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('Logistics & Operations');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Intermediate');

  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [fullDataset, setFullDataset] = useState<any[]>([]);
  const [dataSource, setDataSource] = useState<'ai' | 'synthetic' | 'manual'>('ai');

  // --- 1. AI GENERATION ---
  const handleGenerate = async () => {
    setLoading(true);
    setGeneratedContent(null);
    setFullDataset([]);

    try {
      const contentText = await generateAILearningContent({
        mode: "blueprint",
        domain: selectedDomain,
        topic,
        difficulty:
          selectedDifficulty.toLowerCase() === "beginner"
            ? "beginner"
            : selectedDifficulty.toLowerCase() === "advanced"
            ? "advanced"
            : "intermediate",
        instructions:
          "Generate a practical AI case study blueprint with keys: caseTitle, narrative, datasetContext.previewRows (3 rows), datasetContext.messyFactors."
      });

      let parsed: any;
      try {
        parsed = JSON.parse(contentText);
      } catch {
        parsed = {
          caseTitle: topic,
          narrative: contentText,
          datasetContext: { previewRows: [], messyFactors: [] }
        };
      }

      setGeneratedContent(parsed);
      setDataSource("ai");
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "AI generation failed.");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. DATA FACTORY: SYNTHETIC ---
  const handleGenerateData = () => {
    if (!generatedContent?.datasetContext?.previewRows) return;

    const count = getRecommendedRowCount(selectedDomain);

    const data = generateFullDataset({
      previewRows: generatedContent.datasetContext.previewRows,
      messyFactors: generatedContent.datasetContext.messyFactors,
      domain: selectedDomain
    });

    setFullDataset(data);
    setDataSource('synthetic');
    alert(`⚡ Generated ${data.length} rows`);
  };

  // --- 3. MANUAL UPLOAD ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const text = evt.target?.result as string;
      const parsedData = parseCSV(text);
      setFullDataset(parsedData);
      setDataSource('manual');
    };
    reader.readAsText(file);
  };

  // --- 4. COMMIT ---
  const handleCommit = async () => {
    if (!generatedContent) return;
    setIsSaving(true);

    const finalContent = {
      ...generatedContent,
      fullDataset:
        fullDataset.length > 0
          ? fullDataset
          : generatedContent.datasetContext.previewRows,
      dataSourceType: dataSource
    };

    const courseId = await publishCourseToGraph(
      finalContent,
      selectedDomain,
      selectedDifficulty
    );

    setIsSaving(false);
    if (courseId) {
      alert("Published successfully");
      window.location.reload();
    } else {
      alert("Error saving content");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8 pb-24 space-y-8">
      <h1 className="text-3xl font-black">Content Lab</h1>

      <input
        value={topic}
        onChange={e => setTopic(e.target.value)}
        placeholder="Case topic"
        className="w-full p-3 border rounded"
      />

      <button
        onClick={handleGenerate}
        disabled={loading || !topic}
        className="bg-indigo-600 text-white px-6 py-3 rounded"
      >
        {loading ? "Generating..." : "Generate Blueprint"}
      </button>

      {generatedContent && (
        <pre className="bg-slate-100 p-4 rounded">
          {JSON.stringify(generatedContent, null, 2)}
        </pre>
      )}

      <button onClick={handleGenerateData}>Generate Dataset</button>
      <input type="file" accept=".csv" onChange={handleFileUpload} />

      <button onClick={handleCommit} disabled={isSaving}>
        {isSaving ? "Saving..." : "Publish"}
      </button>
    </div>
  );
};

export default ContentLab;
