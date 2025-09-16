'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Upload, Download, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const bulkImportSchema = z.object({
  file: z.any().refine((file) => file && file.length > 0, 'Please select a file'),
  role: z.string().optional(),
  department: z.string().optional(),
  send_welcome_email: z.boolean().default(true),
  validate_only: z.boolean().default(false),
});

type BulkImportData = z.infer<typeof bulkImportSchema>;

interface ImportResult {
  total_rows: number;
  successful_imports: number;
  failed_imports: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
  }>;
  warnings: Array<{
    row: number;
    field: string;
    message: string;
  }>;
  imported_users: Array<{
    username: string;
    email: string;
    name: string;
  }>;
}

export default function BulkImport() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const form = useForm<BulkImportData>({
    resolver: zodResolver(bulkImportSchema),
    defaultValues: {
      file: null,
      role: '',
      department: '',
      send_welcome_email: true,
      validate_only: false,
    },
  });

  const onSubmit = async (data: BulkImportData) => {
    if (!selectedFile) {
      toast.error('Please select a file to import');
      return;
    }

    setIsLoading(true);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (data.role) formData.append('role', data.role);
      if (data.department) formData.append('department', data.department);
      formData.append('send_welcome_email', data.send_welcome_email.toString());
      formData.append('validate_only', data.validate_only.toString());

      // Here you would make the API call to import users
      console.log('Importing users:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock result
      const mockResult: ImportResult = {
        total_rows: 10,
        successful_imports: 8,
        failed_imports: 2,
        errors: [
          { row: 3, field: 'email', message: 'Invalid email format' },
          { row: 7, field: 'username', message: 'Username already exists' },
        ],
        warnings: [
          { row: 5, field: 'phone', message: 'Phone number format may be incorrect' },
        ],
        imported_users: [
          { username: 'john.doe', email: 'john@example.com', name: 'John Doe' },
          { username: 'jane.smith', email: 'jane@example.com', name: 'Jane Smith' },
          { username: 'bob.wilson', email: 'bob@example.com', name: 'Bob Wilson' },
          { username: 'alice.brown', email: 'alice@example.com', name: 'Alice Brown' },
          { username: 'charlie.davis', email: 'charlie@example.com', name: 'Charlie Davis' },
          { username: 'diana.miller', email: 'diana@example.com', name: 'Diana Miller' },
          { username: 'eve.jones', email: 'eve@example.com', name: 'Eve Jones' },
          { username: 'frank.garcia', email: 'frank@example.com', name: 'Frank Garcia' },
        ],
      };
      
      setImportResult(mockResult);
      
      if (data.validate_only) {
        toast.success('File validation completed!', {
          duration: 3000,
          position: 'top-right',
        });
      } else {
        toast.success(`Successfully imported ${mockResult.successful_imports} users!`, {
          duration: 3000,
          position: 'top-right',
        });
      }
    } catch (error) {
      toast.error('Failed to import users. Please try again.', {
        duration: 5000,
        position: 'top-right',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      form.setValue('file', file);
    }
  };

  const downloadTemplate = (type: string) => {
    // Here you would generate and download the template file
    toast.success(`Downloading ${type} template...`, {
      duration: 2000,
      position: 'top-right',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center space-x-4">
        <Link href="/admin/users">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bulk Import Users</h1>
          <p className="mt-1 text-sm text-gray-500">
            Import multiple users from a CSV or Excel file
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Import Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Import Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* File Upload */}
                  <FormField
                    control={form.control}
                    name="file"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select File *</FormLabel>
                        <FormControl>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                            <input
                              type="file"
                              accept=".csv,.xlsx,.xls"
                              onChange={handleFileChange}
                              className="hidden"
                              id="file-upload"
                            />
                            <label htmlFor="file-upload" className="cursor-pointer">
                              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-sm text-gray-600 mb-2">
                                Click to upload or drag and drop
                              </p>
                              <p className="text-xs text-gray-500">
                                CSV, XLSX, XLS files up to 10MB
                              </p>
                            </label>
                          </div>
                        </FormControl>
                        {selectedFile && (
                          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 text-green-500 mr-2" />
                              <span className="text-sm text-green-700">
                                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                              </span>
                            </div>
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Import Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Role</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select default role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="STUDENT">Student</SelectItem>
                              <SelectItem value="FACULTY">Faculty</SelectItem>
                              <SelectItem value="PARENT">Parent</SelectItem>
                              <SelectItem value="LIBRARIAN">Librarian</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Department</FormLabel>
                          <FormControl>
                            <input
                              type="text"
                              placeholder="Computer Science"
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Import Settings */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="send_welcome_email"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            Send welcome email to imported users
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="validate_only"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            Validate only (don't import users)
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Submit Button */}
                  <Button type="submit" disabled={isLoading || !selectedFile} className="w-full">
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {form.watch('validate_only') ? 'Validating...' : 'Importing...'}
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        {form.watch('validate_only') ? 'Validate File' : 'Import Users'}
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Templates and Help */}
        <div className="space-y-6">
          {/* Download Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="h-5 w-5 mr-2" />
                Download Templates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => downloadTemplate('Student')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Student Template
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => downloadTemplate('Faculty')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Faculty Template
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => downloadTemplate('General')}
              >
                <FileText className="h-4 w-4 mr-2" />
                General Template
              </Button>
            </CardContent>
          </Card>

          {/* Import Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle>Import Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Required fields: username, email, first_name, last_name</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Usernames and emails must be unique</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Use validate only to check for errors first</span>
              </div>
              <div className="flex items-start">
                <AlertCircle className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Maximum 1000 users per import</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Import Results */}
      {importResult && (
        <Card>
          <CardHeader>
            <CardTitle>Import Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{importResult.total_rows}</div>
                <div className="text-sm text-blue-600">Total Rows</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{importResult.successful_imports}</div>
                <div className="text-sm text-green-600">Successful</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{importResult.failed_imports}</div>
                <div className="text-sm text-red-600">Failed</div>
              </div>
            </div>

            {/* Errors */}
            {importResult.errors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-red-800 mb-3">Errors</h3>
                <div className="space-y-2">
                  {importResult.errors.map((error, index) => (
                    <div key={index} className="flex items-center p-3 bg-red-50 border border-red-200 rounded-md">
                      <X className="h-4 w-4 text-red-500 mr-2" />
                      <span className="text-sm text-red-700">
                        Row {error.row}: {error.field} - {error.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings */}
            {importResult.warnings.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-yellow-800 mb-3">Warnings</h3>
                <div className="space-y-2">
                  {importResult.warnings.map((warning, index) => (
                    <div key={index} className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                      <span className="text-sm text-yellow-700">
                        Row {warning.row}: {warning.field} - {warning.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Imported Users */}
            {importResult.imported_users.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-green-800 mb-3">Imported Users</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {importResult.imported_users.map((user, index) => (
                    <div key={index} className="flex items-center p-3 bg-green-50 border border-green-200 rounded-md">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-green-800">{user.name}</div>
                        <div className="text-xs text-green-600">{user.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
