'use client';

import { useEffect, useState } from 'react';
import { Calendar, Award, Code } from 'lucide-react';

interface TimelineEntry {
  year: number;
  title: string;
  details: string;
  achievements?: string[];
  technologies?: string[];
}

interface TimelineProps {
  highlightedYear?: number | null;
}

export default function Timeline({ highlightedYear }: TimelineProps) {
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTimeline();
  }, []);

  useEffect(() => {
    // Scroll to highlighted year when it changes
    if (highlightedYear) {
      const element = document.getElementById(`year-${highlightedYear}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightedYear]);

  const loadTimeline = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/timeline');
      if (!response.ok) throw new Error('Failed to load timeline');
      
      const data = await response.json();
      setTimeline(data.timeline || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load timeline');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full bg-white rounded-2xl shadow-lg p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading timeline...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full bg-white rounded-2xl shadow-lg p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadTimeline}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center gap-3">
          <Calendar size={32} />
          <div>
            <h2 className="text-2xl font-bold">Career Timeline</h2>
            <p className="text-blue-100">My journey through the years</p>
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(600px - 120px)' }}>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 via-purple-400 to-pink-400"></div>

          {/* Timeline entries */}
          <div className="space-y-8">
            {timeline.map((entry, index) => {
              const isHighlighted = highlightedYear === entry.year;
              
              return (
                <div
                  key={entry.year}
                  id={`year-${entry.year}`}
                  className={`relative pl-20 transition-all duration-500 ${
                    isHighlighted ? 'scale-105' : ''
                  }`}
                >
                  {/* Year badge */}
                  <div
                    className={`absolute left-0 w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                      isHighlighted
                        ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg scale-110 ring-4 ring-blue-200'
                        : 'bg-white text-blue-600 border-4 border-blue-400'
                    }`}
                  >
                    {entry.year}
                  </div>

                  {/* Content card */}
                  <div
                    className={`bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border-2 ${
                      isHighlighted
                        ? 'border-blue-400 shadow-blue-200'
                        : 'border-gray-200'
                    }`}
                  >
                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                      {isHighlighted && <span className="text-2xl">📍</span>}
                      {entry.title}
                    </h3>

                    {/* Details */}
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {entry.details}
                    </p>

                    {/* Achievements */}
                    {entry.achievements && entry.achievements.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Award size={18} className="text-amber-600" />
                          <h4 className="font-semibold text-gray-800">Key Achievements</h4>
                        </div>
                        <ul className="space-y-1.5 ml-6">
                          {entry.achievements.map((achievement, idx) => (
                            <li key={idx} className="text-gray-700 flex items-start gap-2">
                              <span className="text-green-600 mt-1">✓</span>
                              <span>{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Technologies */}
                    {entry.technologies && entry.technologies.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Code size={18} className="text-blue-600" />
                          <h4 className="font-semibold text-gray-800">Technologies</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {entry.technologies.map((tech, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* End marker */}
        <div className="relative pl-20 mt-8">
          <div className="absolute left-0 w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
            <span className="text-2xl">🚀</span>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-300">
            <p className="text-lg font-semibold text-purple-900">
              Continuing to build and learn...
            </p>
            <p className="text-purple-700 mt-2">
              Excited for what comes next in my journey!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
