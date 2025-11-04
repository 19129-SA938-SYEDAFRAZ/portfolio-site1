'use client';

import { useState, useEffect } from 'react';
import ChatInterface from '@/components/ChatInterface';
import KnowledgeGraph from '@/components/KnowledgeGraph';
import Timeline from '@/components/Timeline';
import ProjectModal from '@/components/ProjectModal';
import { healthCheck } from '@/lib/api';
import { useChatStore } from '@/lib/store/chatStore';

type Tab = 'chat' | 'graph' | 'timeline';

export default function Home() {
  const [backendStatus, setBackendStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
  const [highlightedYear, setHighlightedYear] = useState<number | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const { addMessage, setLoading } = useChatStore();

  useEffect(() => {
    checkBackend();
  }, []);

  const checkBackend = async () => {
    try {
      const isOnline = await healthCheck();
      setBackendStatus(isOnline ? 'connected' : 'disconnected');
    } catch (error) {
      setBackendStatus('disconnected');
    }
  };

  const handleNodeClick = (nodeId: string, nodeLabel: string, nodeType: string) => {
    // If it's a project node, open the project modal
    if (nodeType === 'project') {
      setSelectedProjectId(nodeId);
      setIsProjectModalOpen(true);
      return;
    }
    
    // For non-project nodes, switch to chat tab
    setActiveTab('chat');
    
    // Generate question based on node type
    let question = '';
    if (nodeType === 'skill') {
      question = `What experience do you have with ${nodeLabel}?`;
    } else if (nodeType === 'experience') {
      question = `Tell me about your experience: ${nodeLabel}`;
    }
    
    // Add the question as a user message (it will trigger the chat)
    if (question) {
      // Simulate typing the question in chat
      const messageInput = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (messageInput) {
        messageInput.value = question;
        messageInput.focus();
      }
    }
  };

  const handleProjectModalClose = () => {
    setIsProjectModalOpen(false);
    setSelectedProjectId(null);
  };

  const handleAskQuestionFromModal = (question: string) => {
    // Switch to chat tab
    setActiveTab('chat');
    
    // Wait for tab switch, then populate input
    setTimeout(() => {
      const messageInput = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (messageInput) {
        messageInput.value = question;
        messageInput.focus();
      }
    }, 100);
  };

  const handleYearDetected = (year: number) => {
    // Set highlighted year for timeline
    setHighlightedYear(year);
    
    // Show a notification that user can view this in timeline
    // Could optionally auto-switch to timeline tab
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <header className="px-8 py-12">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            AI-Powered Portfolio
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Explore my work through intelligent conversation
          </p>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm">
            <div className={`w-2 h-2 rounded-full ${
              backendStatus === 'connected' ? 'bg-green-500 animate-pulse' : 
              backendStatus === 'disconnected' ? 'bg-red-500' : 
              'bg-yellow-500 animate-pulse'
            }`} />
            <span className="text-sm text-gray-600">
              {backendStatus === 'connected' ? 'AI Assistant Online' : 
               backendStatus === 'disconnected' ? 'AI Assistant Offline' : 
               'Connecting...'}
            </span>
          </div>
        </div>
      </header>

      <main className="px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'chat'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'bg-white/50 text-gray-600 hover:bg-white/75'
              }`}
            >
              💬 Chat Assistant
            </button>
            <button
              onClick={() => setActiveTab('graph')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'graph'
                  ? 'bg-white text-purple-600 shadow-md'
                  : 'bg-white/50 text-gray-600 hover:bg-white/75'
              }`}
            >
              🕸️ Knowledge Graph
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'timeline'
                  ? 'bg-white text-green-600 shadow-md'
                  : 'bg-white/50 text-gray-600 hover:bg-white/75'
              }`}
            >
              📅 Timeline
            </button>
          </div>

          {/* Tab Content */}
          <div className="h-[600px]">
            {activeTab === 'chat' && (
              <ChatInterface onYearDetected={handleYearDetected} />
            )}
            {activeTab === 'graph' && (
              <KnowledgeGraph 
                onNodeClick={handleNodeClick}
                highlightedNodes={highlightedNodes}
              />
            )}
            {activeTab === 'timeline' && (
              <Timeline highlightedYear={highlightedYear} />
            )}
          </div>

          {/* Timeline notification */}
          {highlightedYear && activeTab === 'chat' && (
            <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded-lg flex items-center justify-between animate-fadeIn">
              <span className="text-green-800">
                📅 Want to see <strong>{highlightedYear}</strong> in the timeline view?
              </span>
              <button
                onClick={() => setActiveTab('timeline')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                View Timeline
              </button>
            </div>
          )}

          {/* Project Detail Modal */}
          {selectedProjectId && (
            <ProjectModal
              projectId={selectedProjectId}
              isOpen={isProjectModalOpen}
              onClose={handleProjectModalClose}
              onAskQuestion={handleAskQuestionFromModal}
            />
          )}

                    <div className="grid md:grid-cols-5 gap-6 mt-12">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">🤖</div>
              <h3 className="font-semibold text-lg mb-2">AI-Powered</h3>
              <p className="text-sm text-gray-600">
                RAG with Gemini AI for context-aware responses
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">🕸️</div>
              <h3 className="font-semibold text-lg mb-2">Knowledge Graph</h3>
              <p className="text-sm text-gray-600">
                Visual map of skills, projects, and connections
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">📅</div>
              <h3 className="font-semibold text-lg mb-2">Timeline View</h3>
              <p className="text-sm text-gray-600">
                Journey through years with achievements
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">📚</div>
              <h3 className="font-semibold text-lg mb-2">Vector Search</h3>
              <p className="text-sm text-gray-600">
                Semantic search through professional history
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">💬</div>
              <h3 className="font-semibold text-lg mb-2">Interactive</h3>
              <p className="text-sm text-gray-600">
                Ask about specific years or projects
              </p>
            </div>
          </div>

          <footer className="text-center mt-12 text-gray-500 text-sm">
            <p>Built with Next.js, FastAPI, ChromaDB, and Gemini AI</p>
          </footer>
        </div>
      </main>
    </div>
  );
}
