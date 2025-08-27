// Copier le code frontend React de l'artefact précédent
// (Code complet fourni séparément pour éviter la longueur)
export default function MedicalPlannerApp() {
  // Code React complet ici
  import React, { useState, useEffect } from 'react';
  import { Calendar, Clock, Brain, Plus, ChevronLeft, ChevronRight, Download, Upload, Webhook } from 'lucide-react';

  const MedicalPlannerApp = () => {
    const [courses, setCourses] = useState([]);
    const [constraints, setConstraints] = useState([]);
    const [currentWeek, setCurrentWeek] = useState(0);
    const [apiKey, setApiKey] = useState('');
    const [webhookUrl, setWebhookUrl] = useState('');

    // Configuration API
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

    // Charger les données au démarrage
    useEffect(() => {
      loadData();
    }, []);

    const loadData = async () => {
      try {
        const [coursesRes, constraintsRes] = await Promise.all([
          fetch(`${API_BASE}/courses`),
          fetch(`${API_BASE}/constraints`)
        ]);

        const coursesData = await coursesRes.json();
        const constraintsData = await constraintsRes.json();

        setCourses(coursesData);
        setConstraints(constraintsData);
      } catch (error) {
        console.error('Erreur de chargement:', error);
      }
    };

    const addCourse = async (courseData) => {
      try {
        const response = await fetch(`${API_BASE}/courses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': apiKey
          },
          body: JSON.stringify(courseData)
        });

        if (response.ok) {
          const newCourse = await response.json();
          setCourses(prev => [...prev, newCourse]);

          // Notifier les ordonnanceurs via webhook
          if (webhookUrl) {
            await fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'course_added',
                data: newCourse,
                timestamp: new Date().toISOString()
              })
            });
          }
        }
      } catch (error) {
        console.error('Erreur ajout cours:', error);
      }
    };

    const addConstraint = async (constraintData) => {
      try {
        const response = await fetch(`${API_BASE}/constraints`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': apiKey
          },
          body: JSON.stringify(constraintData)
        });

        if (response.ok) {
          const newConstraint = await response.json();
          setConstraints(prev => [...prev, newConstraint]);

          // Réorganiser automatiquement
          await reorganizePlanning();

          // Notifier via webhook
          if (webhookUrl) {
            await fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'constraint_added',
                data: newConstraint,
                timestamp: new Date().toISOString()
              })
            });
          }
        }
      } catch (error) {
        console.error('Erreur ajout contrainte:', error);
      }
    };

    const reorganizePlanning = async () => {
      try {
        const response = await fetch(`${API_BASE}/reorganize`, {
          method: 'POST',
          headers: { 'X-API-Key': apiKey }
        });

        if (response.ok) {
          await loadData(); // Recharger les données
        }
      } catch (error) {
        console.error('Erreur réorganisation:', error);
      }
    };

    const exportData = async () => {
      try {
        const response = await fetch(`${API_BASE}/export`);
        const data = await response.json();

        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `planning-medical-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
      } catch (error) {
        console.error('Erreur export:', error);
      }
    };

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
              <Brain className="text-blue-600" />
              Agent Médical - Version Déployable
            </h1>
            <p className="text-gray-600">
              Compatible Make/n8n • API REST • Webhooks • Export/Import
            </p>
          </div>

          {/* Configuration API */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Webhook className="w-5 h-5" />
              Configuration API & Intégrations
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clé API (pour Make/n8n)
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Votre clé API sécurisée"
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook URL (notifications)
                </label>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://hook.make.com/..."
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={exportData}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Download className="w-4 h-4" />
                Exporter JSON
              </button>

              <button
                onClick={reorganizePlanning}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                🔄 Réorganiser
              </button>
            </div>
          </div>

          {/* Interface Planning (similaire à l'artefact précédent) */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-center text-gray-500 py-8">
              <Brain className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">Interface Planning</h3>
              <p className="text-sm">
                L'interface complète sera identique à l'artefact précédent
                <br />
                avec en plus les fonctionnalités API et webhooks
              </p>
            </div>
          </div>

          {/* Documentation API */}
          <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">📚 Documentation API</h2>

            <div className="space-y-4 text-sm">
              <div className="bg-gray-50 p-3 rounded">
                <strong>Base URL:</strong> <code>https://votre-domaine.com/api</code>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-green-600">📗 GET Endpoints</h4>
                  <div className="space-y-1 text-xs">
                    <div><code>GET /courses</code> - Liste des cours</div>
                    <div><code>GET /constraints</code> - Liste des contraintes</div>
                    <div><code>GET /planning/week/:offset</code> - Planning hebdomadaire</div>
                    <div><code>GET /planning/today</code> - Planning du jour</div>
                    <div><code>GET /export</code> - Export complet JSON</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-blue-600">📘 POST Endpoints</h4>
                  <div className="space-y-1 text-xs">
                    <div><code>POST /courses</code> - Ajouter un cours</div>
                    <div><code>POST /constraints</code> - Ajouter une contrainte</div>
                    <div><code>POST /reorganize</code> - Réorganiser le planning</div>
                    <div><code>POST /import</code> - Importer des données</div>
                    <div><code>POST /sessions/:id/complete</code> - Marquer session terminée</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default MedicalPlannerApp;
}
