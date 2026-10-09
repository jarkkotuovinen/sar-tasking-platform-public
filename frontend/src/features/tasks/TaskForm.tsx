import { useState } from 'react';
import type { ResolutionMode, Polarization, Priority } from '../../types';

interface TaskFormProps {
  currentAOI: any;
  onSubmit: (data: any) => void;
  loading?: boolean;
}

export const TaskForm = ({ currentAOI, onSubmit, loading }: TaskFormProps) => {
  const [resolution, setResolution] = useState<ResolutionMode>('STRIPMAP');
  const [polarization, setPolarization] = useState<Polarization>('VV');
  const [priority, setPriority] = useState<Priority>('MEDIUM');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentAOI) {
      alert('Please draw an Area of Interest on the map first');
      return;
    }

    onSubmit({
      aoi: currentAOI,
      resolution,
      polarization,
      lookDirection: 'RIGHT',
      priority,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-5 bg-slate-900 rounded-xl space-y-4 border border-slate-700 shadow-xl">
      <h3 className="text-lg font-semibold text-white mb-2">Mission Parameters</h3>

      {/* AOI Status */}
      <div
        className={`p-3 rounded-lg text-sm font-medium ${
          currentAOI
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
            : 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
        }`}
      >
        {currentAOI
          ? `✓ AOI Locked: ${currentAOI.area} km²`
          : '⚠ Define AOI on map'}
      </div>

      {/* Resolution Mode */}
      <div>
        <label htmlFor="resolution" className="block text-sm font-medium text-slate-300 mb-2">
          Resolution Mode
        </label>
        <select
          id="resolution"
          value={resolution}
          onChange={(e) => setResolution(e.target.value as ResolutionMode)}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        >
          <option value="SPOTLIGHT">Spotlight (&lt; 1m, small area)</option>
          <option value="STRIPMAP">Stripmap (1-3m, medium area)</option>
          <option value="SCANSAR">ScanSAR (10-100m, wide area)</option>
        </select>
      </div>

      {/* Polarization */}
      <div>
        <label htmlFor="polarization" className="block text-sm font-medium text-slate-300 mb-2">
          Polarization
        </label>
        <select
          id="polarization"
          value={polarization}
          onChange={(e) => setPolarization(e.target.value as Polarization)}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        >
          <option value="VV">VV (Vertical-Vertical)</option>
          <option value="HH">HH (Horizontal-Horizontal)</option>
          <option value="VH">VH (Cross-pol)</option>
          <option value="HV">HV (Cross-pol)</option>
        </select>
      </div>

      {/* Priority */}
      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-slate-300 mb-2">
          Priority Level
        </label>
        <select
          id="priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!currentAOI || loading}
        className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
          currentAOI && !loading
            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg shadow-cyan-500/50'
            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
        }`}
      >
        {loading ? 'Submitting Mission...' : 'Submit Tasking Request'}
      </button>
    </form>
  );
};
