import React, { useState, useEffect } from 'react';
import {
  Add,
  Edit,
  Delete,
  Search,
  FilterList,
  GetApp,
  CheckBox,
  CheckBoxOutlineBlank,
  Close,
  Save,
  ArrowUpward,
  ArrowDownward,
  People,
  LocationCity,
  TrendingUp
} from '@mui/icons-material';
import { wardsService } from '../services/supabase/wards.service';
import type { Ward } from '../types/database';
import { SkeletonTable, SkeletonCard } from '../components/skeletons';

interface WardWithConstituency extends Ward {
  constituency?: {
    id: string;
    name: string;
    code: string;
  };
}

type SortField = 'ward_number' | 'name' | 'voter_count' | 'population';
type SortDirection = 'asc' | 'desc';

export default function WardsList() {
  const [wards, setWards] = useState<WardWithConstituency[]>([]);
  const [filteredWards, setFilteredWards] = useState<WardWithConstituency[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConstituency, setSelectedConstituency] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedWards, setSelectedWards] = useState<Set<string>>(new Set());
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingWard, setEditingWard] = useState<WardWithConstituency | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('ward_number');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [stats, setStats] = useState({
    totalWards: 0,
    totalPopulation: 0,
    totalBooths: 0,
    totalVoters: 0,
  });

  const itemsPerPage = 50;

  // Mock data - Replace with actual API call
  useEffect(() => {
    loadWards();
  }, []);

  const loadWards = async () => {
    setLoading(true);
    try {
      // Fetch wards with constituency information from Supabase
      const wardsData = await wardsService.getAllWithConstituencies();

      setWards(wardsData);
      setFilteredWards(wardsData);

      // Calculate statistics
      const totalPopulation = wardsData.reduce((sum, w) => sum + (w.population || 0), 0);
      const totalBooths = wardsData.reduce((sum, w) => sum + (w.total_booths || 0), 0);
      const totalVoters = wardsData.reduce((sum, w) => sum + (w.voter_count || 0), 0);

      setStats({
        totalWards: wardsData.length,
        totalPopulation,
        totalBooths,
        totalVoters,
      });
    } catch (error) {
      console.error('Error loading wards:', error);
      alert('Failed to load wards. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Re-load when sort changes
  useEffect(() => {
    loadWards();
  }, [sortField, sortDirection]);

  useEffect(() => {
    let filtered = [...wards];

    if (searchTerm) {
      filtered = filtered.filter(
        w =>
          (w.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
          (w.code?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
          (w.constituency?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
      );
    }

    if (selectedConstituency) {
      filtered = filtered.filter(w => w.constituency_id === selectedConstituency);
    }

    // Client-side sorting
    filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredWards(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedConstituency, wards, sortField, sortDirection]);

  const constituencies = Array.from(new Set(wards.map(w => w.constituency?.name).filter(Boolean))).sort();

  const totalPages = Math.ceil(filteredWards.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedWards = filteredWards.slice(startIndex, startIndex + itemsPerPage);

  const handleSelectAll = () => {
    if (selectedWards.size === paginatedWards.length) {
      setSelectedWards(new Set());
    } else {
      setSelectedWards(new Set(paginatedWards.map(w => w.id)));
    }
  };

  const handleSelectWard = (id: string) => {
    const newSelected = new Set(selectedWards);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedWards(newSelected);
  };

  const handleEdit = (ward: Ward) => {
    setEditingWard({ ...ward });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingWard) return;

    try {
      // Update ward in Supabase
      await wardsService.update(editingWard.id, {
        name: editingWard.name,
        code: editingWard.code,
        ward_number: editingWard.ward_number,
        constituency_id: editingWard.constituency_id,
        population: editingWard.population,
        voter_count: editingWard.voter_count,
      });

      // Reload wards to get fresh data
      await loadWards();

      setShowEditModal(false);
      setEditingWard(null);
      alert('Ward updated successfully');
    } catch (error) {
      console.error('Error saving ward:', error);
      alert('Failed to save ward. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Delete ward from Supabase
      await wardsService.delete(id);

      // Reload wards to get fresh data
      await loadWards();

      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      alert('Ward deleted successfully');
    } catch (error) {
      console.error('Error deleting ward:', error);
      alert('Failed to delete ward. Please try again.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedWards.size === 0) return;

    if (!confirm(`Delete ${selectedWards.size} selected wards? This action cannot be undone.`)) return;

    try {
      // Delete each ward
      const wardIds = Array.from(selectedWards);
      await Promise.all(wardIds.map(id => wardsService.delete(id)));

      // Reload wards to get fresh data
      await loadWards();

      setSelectedWards(new Set());
      alert(`${wardIds.length} wards deleted successfully`);
    } catch (error) {
      console.error('Error bulk deleting:', error);
      alert('Failed to delete wards. Please try again.');
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Ward Code', 'Ward Name', 'Ward Number', 'Constituency', 'Population', 'Voter Count', 'Total Booths'],
      ...filteredWards.map(w => [
        w.code || '',
        w.name || '',
        w.ward_number || '',
        w.constituency?.name || '',
        w.population || 0,
        w.voter_count || 0,
        w.total_booths || 0,
      ]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wards-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ArrowUpward className="w-4 h-4 inline ml-1" />
    ) : (
      <ArrowDownward className="w-4 h-4 inline ml-1" />
    );
  };

  if (loading) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Wards Management</h1>
          <p className="text-gray-600">View and manage all wards in the system</p>
        </div>

        {/* Statistics Skeleton */}
        <SkeletonCard count={4} className="mb-6" />

        {/* Table Skeleton */}
        <SkeletonTable rows={10} columns={7} showCheckbox={true} />
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Wards Management</h1>
        <p className="text-gray-600">View and manage all wards in the system</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Wards</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalWards.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <LocationCity className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Population</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalPopulation.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <People className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Booths</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalBooths.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <LocationCity className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Voters</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalVoters.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by ward name, code, or constituency..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <select
              value={selectedConstituency}
              onChange={(e) => setSelectedConstituency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">All Constituencies</option>
              {constituencies.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(searchTerm || selectedConstituency) && (
          <div className="mt-4 flex items-center gap-2">
            <FilterList className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-600">
              Showing {filteredWards.length} of {wards.length} wards
            </span>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedConstituency('');
              }}
              className="ml-2 text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedWards.size > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-red-900">
              {selectedWards.size} ward(s) selected
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={handleBulkDelete}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                <Delete className="w-4 h-4 inline mr-1" />
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedWards(new Set())}
                className="text-sm text-gray-600 hover:text-gray-700"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <button onClick={handleSelectAll}>
                    {selectedWards.size === paginatedWards.length && paginatedWards.length > 0 ? (
                      <CheckBox className="w-5 h-5 text-red-600" />
                    ) : (
                      <CheckBoxOutlineBlank className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('ward_number')}
                >
                  Ward Number <SortIcon field="ward_number" />
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  Ward Name <SortIcon field="name" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Constituency
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('population')}
                >
                  Population <SortIcon field="population" />
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('voter_count')}
                >
                  Voter Count <SortIcon field="voter_count" />
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedWards.map(ward => (
                <tr key={ward.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <button onClick={() => handleSelectWard(ward.id)}>
                      {selectedWards.has(ward.id) ? (
                        <CheckBox className="w-5 h-5 text-red-600" />
                      ) : (
                        <CheckBoxOutlineBlank className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {ward.ward_number}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {ward.name}
                    {ward.code && (
                      <div className="text-xs text-gray-400">{ward.code}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {ward.constituency?.name || '-'}
                    {ward.constituency?.code && (
                      <div className="text-xs text-gray-400">{ward.constituency.code}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {ward.population?.toLocaleString() || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {ward.voter_count?.toLocaleString() || '-'}
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <button
                      onClick={() => handleEdit(ward)}
                      className="text-blue-600 hover:text-blue-700 mr-3"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteTarget(ward.id);
                        setShowDeleteConfirm(true);
                      }}
                      className="text-red-600 hover:text-red-700"
                      title="Delete"
                    >
                      <Delete className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredWards.length)} of{' '}
              {filteredWards.length} wards
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <GetApp className="w-5 h-5" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingWard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Ward</h2>
                <button onClick={() => setShowEditModal(false)} className="text-gray-600 hover:text-gray-900">
                  <Close className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ward Number</label>
                    <input
                      type="number"
                      value={editingWard.ward_number || ''}
                      onChange={e => setEditingWard({ ...editingWard, ward_number: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ward Code</label>
                    <input
                      type="text"
                      value={editingWard.code || ''}
                      onChange={e => setEditingWard({ ...editingWard, code: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ward Name</label>
                  <input
                    type="text"
                    value={editingWard.name || ''}
                    onChange={e => setEditingWard({ ...editingWard, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Constituency</label>
                  <input
                    type="text"
                    value={editingWard.constituency?.name || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Constituency cannot be changed here</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Population</label>
                    <input
                      type="number"
                      value={editingWard.population || 0}
                      onChange={e => setEditingWard({ ...editingWard, population: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Voter Count</label>
                    <input
                      type="number"
                      value={editingWard.voter_count || 0}
                      onChange={e => setEditingWard({ ...editingWard, voter_count: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this ward? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteTarget(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteTarget)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Ward
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
