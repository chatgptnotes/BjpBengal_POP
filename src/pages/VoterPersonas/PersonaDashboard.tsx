/**
 * Voter Persona Dashboard
 * Main dashboard for persona management and analytics
 * Version: 1.0
 * Date: 2025-11-13
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Tab,
  Tabs,
  Typography,
  Grid,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  ViewModule as GridViewIcon,
  List as ListViewIcon,
  Map as MapViewIcon,
  CompareArrows as CompareIcon,
  TrendingUp as TrendsIcon,
  Download as ExportIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import personaService from '../../services/personaService';
import type { PersonaCardData, PersonaFilters } from '../../types/persona';

// Tab views
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`persona-tabpanel-${index}`}
      aria-labelledby={`persona-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function PersonaDashboard() {
  console.log('[PersonaDashboard] Component mounting');

  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const initialTab = tabParam ? parseInt(tabParam, 10) : 0;

  const [activeTab, setActiveTab] = useState(initialTab);
  const [personas, setPersonas] = useState<PersonaCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<PersonaFilters>({});

  console.log('[PersonaDashboard] State initialized:', { activeTab, initialTab, loading });

  // Update tab from URL parameter
  useEffect(() => {
    if (tabParam) {
      const tabIndex = parseInt(tabParam, 10);
      if (!isNaN(tabIndex) && tabIndex >= 0 && tabIndex <= 3) {
        setActiveTab(tabIndex);
      }
    }
  }, [tabParam]);

  // Load personas
  useEffect(() => {
    loadPersonas();
  }, [filters]);

  const loadPersonas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await personaService.getPersonas(filters);
      setPersonas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load personas');
      console.error('Error loading personas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSearch = () => {
    setFilters({ ...filters, search: searchQuery });
  };

  const handleRefresh = () => {
    loadPersonas();
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 4,
          px: 3,
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Voter Personas
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                AI-powered psychographic segmentation and behavioral analysis
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: { md: 'flex-end' } }}>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<AddIcon />}
                  onClick={() => {/* TODO: Open create persona dialog */}}
                >
                  Create Persona
                </Button>
                <Button
                  variant="outlined"
                  sx={{ color: 'white', borderColor: 'white' }}
                  startIcon={<ExportIcon />}
                >
                  Export
                </Button>
                <IconButton
                  sx={{ color: 'white' }}
                  onClick={handleRefresh}
                  title="Refresh"
                >
                  <RefreshIcon />
                </IconButton>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Search and Filter Bar */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          py: 2,
          px: 3,
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search personas by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => {
                        setSearchQuery('');
                        setFilters({ ...filters, search: '' });
                      }}>
                        ✕
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: { md: 'flex-end' } }}>
                <Typography variant="body2" sx={{ alignSelf: 'center', color: 'text.secondary' }}>
                  {personas.length} persona{personas.length !== 1 ? 's' : ''}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Container maxWidth="xl">
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="persona tabs">
            <Tab icon={<GridViewIcon />} iconPosition="start" label="Persona Library" />
            <Tab icon={<CompareIcon />} iconPosition="start" label="Comparison" />
            <Tab icon={<MapViewIcon />} iconPosition="start" label="Geographic Map" />
            <Tab icon={<TrendsIcon />} iconPosition="start" label="Trends & Migration" />
          </Tabs>
        </Container>
      </Box>

      {/* Content */}
      <Container maxWidth="xl">
        {error && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Tab 1: Persona Library */}
            <TabPanel value={activeTab} index={0}>
              {personas.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No personas found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Create your first persona to start segmenting voters
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{ mt: 2 }}
                    onClick={() => {/* TODO: Open create dialog */}}
                  >
                    Create Persona
                  </Button>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {personas.map((persona) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={persona.id}>
                      <Box
                        sx={{
                          p: 3,
                          bgcolor: 'background.paper',
                          borderRadius: 2,
                          border: 1,
                          borderColor: 'divider',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            boxShadow: 3,
                            transform: 'translateY(-4px)',
                          },
                        }}
                      >
                        {/* Persona Icon */}
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            bgcolor: persona.color + '20',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2,
                          }}
                        >
                          <Typography variant="h4" sx={{ color: persona.color }}>
                            {persona.name.charAt(0)}
                          </Typography>
                        </Box>

                        {/* Persona Name */}
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          {persona.name}
                        </Typography>

                        {/* Persona Description */}
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mb: 2,
                            minHeight: 40,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {persona.description}
                        </Typography>

                        {/* Voter Count */}
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            p: 1.5,
                            bgcolor: 'action.hover',
                            borderRadius: 1,
                          }}
                        >
                          <Typography variant="h5" fontWeight="bold" sx={{ color: persona.color }}>
                            {persona.total_voters.toLocaleString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            voters
                          </Typography>
                        </Box>

                        {/* Quick Stats */}
                        {persona.metrics && persona.metrics.length > 0 && (
                          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                            <Box sx={{ flex: 1, textAlign: 'center' }}>
                              <Typography variant="caption" color="text.secondary">
                                Engagement
                              </Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {(persona.metrics[0].engagement_rate * 100).toFixed(0)}%
                              </Typography>
                            </Box>
                            <Box sx={{ flex: 1, textAlign: 'center' }}>
                              <Typography variant="caption" color="text.secondary">
                                Persuasion
                              </Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {persona.metrics[0].avg_persuasion_score?.toFixed(0) || 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </TabPanel>

            {/* Tab 2: Comparison */}
            <TabPanel value={activeTab} index={1}>
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <CompareIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Persona Comparison Tool
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Select two personas to compare their characteristics
                </Typography>
              </Box>
            </TabPanel>

            {/* Tab 3: Geographic Map */}
            <TabPanel value={activeTab} index={2}>
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <MapViewIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Geographic Distribution
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Interactive map showing persona distribution across regions
                </Typography>
              </Box>
            </TabPanel>

            {/* Tab 4: Trends & Migration */}
            <TabPanel value={activeTab} index={3}>
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <TrendsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Trends & Migration Analysis
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Track persona changes and migration patterns over time
                </Typography>
              </Box>
            </TabPanel>
          </>
        )}
      </Container>
    </Box>
  );
}
