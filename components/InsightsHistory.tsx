import { useState } from 'react';

export default function InsightsHistory({ pastInsights }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpanded = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    pastInsights.length > 0 && (
      <div className="bg-surface border border-border rounded-xl p-6">
        <h3 className="text-xl font-bold text-text-primary mb-4">Histórico de Análises</h3>
        <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
          {pastInsights.map(insight => {
            const isExpanded = insight.id === expandedId;
            return (
              <div
                key={insight.id}
                className={`p-3 bg-background rounded-lg border transition-colors cursor-pointer ${
                  isExpanded ? 'border-border' : 'border-transparent hover:border-border'
                }`}
                onClick={() => toggleExpanded(insight.id)}
              >
                <p className="font-semibold text-text-secondary text-sm">
                  {new Date(insight.created_at).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p className="text-sm text-text-secondary mt-1">{insight.summary}</p>

                {isExpanded && (
                  <div className="mt-3 space-y-2 text-sm text-text-primary">
                    <div>
                      <strong>Principais insights:</strong>
                      <ul className="list-disc list-inside ml-2">
                        {insight.key_insights.map((item: string, index: number) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <strong>Recomendações:</strong>
                      <ul className="list-disc list-inside ml-2">
                        {insight.recommendations.map((item: string, index: number) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    )
  );
}
