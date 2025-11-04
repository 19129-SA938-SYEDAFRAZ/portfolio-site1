'use client';

import { useEffect, useState } from 'react';
import { X, ExternalLink, Github } from 'lucide-react';

interface ProjectData {
  title: string;
  overview: string;
  techStack: string[];
  features: string[];
  challenges: string[];
  outcome: string;
  learnings: string[];
  links: {
    github?: string;
    demo?: string;
  };
  year: string;
}

interface ProjectModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onAskQuestion: (question: string) => void;
}

export default function ProjectModal({ projectId, isOpen, onClose, onAskQuestion }: ProjectModalProps) {
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && projectId) {
      loadProjectData();
    }
  }, [isOpen, projectId]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch project details from backend
      const response = await fetch(`http://localhost:8000/project/${projectId}`);
      if (!response.ok) throw new Error('Failed to load project data');
      
      const data = await response.json();
      setProjectData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleAskAboutProject = () => {
    if (projectData) {
      onAskQuestion(`Tell me more about the ${projectData.title} project`);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex justify-between items-start">
          <div className="flex-1">
            {loading ? (
              <div className="h-8 w-48 bg-white/20 rounded animate-pulse"></div>
            ) : projectData ? (
              <>
                <h2 className="text-2xl font-bold mb-2">{projectData.title}</h2>
                <p className="text-blue-100 text-sm">{projectData.year}</p>
              </>
            ) : null}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={loadProjectData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : projectData ? (
            <div className="space-y-6">
              {/* Overview */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Overview</h3>
                <p className="text-gray-700 leading-relaxed">{projectData.overview}</p>
              </section>

              {/* Tech Stack */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {projectData.techStack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </section>

              {/* Key Features */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Features</h3>
                <ul className="space-y-2">
                  {projectData.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Challenges */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Challenges Faced</h3>
                <ul className="space-y-2">
                  {projectData.challenges.map((challenge, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-amber-600 mr-2">⚠</span>
                      <span className="text-gray-700">{challenge}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Learnings */}
              {projectData.learnings && projectData.learnings.length > 0 && (
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Learnings</h3>
                  <ul className="space-y-2">
                    {projectData.learnings.map((learning, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-purple-600 mr-2">💡</span>
                        <span className="text-gray-700">{learning}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Outcome */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Outcome</h3>
                <p className="text-gray-700 leading-relaxed">{projectData.outcome}</p>
              </section>

              {/* Links */}
              {(projectData.links.github || projectData.links.demo) && (
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Links</h3>
                  <div className="flex flex-wrap gap-3">
                    {projectData.links.github && (
                      <a
                        href={projectData.links.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        <Github size={20} />
                        View Code
                      </a>
                    )}
                    {projectData.links.demo && (
                      <a
                        href={projectData.links.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <ExternalLink size={20} />
                        Live Demo
                      </a>
                    )}
                  </div>
                </section>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        {projectData && !loading && !error && (
          <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleAskAboutProject}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              💬 Ask AI about this project
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
