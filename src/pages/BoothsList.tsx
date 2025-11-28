import React, { useState, useEffect } from 'react';
import {
  Edit,
  Delete,
  Search,
  FilterList,
  GetApp,
  CheckBox,
  CheckBoxOutlineBlank,
  Close,
  Save,
  LocationOn,
  People,
  Accessible,
  ArrowUpward,
  ArrowDownward,
  Star
} from '@mui/icons-material';
import { pollingBoothsService } from '../services/supabase/polling-booths.service';
import type { PollingBooth } from '../types/database';
import { useAuth } from '../contexts/AuthContext';
import { SkeletonTable, SkeletonCard } from '../components/skeletons';

interface Booth extends PollingBooth {
  constituency_name?: string;
  ward_name?: string;
}

type SortField = 'booth_number' | 'name' | 'total_voters' | 'priority_level';
type SortDirection = 'asc' | 'desc';

export default function BoothsList() {
  const { user } = useAuth();
  const [booths, setBooths] = useState<Booth[]>([]);
  const [filteredBooths, setFilteredBooths] = useState<Booth[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConstituency, setSelectedConstituency] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedAccessibility, setSelectedAccessibility] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBooths, setSelectedBooths] = useState<Set<string>>(new Set());
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showBulkPriorityModal, setShowBulkPriorityModal] = useState(false);
  const [bulkPriority, setBulkPriority] = useState(3);
  const [editingBooth, setEditingBooth] = useState<Booth | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [detailsBooth, setDetailsBooth] = useState<Booth | null>(null);
  const [sortField, setSortField] = useState<SortField>('booth_number');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const itemsPerPage = 50;

  useEffect(() => {
    loadBooths();
  }, []);

  const loadBooths = async () => {
    setLoading(true);
    try {
      // Fetch booths from Supabase
      const { data: boothsData } = await pollingBoothsService.getAll({
        sort: { column: sortField, direction: sortDirection }
      });

      setBooths(boothsData);
      setFilteredBooths(boothsData);
    } catch (error) {
      console.error('Error loading booths:', error);
      // Show user-friendly error message
      alert('Failed to load polling booths. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...booths];

    if (searchTerm) {
      filtered = filtered.filter(
        b =>
          b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.booth_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedConstituency) {
      filtered = filtered.filter(b => b.constituency_id === selectedConstituency);
    }

    if (selectedWard) {
      filtered = filtered.filter(b => b.ward_id === selectedWard);
    }

    if (selectedAccessibility) {
      if (selectedAccessibility === 'accessible') {
        filtered = filtered.filter(b => b.is_accessible === true);
      } else if (selectedAccessibility === 'not_accessible') {
        filtered = filtered.filter(b => b.is_accessible === false);
      }
    }

    setFilteredBooths(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedConstituency, selectedWard, selectedAccessibility, booths]);

  const constituencies = Array.from(new Set(booths.map(b => b.constituency_id).filter(Boolean))).sort();
  const wards = Array.from(new Set(booths.map(b => b.ward_id).filter(Boolean))).sort();

  const totalPages = Math.ceil(filteredBooths.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBooths = filteredBooths.slice(startIndex, startIndex + itemsPerPage);

  const handleSelectAll = () => {
    if (selectedBooths.size === paginatedBooths.length) {
      setSelectedBooths(new Set());
    } else {
      setSelectedBooths(new Set(paginatedBooths.map(b => b.id)));
    }
  };

  const handleSelectBooth = (id: string) => {
    const newSelected = new Set(selectedBooths);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedBooths(newSelected);
  };

  const handleEdit = (booth: Booth) => {
    setEditingBooth({ ...booth });
    setShowEditModal(true);
  };

  const handleViewDetails = (booth: Booth) => {
    setDetailsBooth(booth);
    setShowDetailsModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingBooth) return;

    try {
      await pollingBoothsService.update(editingBooth.id, {
        booth_number: editingBooth.booth_number,
        name: editingBooth.name,
        address: editingBooth.address,
        latitude: editingBooth.latitude,
        longitude: editingBooth.longitude,
        total_voters: editingBooth.total_voters,
        male_voters: editingBooth.male_voters,
        female_voters: editingBooth.female_voters,
        transgender_voters: editingBooth.transgender_voters,
        is_accessible: editingBooth.is_accessible,
      });

      setBooths(prev => prev.map(b => (b.id === editingBooth.id ? editingBooth : b)));
      setShowEditModal(false);
      setEditingBooth(null);
      alert('Booth updated successfully');
    } catch (error) {
      console.error('Error saving booth:', error);
      alert('Failed to save booth');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await pollingBoothsService.delete(id);
      setBooths(prev => prev.filter(b => b.id !== id));
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      alert('Booth deleted successfully');
    } catch (error) {
      console.error('Error deleting booth:', error);
      alert('Failed to delete booth');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedBooths.size === 0) return;

    if (!confirm(`Delete ${selectedBooths.size} selected booths?`)) return;

    try {
      const boothIds = Array.from(selectedBooths);
      await Promise.all(boothIds.map(id => pollingBoothsService.delete(id)));
      setBooths(prev => prev.filter(b => !selectedBooths.has(b.id)));
      setSelectedBooths(new Set());
      alert('Booths deleted successfully');
    } catch (error) {
      console.error('Error bulk deleting:', error);
      alert('Failed to delete booths');
    }
  };

  const handleBulkSetPriority = async () => {
    if (selectedBooths.size === 0) return;

    try {
      const boothIds = Array.from(selectedBooths);
      await pollingBoothsService.bulkSetPriority(boothIds, bulkPriority);

      // Update local state
      setBooths(prev => prev.map(b => selectedBooths.has(b.id) ? { ...b, priority_level: bulkPriority } : b));
      setSelectedBooths(new Set());
      setShowBulkPriorityModal(false);
      alert(`Priority updated for ${boothIds.length} booths`);
    } catch (error) {
      console.error('Error bulk setting priority:', error);
      alert('Failed to update booth priorities');
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Re-load when sort changes
  useEffect(() => {
    loadBooths();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortField, sortDirection]);

  const handleExport = () => {
    const csvContent = [
      [
        'Booth Number',
        'Booth Name',
        'Ward ID',
        'Constituency ID',
        'Address',
        'Latitude',
        'Longitude',
        'Total Voters',
        'Male Voters',
        'Female Voters',
        'Transgender Voters',
        'Accessible',
        'Priority Level',
      ],
      ...filteredBooths.map(b => [
        b.booth_number,
        b.name,
        b.ward_id || '',
        b.constituency_id,
        b.address || '',
        b.latitude || '',
        b.longitude || '',
        b.total_voters,
        b.male_voters,
        b.female_voters,
        b.transgender_voters,
        b.is_accessible ? 'Yes' : 'No',
        b.priority_level,
      ]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `polling-booths-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
        </div>

        <SkeletonCard count={4} className="mb-6" />

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
            {[1, 2, 3].map(i => (
              <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>

        <SkeletonTable rows={10} columns={8} showCheckbox />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Polling Booths Management</h1>
        <p className="text-gray-600">View and manage all polling booths with GPS coordinates</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Booths</p>
              <p className="text-2xl font-bold text-gray-900">{filteredBooths.length}</p>
            </div>
            <LocationOn className="w-10 h-10 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Voters</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredBooths.reduce((sum, b) => sum + b.total_voters, 0).toLocaleString()}
              </p>
            </div>
            <People className="w-10 h-10 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">With GPS</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredBooths.filter(b => b.latitude && b.longitude).length}
              </p>
            </div>
            <LocationOn className="w-10 h-10 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Accessible</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredBooths.filter(b => b.is_accessible === true).length}
              </p>
            </div>
            <Accessible className="w-10 h-10 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, code, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <select
              value={selectedConstituency}
              onChange={(e) => setSelectedConstituency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="">All Constituencies</option>
              {constituencies.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="">All Wards</option>
              {wards.map(w => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedAccessibility}
              onChange={(e) => setSelectedAccessibility(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="">All Accessibility</option>
              <option value="accessible">Accessible</option>
              <option value="not_accessible">Not Accessible</option>
            </select>
          </div>
        </div>

        {(searchTerm || selectedConstituency || selectedWard || selectedAccessibility) && (
          <div className="mt-4 flex items-center gap-2">
            <FilterList className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-600">
              Showing {filteredBooths.length} of {booths.length} booths
            </span>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedConstituency('');
                setSelectedWard('');
                setSelectedAccessibility('');
              }}
              className="ml-2 text-sm text-yellow-600 hover:text-yellow-700 font-medium"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedBooths.size > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-yellow-900">
              {selectedBooths.size} booth(s) selected
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowBulkPriorityModal(true)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <Star className="w-4 h-4 inline mr-1" />
                Set Priority
              </button>
              <button
                onClick={handleBulkDelete}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                <Delete className="w-4 h-4 inline mr-1" />
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedBooths(new Set())}
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
                    {selectedBooths.size === paginatedBooths.length && paginatedBooths.length > 0 ? (
                      <CheckBox className="w-5 h-5 text-yellow-600" />
                    ) : (
                      <CheckBoxOutlineBlank className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <button
                    onClick={() => handleSort('booth_number')}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    Booth Number
                    {sortField === 'booth_number' && (
                      sortDirection === 'asc' ? <ArrowUpward className="w-4 h-4" /> : <ArrowDownward className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    Booth Name
                    {sortField === 'name' && (
                      sortDirection === 'asc' ? <ArrowUpward className="w-4 h-4" /> : <ArrowDownward className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ward
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Constituency
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <button
                    onClick={() => handleSort('total_voters')}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    Voters
                    {sortField === 'total_voters' && (
                      sortDirection === 'asc' ? <ArrowUpward className="w-4 h-4" /> : <ArrowDownward className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <button
                    onClick={() => handleSort('priority_level')}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    Priority
                    {sortField === 'priority_level' && (
                      sortDirection === 'asc' ? <ArrowUpward className="w-4 h-4" /> : <ArrowDownward className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  GPS
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Accessible
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedBooths.map(booth => (
                <tr key={booth.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <button onClick={() => handleSelectBooth(booth.id)}>
                      {selectedBooths.has(booth.id) ? (
                        <CheckBox className="w-5 h-5 text-yellow-600" />
                      ) : (
                        <CheckBoxOutlineBlank className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {booth.booth_number}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleViewDetails(booth)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {booth.name}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{booth.ward_id || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {booth.constituency_id}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {booth.total_voters.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center text-xs px-2 py-1 rounded-full font-medium ${
                        booth.priority_level >= 4
                          ? 'text-red-700 bg-red-100'
                          : booth.priority_level === 3
                          ? 'text-yellow-700 bg-yellow-100'
                          : 'text-blue-700 bg-blue-100'
                      }`}
                    >
                      {booth.priority_level}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {booth.latitude && booth.longitude ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full">
                        <LocationOn className="w-3 h-3" />
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center text-xs px-2 py-1 rounded-full ${
                        booth.is_accessible
                          ? 'text-green-700 bg-green-100'
                          : 'text-red-700 bg-red-100'
                      }`}
                    >
                      {booth.is_accessible ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <button
                      onClick={() => handleEdit(booth)}
                      className="text-blue-600 hover:text-blue-700 mr-3"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteTarget(booth.id);
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
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredBooths.length)} of{' '}
              {filteredBooths.length} booths
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50"
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

      {/* Details Modal */}
      {showDetailsModal && detailsBooth && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Booth Details</h2>
                <button onClick={() => setShowDetailsModal(false)} className="text-gray-600 hover:text-gray-900">
                  <Close className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Booth Number</p>
                    <p className="font-semibold text-gray-900">{detailsBooth.booth_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Booth Name</p>
                    <p className="font-semibold text-gray-900">{detailsBooth.name}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Address</p>
                  <p className="font-semibold text-gray-900">{detailsBooth.address || 'N/A'}</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Ward ID</p>
                    <p className="font-semibold text-gray-900">{detailsBooth.ward_id || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Constituency ID</p>
                    <p className="font-semibold text-gray-900">{detailsBooth.constituency_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Priority Level</p>
                    <p className="font-semibold text-gray-900">{detailsBooth.priority_level}</p>
                  </div>
                </div>

                {detailsBooth.latitude && detailsBooth.longitude && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <LocationOn className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-green-900 mb-2">GPS Coordinates</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-green-700">Latitude</p>
                            <p className="font-mono text-green-900">{detailsBooth.latitude.toFixed(6)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-green-700">Longitude</p>
                            <p className="font-mono text-green-900">{detailsBooth.longitude.toFixed(6)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <People className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-blue-900 mb-3">Voter Statistics</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-blue-700">Total Voters</p>
                          <p className="text-2xl font-bold text-blue-900">
                            {detailsBooth.total_voters.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-700">Male Voters</p>
                          <p className="text-xl font-semibold text-blue-900">
                            {detailsBooth.male_voters.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-700">Female Voters</p>
                          <p className="text-xl font-semibold text-blue-900">
                            {detailsBooth.female_voters.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-700">Transgender Voters</p>
                          <p className="text-xl font-semibold text-blue-900">
                            {detailsBooth.transgender_voters}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Accessibility</p>
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg font-semibold ${
                      detailsBooth.is_accessible
                        ? 'text-green-700 bg-green-100'
                        : 'text-red-700 bg-red-100'
                    }`}
                  >
                    <Accessible className="w-5 h-5" />
                    {detailsBooth.is_accessible ? 'Accessible' : 'Not Accessible'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal - Similar to WardsList but with more fields */}
      {showEditModal && editingBooth && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Polling Booth</h2>
                <button onClick={() => setShowEditModal(false)} className="text-gray-600 hover:text-gray-900">
                  <Close className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Booth Number</label>
                    <input
                      type="text"
                      value={editingBooth.booth_number}
                      onChange={e => setEditingBooth({ ...editingBooth, booth_number: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Booth Name</label>
                    <input
                      type="text"
                      value={editingBooth.name}
                      onChange={e => setEditingBooth({ ...editingBooth, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={editingBooth.address || ''}
                    onChange={e => setEditingBooth({ ...editingBooth, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority Level (1-5)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={editingBooth.priority_level}
                      onChange={e => setEditingBooth({ ...editingBooth, priority_level: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Accessible</label>
                    <select
                      value={editingBooth.is_accessible ? 'true' : 'false'}
                      onChange={e => setEditingBooth({ ...editingBooth, is_accessible: e.target.value === 'true' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={editingBooth.latitude || ''}
                      onChange={e => setEditingBooth({ ...editingBooth, latitude: parseFloat(e.target.value) || null })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={editingBooth.longitude || ''}
                      onChange={e => setEditingBooth({ ...editingBooth, longitude: parseFloat(e.target.value) || null })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Voters</label>
                    <input
                      type="number"
                      value={editingBooth.total_voters}
                      onChange={e => setEditingBooth({ ...editingBooth, total_voters: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Male Voters</label>
                    <input
                      type="number"
                      value={editingBooth.male_voters}
                      onChange={e => setEditingBooth({ ...editingBooth, male_voters: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Female Voters</label>
                    <input
                      type="number"
                      value={editingBooth.female_voters}
                      onChange={e => setEditingBooth({ ...editingBooth, female_voters: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transgender</label>
                    <input
                      type="number"
                      value={editingBooth.transgender_voters}
                      onChange={e => setEditingBooth({ ...editingBooth, transgender_voters: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
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
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-2"
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
              Are you sure you want to delete this polling booth? This action cannot be undone.
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
                Delete Booth
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Priority Modal */}
      {showBulkPriorityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Set Priority Level</h3>
              <button onClick={() => setShowBulkPriorityModal(false)} className="text-gray-600 hover:text-gray-900">
                <Close className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Set priority level for {selectedBooths.size} selected booth(s).
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority Level (1-5)</label>
              <select
                value={bulkPriority}
                onChange={(e) => setBulkPriority(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value={1}>1 - Low Priority</option>
                <option value={2}>2 - Below Average</option>
                <option value={3}>3 - Average</option>
                <option value={4}>4 - High Priority</option>
                <option value={5}>5 - Critical</option>
              </select>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowBulkPriorityModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkSetPriority}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Star className="w-5 h-5" />
                Set Priority
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
