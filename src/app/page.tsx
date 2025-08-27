'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Brain, Plus, Download, Webhook } from 'lucide-react';

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [constraints, setConstraints] = useState([]);
  const [apiKey, setApiKey] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [loading, setLoading] = useState(true);

  // Configuration API
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

  // Charger les données au démarrage
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [coursesRes, constraintsRes] = await Promise.all([
        fetch(`${API_BASE}/courses`).catch(() => ({ ok: false })),
        fetch(`${API_BASE}/constraints`).catch(() => ({ ok: false }))
      ]);

      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        setCourses(coursesData);
      }

      if (constraintsRes.ok) {
        const constraintsData = await constraintsRes.json();
        setConstraints(constraintsData);
      }
    } catch (error) {
      console.error('Erreur de chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCourse = async (courseData: any) => {
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
        alert('Cours ajouté avec succès !');
      } else {
        alert('Erreur lors de l\'ajout du cours');
      }
    } catch (error) {
      console.error('Erreur ajout cours:', error);
      alert('Erreur lors de l\'ajout du cours');
    }
  };

  const reorganizePlanning = async () => {
    try {
      const response = await fetch(`${API_BASE}/reorganize`, {
        method: 'POST',
        headers: { 'X-API-Key': apiKey }
      });

      if (response.ok) {
        await loadData();
        alert('Planning réorganisé avec succès !');
      } else {
        alert('Erreur lors de la réorganisation');
      }
    } catch (error) {
      console.error('Erreur réorganisation:', error);
      alert('Erreur lors de la réorganisation');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p>Chargement du planning médical...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <Brain className="text-blue-600" />
            Planning Médical Intelligent
          </h1>
          <p className="text-gray-600">
            Système d'espacement de J pour optimiser la rétention mémorielle
          </p>
        </div>

        {/* Configuration API */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Webhook className="w-5 h-5" />
            Configuration
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clé API (pour modifications)
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Votre clé API"
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook URL (optionnel)
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
              onClick={reorganizePlanning}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              🔄 Réorganiser
            </button>
          </div>
        </div>

        {/* Dashboard Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cours */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Cours ({courses.length})
            </h2>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {courses.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucun cours ajouté</p>
              ) : (
                courses.map((course: any, index: number) => (
                  <div key={course._id || index} className="p-3 bg-gray-50 rounded border-l-4 border-blue-500">
                    <h3 className="font-medium">{course.name}</h3>
                    <p className="text-sm text-gray-600">
                      {course.hoursPerDay}h/jour • {course.sessions?.length || 0} sessions
                    </p>
                    {course.description && (
                      <p className="text-xs text-gray-500 mt-1">{course.description}</p>
                    )}
                  </div>
                ))
              )}
            </div>

            <AddCourseForm onAdd={addCourse} />
          </div>

          {/* Contraintes */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Contraintes ({constraints.length})
            </h2>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {constraints.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucune contrainte ajoutée</p>
              ) : (
                constraints.map((constraint: any, index: number) => (
                  <div key={constraint._id || index} className="p-3 bg-gray-50 rounded border-l-4 border-red-500">
                    <p className="font-medium">
                      {new Date(constraint.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {constraint.startHour}h - {constraint.endHour}h
                    </p>
                    <p className="text-xs text-gray-500">{constraint.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Total Cours</h3>
            <p className="text-2xl font-bold text-blue-600">{courses.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Sessions Planifiées</h3>
            <p className="text-2xl font-bold text-green-600">
              {courses.reduce((acc: number, course: any) => acc + (course.sessions?.length || 0), 0)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Contraintes Actives</h3>
            <p className="text-2xl font-bold text-orange-600">{constraints.length}</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">🚀 Pour commencer :</h3>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Configurez votre clé API dans le champ ci-dessus</li>
            <li>2. Ajoutez vos premiers cours en cliquant sur "Ajouter un cours"</li>
            <li>3. Le système créera automatiquement un planning optimisé</li>
            <li>4. Ajoutez des contraintes si vous avez des indisponibilités</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

// Composant formulaire d'ajout de cours
function AddCourseForm({ onAdd }: { onAdd: (data: any) => void }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    hoursPerDay: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.hoursPerDay) return;

    await onAdd(formData);
    setFormData({ name: '', hoursPerDay: '', description: '', startDate: new Date().toISOString().split('T')[0] });
    setShowForm(false);
  };

  return (
    <div className="mt-4 border-t pt-4">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg w-full justify-center border border-dashed border-blue-300"
        >
          <Plus className="w-4 h-4" />
          Ajouter un cours
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Nom du cours (ex: Anatomie, Physiologie...)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              step="0.5"
              placeholder="Heures/jour"
              value={formData.hoursPerDay}
              onChange={(e) => setFormData({ ...formData, hoursPerDay: e.target.value })}
              className="p-2 border rounded"
              required
            />
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="p-2 border rounded"
            />
          </div>
          <textarea
            placeholder="Description (optionnel)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-2 border rounded"
            rows={2}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Ajouter
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
