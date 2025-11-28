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
  TrendingUp,
  HowToVote,
} from '@mui/icons-material';
import { constituenciesService } from '../services/supabase/constituencies.service';
import type { Constituency, ConstituencyType } from '../types/database';
import { SkeletonTable, SkeletonCard } from '../components/skeletons';

type SortField = 'name' | 'code' | 'voter_count' | 'population' | 'total_booths';
type SortDirection = 'asc' | 'desc';

export default function ConstituenciesList() {
  const [constituencies, setConstituencies] = useState<Constituency[]>([]);
  const [filteredConstituencies, setFilteredConstituencies] = useState<Constituency[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<ConstituencyType | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedConstituencies, setSelectedConstituencies] = useState<Set<string>>(new Set());
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingConstituency, setEditingConstituency] = useState<Constituency | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [stats, setStats] = useState({
    totalConstituencies: 0,
    totalPopulation: 0,
    totalBooths: 0,
    totalVoters: 0,
  });

  const itemsPerPage = 50;

  useEffect(() => {
    loadConstituencies();
  }, []);

  const loadConstituencies = async () => {
    setLoading(true);
    try {
      const { data: constituenciesData } = await constituenciesService.getAll({
        sort: { column: sortField, direction: sortDirection },
      });

      setConstituencies(constituenciesData);
      setFilteredConstituencies(constituenciesData);

      // Calculate statistics
      const totalPopulation = constituenciesData.reduce((sum, c) => sum + (c.population || 0), 0);
      const totalBooths = constituenciesData.reduce((sum, c) => sum + (c.total_booths || 0), 0);
      const totalVoters = constituenciesData.reduce((sum, c) => sum + (c.voter_count || 0), 0);

      setStats({
        totalConstituencies: constituenciesData.length,
        totalPopulation,
        totalBooths,
        totalVoters,
      });
    } catch (error) {
      console.error('Error loading constituencies:', error);
      alert('Failed to load constituencies. Please try again.');
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
    loadConstituencies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortField, sortDirection]);

  useEffect(() => {
    let filtered = [...constituencies];

    if (searchTerm) {
      filtered = filtered.filter(
        c =>
          (c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
          (c.code?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
          (c.state?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
          (c.district?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
      );
    }

    if (selectedType) {
      filtered = filtered.filter(c => c.type === selectedType);
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

    setFilteredConstituencies(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedType, constituencies, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredConstituencies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedConstituencies = filteredConstituencies.slice(startIndex, startIndex + itemsPerPage);

  const handleSelectAll = () => {
    if (selectedConstituencies.size === paginatedConstituencies.length) {
      setSelectedConstituencies(new Set());
    } else {
      setSelectedConstituencies(new Set(paginatedConstituencies.map(c => c.id)));
    }
  };

  const handleSelectConstituency = (id: string) => {
    const newSelected = new Set(selectedConstituencies);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedConstituencies(newSelected);
  };

  const handleEdit = (constituency: Constituency) => {
    setEditingConstituency({ ...constituency });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingConstituency) return;

    try {
      // Update constituency in Supabase
      await constituenciesService.update(editingConstituency.id, {
        name: editingConstituency.name,
        code: editingConstituency.code,
        type: editingConstituency.type,
        state: editingConstituency.state,
        district: editingConstituency.district,
        population: editingConstituency.population,
        voter_count: editingConstituency.voter_count,
        reserved_category: editingConstituency.reserved_category,
        current_representative: editingConstituency.current_representative,
        current_party: editingConstituency.current_party,
      });

      // Reload constituencies to get fresh data
      await loadConstituencies();

      setShowEditModal(false);
      setEditingConstituency(null);
      alert('Constituency updated successfully');
    } catch (error) {
      console.error('Error saving constituency:', error);
      alert('Failed to save constituency. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Delete constituency from Supabase
      await constituenciesService.delete(id);

      // Reload constituencies to get fresh data
      await loadConstituencies();

      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      alert('Constituency deleted successfully');
    } catch (error) {
      console.error('Error deleting constituency:', error);
      alert('Failed to delete constituency. Please try again.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedConstituencies.size === 0) return;

    if (!confirm(`Delete ${selectedConstituencies.size} selected constituencies? This action cannot be undone.`)) return;

    try {
      // Delete each constituency
      const constituencyIds = Array.from(selectedConstituencies);
      await Promise.all(constituencyIds.map(id => constituenciesService.delete(id)));

      // Reload constituencies to get fresh data
      await loadConstituencies();

      setSelectedConstituencies(new Set());
      alert(`${constituencyIds.length} constituencies deleted successfully`);
    } catch (error) {
      console.error('Error bulk deleting:', error);
      alert('Failed to delete constituencies. Please try again.');
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Code', 'Name', 'Type', 'State', 'District', 'Population', 'Voter Count', 'Total Booths', 'Current Representative', 'Current Party'],
      ...filteredConstituencies.map(c => [
        c.code || '',
        c.name || '',
        c.type || '',
        c.state || '',
        c.district || '',
        c.population || 0,
        c.voter_count || 0,
        c.total_booths || 0,
        c.current_representative || '',
        c.current_party || '',
      ]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `constituencies-${new Date().toISOString().split('T')[0]}.csv`;
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Constituencies Management</h1>
          <p className="text-gray-600">View and manage all constituencies in the system</p>
        </div>

        {/* Statistics Skeleton */}
        <SkeletonCard count={4} className="mb-6" />

        {/* Table Skeleton */}
        <SkeletonTable rows={10} columns={9} showCheckbox={true} />
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Constituencies Management</h1>
        <p className="text-gray-600">View and manage all constituencies in the system</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Constituencies</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalConstituencies.toLocaleString()}</p>
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
              <HowToVote className="w-6 h-6 text-green-600" />
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
                placeholder="Search by name, code, state, or district..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as ConstituencyType | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="assembly">Assembly</option>
              <option value="parliamentary">Parliamentary</option>
              <option value="local">Local</option>
            </select>
          </div>
        </div>

        {(searchTerm || selectedType) && (
          <div className="mt-4 flex items-center gap-2">
            <FilterList className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-600">
              Showing {filteredConstituencies.length} of {constituencies.length} constituencies
            </span>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedType('');
              }}
              className="ml-2 text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedConstituencies.size > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-red-900">
              {selectedConstituencies.size} constituency(ies) selected
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
                onClick={() => setSelectedConstituencies(new Set())}
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
                    {selectedConstituencies.size === paginatedConstituencies.length && paginatedConstituencies.length > 0 ? (
                      <CheckBox className="w-5 h-5 text-red-600" />
                    ) : (
                      <CheckBoxOutlineBlank className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('code')}
                >
                  Code <SortIcon field="code" />
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  Name <SortIcon field="name" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  State / District
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
                  Voters <SortIcon field="voter_count" />
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('total_booths')}
                >
                  Booths <SortIcon field="total_booths" />
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedConstituencies.map(constituency => (
                <tr key={constituency.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <button onClick={() => handleSelectConstituency(constituency.id)}>
                      {selectedConstituencies.has(constituency.id) ? (
                        <CheckBox className="w-5 h-5 text-red-600" />
                      ) : (
                        <CheckBoxOutlineBlank className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {constituency.code}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {constituency.name}
                    {constituency.current_representative && (
                      <div className="text-xs text-gray-500">
                        {constituency.current_representative} ({constituency.current_party || 'Independent'})
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      constituency.type === 'parliamentary' ? 'bg-purple-100 text-purple-800' :
                      constituency.type === 'assembly' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {constituency.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {constituency.state || '-'}
                    {constituency.district && (
                      <div className="text-xs text-gray-400">{constituency.district}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {constituency.population?.toLocaleString() || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {constituency.voter_count?.toLocaleString() || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {constituency.total_booths?.toLocaleString() || '-'}
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <button
                      onClick={() => handleEdit(constituency)}
                      className="text-blue-600 hover:text-blue-700 mr-3"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteTarget(constituency.id);
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
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredConstituencies.length)} of{' '}
              {filteredConstituencies.length} constituencies
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
      {showEditModal && editingConstituency && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Constituency</h2>
                <button onClick={() => setShowEditModal(false)} className="text-gray-600 hover:text-gray-900">
                  <Close className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                    <input
                      type="text"
                      value={editingConstituency.code || ''}
                      onChange={e => setEditingConstituency({ ...editingConstituency, code: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={editingConstituency.name || ''}
                      onChange={e => setEditingConstituency({ ...editingConstituency, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={editingConstituency.type}
                      onChange={e => setEditingConstituency({ ...editingConstituency, type: e.target.value as ConstituencyType })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    >
                      <option value="assembly">Assembly</option>
                      <option value="parliamentary">Parliamentary</option>
                      <option value="local">Local</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      value={editingConstituency.state || ''}
                      onChange={e => setEditingConstituency({ ...editingConstituency, state: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                    <input
                      type="text"
                      value={editingConstituency.district || ''}
                      onChange={e => setEditingConstituency({ ...editingConstituency, district: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Population</label>
                    <input
                      type="number"
                      value={editingConstituency.population || 0}
                      onChange={e => setEditingConstituency({ ...editingConstituency, population: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Voter Count</label>
                    <input
                      type="number"
                      value={editingConstituency.voter_count || 0}
                      onChange={e => setEditingConstituency({ ...editingConstituency, voter_count: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Representative</label>
                    <input
                      type="text"
                      value={editingConstituency.current_representative || ''}
                      onChange={e => setEditingConstituency({ ...editingConstituency, current_representative: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Party</label>
                    <input
                      type="text"
                      value={editingConstituency.current_party || ''}
                      onChange={e => setEditingConstituency({ ...editingConstituency, current_party: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reserved Category</label>
                  <input
                    type="text"
                    value={editingConstituency.reserved_category || ''}
                    onChange={e => setEditingConstituency({ ...editingConstituency, reserved_category: e.target.value })}
                    placeholder="e.g., SC, ST, General"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
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
              Are you sure you want to delete this constituency? This action cannot be undone.
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
                Delete Constituency
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
