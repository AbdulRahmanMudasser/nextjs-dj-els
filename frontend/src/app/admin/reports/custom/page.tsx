'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Download, Edit, Trash2, Play, Pause, Calendar, Filter, Save, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useApi } from '@/hooks/useApi';
import { useApiMutation } from '@/hooks/useApi';

interface CustomReport {
  id: number;
  name: string;
  description: string;
  query: string;
  parameters: ReportParameter[];
  schedule: string;
  isActive: boolean;
  lastRun: string;
  nextRun: string;
  createdBy: string;
  createdAt: string;
  format: 'pdf' | 'excel' | 'csv';
}

interface ReportParameter {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'select';
  required: boolean;
  defaultValue?: any;
  options?: string[];
}

interface ReportBuilder {
  selectedTables: string[];
  selectedFields: string[];
  filters: FilterCondition[];
  grouping: string[];
  sorting: SortCondition[];
}

interface FilterCondition {
  field: string;
  operator: string;
  value: any;
}

interface SortCondition {
  field: string;
  direction: 'asc' | 'desc';
}

export default function CustomReportsPage() {
  const [reports, setReports] = useState<CustomReport[]>([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingReport, setEditingReport] = useState<CustomReport | null>(null);
  const [reportBuilder, setReportBuilder] = useState<ReportBuilder>({
    selectedTables: [],
    selectedFields: [],
    filters: [],
    grouping: [],
    sorting: []
  });

  const { data: customReports, loading } = useApi<CustomReport[]>('/admin/reports/custom/');
  const { mutate: createReport, loading: createLoading } = useApiMutation<CustomReport, Partial<CustomReport>>();
  const { mutate: updateReport, loading: updateLoading } = useApiMutation<CustomReport, Partial<CustomReport>>();
  const { mutate: deleteReport, loading: deleteLoading } = useApiMutation<void>();

  const availableTables = [
    { name: 'users', label: 'Users', fields: ['id', 'username', 'email', 'first_name', 'last_name', 'created_at', 'is_active'] },
    { name: 'departments', label: 'Departments', fields: ['id', 'name', 'code', 'description', 'head_of_department', 'created_at'] },
    { name: 'courses', label: 'Courses', fields: ['id', 'name', 'code', 'description', 'credits', 'department', 'created_at'] },
    { name: 'enrollments', label: 'Enrollments', fields: ['id', 'student', 'course', 'enrollment_date', 'status', 'grade'] },
    { name: 'programs', label: 'Programs', fields: ['id', 'name', 'code', 'description', 'department', 'duration', 'created_at'] }
  ];

  useEffect(() => {
    if (customReports) {
      setReports(customReports);
    }
  }, [customReports]);

  const handleCreateReport = async () => {
    try {
      const newReport = await createReport('/admin/reports/custom/', 'POST', {
        name: 'New Custom Report',
        description: 'Custom report created via builder',
        query: generateQuery(),
        parameters: [],
        schedule: 'manual',
        isActive: true,
        format: 'pdf'
      });
      
      setReports([...reports, newReport]);
      setShowBuilder(false);
    } catch (error) {
      console.error('Error creating report:', error);
    }
  };

  const handleUpdateReport = async (report: CustomReport) => {
    try {
      const updatedReport = await updateReport(`/admin/reports/custom/${report.id}/`, 'PUT', {
        ...report,
        query: generateQuery()
      });
      
      setReports(reports.map(r => r.id === report.id ? updatedReport : r));
      setEditingReport(null);
    } catch (error) {
      console.error('Error updating report:', error);
    }
  };

  const handleDeleteReport = async (reportId: number) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    
    try {
      await deleteReport(`/admin/reports/custom/${reportId}/`, 'DELETE');
      setReports(reports.filter(r => r.id !== reportId));
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  };

  const generateQuery = () => {
    // Simple query generation based on builder state
    let query = 'SELECT ';
    query += reportBuilder.selectedFields.length > 0 
      ? reportBuilder.selectedFields.join(', ') 
      : '*';
    query += ' FROM ';
    query += reportBuilder.selectedTables.join(', ');
    
    if (reportBuilder.filters.length > 0) {
      query += ' WHERE ';
      query += reportBuilder.filters.map(f => `${f.field} ${f.operator} '${f.value}'`).join(' AND ');
    }
    
    if (reportBuilder.grouping.length > 0) {
      query += ' GROUP BY ';
      query += reportBuilder.grouping.join(', ');
    }
    
    if (reportBuilder.sorting.length > 0) {
      query += ' ORDER BY ';
      query += reportBuilder.sorting.map(s => `${s.field} ${s.direction}`).join(', ');
    }
    
    return query;
  };

  const addFilter = () => {
    setReportBuilder(prev => ({
      ...prev,
      filters: [...prev.filters, { field: '', operator: '=', value: '' }]
    }));
  };

  const removeFilter = (index: number) => {
    setReportBuilder(prev => ({
      ...prev,
      filters: prev.filters.filter((_, i) => i !== index)
    }));
  };

  const updateFilter = (index: number, field: string, value: any) => {
    setReportBuilder(prev => ({
      ...prev,
      filters: prev.filters.map((f, i) => 
        i === index ? { ...f, [field]: value } : f
      )
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6 w-full">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Custom Reports</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage custom report configurations
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowBuilder(!showBuilder)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {showBuilder ? 'Hide Builder' : 'Report Builder'}
          </Button>
          <Button
            onClick={handleCreateReport}
            disabled={createLoading}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Report
          </Button>
        </div>
      </div>

      {/* Report Builder */}
      {showBuilder && (
        <Card>
          <CardHeader>
            <CardTitle>Report Builder</CardTitle>
            <CardDescription>Build custom reports using a visual query builder</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Data Sources */}
            <div>
              <Label className="text-base font-medium">Data Sources</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                {availableTables.map((table) => (
                  <div key={table.name} className="flex items-center space-x-2">
                    <Checkbox
                      id={table.name}
                      checked={reportBuilder.selectedTables.includes(table.name)}
                      onCheckedChange={(checked) => {
                        setReportBuilder(prev => ({
                          ...prev,
                          selectedTables: checked 
                            ? [...prev.selectedTables, table.name]
                            : prev.selectedTables.filter(t => t !== table.name)
                        }));
                      }}
                    />
                    <Label htmlFor={table.name} className="text-sm">
                      {table.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Fields Selection */}
            <div>
              <Label className="text-base font-medium">Fields to Include</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {availableTables
                  .filter(table => reportBuilder.selectedTables.includes(table.name))
                  .flatMap(table => table.fields.map(field => ({ table: table.name, field })))
                  .map(({ table, field }) => (
                    <div key={`${table}.${field}`} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${table}.${field}`}
                        checked={reportBuilder.selectedFields.includes(`${table}.${field}`)}
                        onCheckedChange={(checked) => {
                          setReportBuilder(prev => ({
                            ...prev,
                            selectedFields: checked 
                              ? [...prev.selectedFields, `${table}.${field}`]
                              : prev.selectedFields.filter(f => f !== `${table}.${field}`)
                          }));
                        }}
                      />
                      <Label htmlFor={`${table}.${field}`} className="text-sm">
                        {table}.{field}
                      </Label>
                    </div>
                  ))}
              </div>
            </div>

            {/* Filters */}
            <div>
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Filters</Label>
                <Button variant="outline" size="sm" onClick={addFilter}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Filter
                </Button>
              </div>
              <div className="space-y-2 mt-2">
                {reportBuilder.filters.map((filter, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Select
                      value={filter.field}
                      onValueChange={(value) => updateFilter(index, 'field', value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Field" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTables
                          .filter(table => reportBuilder.selectedTables.includes(table.name))
                          .flatMap(table => table.fields.map(field => ({ value: `${table.name}.${field}`, label: `${table.name}.${field}` })))
                          .map(({ value, label }) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    
                    <Select
                      value={filter.operator}
                      onValueChange={(value) => updateFilter(index, 'operator', value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="=">=</SelectItem>
                        <SelectItem value="!=">!=</SelectItem>
                        <SelectItem value=">">></SelectItem>
                        <SelectItem value="<"><</SelectItem>
                        <SelectItem value="LIKE">LIKE</SelectItem>
                        <SelectItem value="IN">IN</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Input
                      value={filter.value}
                      onChange={(e) => updateFilter(index, 'value', e.target.value)}
                      placeholder="Value"
                      className="flex-1"
                    />
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFilter(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Generated Query Preview */}
            <div>
              <Label className="text-base font-medium">Generated Query</Label>
              <Textarea
                value={generateQuery()}
                readOnly
                className="mt-2 font-mono text-sm"
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreateReport} disabled={createLoading}>
                <Save className="h-4 w-4 mr-2" />
                Save Report
              </Button>
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Custom Reports List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <Card key={report.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Filter className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingReport(report)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteReport(report.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardTitle className="text-lg">{report.name}</CardTitle>
              <CardDescription className="text-sm">
                {report.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-gray-600">
                <p><strong>Schedule:</strong> {report.schedule}</p>
                <p><strong>Format:</strong> {report.format.toUpperCase()}</p>
                <p><strong>Last Run:</strong> {report.lastRun}</p>
                <p><strong>Next Run:</strong> {report.nextRun}</p>
                <p><strong>Created by:</strong> {report.createdBy}</p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${report.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-sm text-gray-600">
                    {report.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {/* Run report */}}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {/* Download report */}}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {reports.length === 0 && (
        <div className="text-center py-12">
          <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No custom reports found</p>
          <p className="text-gray-400 text-sm mt-2">
            Create your first custom report using the report builder
          </p>
        </div>
      )}
    </div>
  );
}

