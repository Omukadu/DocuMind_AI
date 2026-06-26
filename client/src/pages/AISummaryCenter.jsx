import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Loader2, RefreshCw, FileText, TrendingUp, AlertTriangle, Calendar, CheckSquare } from 'lucide-react';
import { getDocument } from '../services/documentService';
import { generateSummary, getSummary } from '../services/aiService';
import FileTypeIcon from '../components/shared/FileTypeIcon';
import toast from 'react-hot-toast';

export default function AISummaryCenter() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    Promise.all([
      getDocument(documentId),
      getSummary(documentId),
    ]).then(([docRes, sumRes]) => {
      setDoc(docRes.data.document);
      setSummary(sumRes.data.summary);
    }).catch(console.error)
    .finally(() => setLoading(false));
  }, [documentId]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data } = await generateSummary(documentId);
      setSummary(data.summary);
      toast.success('Summary generated!');
    } catch { toast.error('Failed to generate summary'); }
    finally { setGenerating(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={28} className="text-brand-400 animate-spin" />
    </div>
  );

  const sections = summary ? [
    { icon: FileText, label: 'Executive Summary', content: summary.executive, color: 'brand', type: 'text' },
    { icon: TrendingUp, label: 'Key Insights', content: summary.keyInsights, color: 'green', type: 'list' },
    { icon: AlertTriangle, label: 'Risks', content: summary.risks, color: 'red', type: 'list' },
    { icon: Calendar, label: 'Important Dates', content: summary.importantDates, color: 'blue', type: 'list' },
    { icon: CheckSquare, label: 'Action Items', content: summary.actionItems, color: 'yellow', type: 'numbered' },
  ] : [];

  const colorMap = { brand: 'text-brand-400 bg-brand-400/10', green: 'text-green-400 bg-green-400/10', red: 'text-red-400 bg-red-400/10', blue: 'text-blue-400 bg-blue-400/10', yellow: 'text-yellow-400 bg-yellow-400/10' };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-white/5 text-gray-400">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">AI Summary Center</h1>
          {doc && (
            <div className="flex items-center gap-2 mt-1">
              <FileTypeIcon fileType={doc.fileType} size="sm" />
              <span className="text-sm text-gray-400">{doc.name}</span>
            </div>
          )}
        </div>
        <button onClick={handleGenerate} disabled={generating} className="btn-primary">
          {generating ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
          {summary ? 'Regenerate' : 'Generate'} Summary
        </button>
      </div>

      {generating ? (
        <div className="card flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-brand-600/20 flex items-center justify-center mb-4">
            <Sparkles size={28} className="text-brand-400 animate-pulse" />
          </div>
          <h3 className="text-lg font-semibold text-gray-200 mb-2">Analyzing document...</h3>
          <p className="text-gray-500 text-sm">This usually takes 5-10 seconds</p>
          <div className="flex gap-1.5 mt-4">
            {[0,1,2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-brand-400 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      ) : !summary ? (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <Sparkles size={32} className="text-gray-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-200 mb-2">No summary yet</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm">Generate an AI-powered summary with key insights, risks, and action items.</p>
          <button onClick={handleGenerate} className="btn-primary">
            <Sparkles size={15} /> Generate Summary
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map(({ icon: Icon, label, content, color, type }) => content?.length > 0 && (
            <div key={label} className="card">
              <div className={`flex items-center gap-2.5 mb-4 ${colorMap[color].split(' ')[0]}`}>
                <div className={`w-8 h-8 rounded-lg ${colorMap[color]} flex items-center justify-center`}>
                  <Icon size={15} />
                </div>
                <h3 className="font-semibold text-gray-200">{label}</h3>
              </div>
              {type === 'text' ? (
                <p className="text-sm text-gray-300 leading-relaxed">{content}</p>
              ) : type === 'list' ? (
                <ul className="space-y-2">
                  {content.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                      <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${colorMap[color].split(' ')[0].replace('text-', 'bg-')}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <ol className="space-y-2">
                  {content.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                      <span className={`font-bold flex-shrink-0 ${colorMap[color].split(' ')[0]}`}>{i + 1}.</span>
                      {item}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          ))}
          <p className="text-xs text-gray-600 text-center">
            Summary generated {summary.generatedAt ? new Date(summary.generatedAt).toLocaleString() : ''}
          </p>
        </div>
      )}
    </div>
  );
}
