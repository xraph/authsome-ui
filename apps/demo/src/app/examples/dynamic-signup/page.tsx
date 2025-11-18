'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { AuthProvider, AuthFlow, type UIComponents, type RendererConfig } from '@authsome/ui-react';
import { AuthClient, getFlowConfig, FlowConfigType } from '@authsome/ui-core';
import type { FieldDefinition, AuthProvider as IAuthProvider, ProviderConfig } from '@authsome/ui-core';
import React, { useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from '@/components/ui/field';
import { GenericAdapter } from '@authsome/adapter-generic';

// Mock adapter that returns dynamic signup fields
class MockDynamicFieldsAdapter extends GenericAdapter {
  async getSignupFields(): Promise<FieldDefinition[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return [
      {
        name: 'firstName',
        label: 'First Name',
        type: 'text',
        placeholder: 'John',
        helperText: 'Your legal first name',
        validation: {
          required: true,
          minLength: 2,
          errorMessage: 'First name must be at least 2 characters',
        },
      },
      {
        name: 'lastName',
        label: 'Last Name',
        type: 'text',
        placeholder: 'Doe',
        validation: {
          required: true,
          minLength: 2,
        },
      },
      {
        name: 'phoneNumber',
        label: 'Phone Number',
        type: 'tel',
        placeholder: '+1 (555) 123-4567',
        helperText: 'We\'ll use this for account recovery',
        validation: {
          required: false,
          pattern: '^\\+?[1-9]\\d{1,14}$',
          errorMessage: 'Please enter a valid phone number',
        },
      },
      {
        name: 'country',
        label: 'Country',
        type: 'select',
        placeholder: 'Select your country',
        options: [
          { value: 'us', label: 'United States' },
          { value: 'uk', label: 'United Kingdom' },
          { value: 'ca', label: 'Canada' },
          { value: 'au', label: 'Australia' },
          { value: 'de', label: 'Germany' },
          { value: 'fr', label: 'France' },
          { value: 'other', label: 'Other' },
        ],
        validation: {
          required: true,
        },
      },
      {
        name: 'age',
        label: 'Age',
        type: 'number',
        placeholder: '18',
        helperText: 'You must be 18 or older to register',
        validation: {
          required: true,
          min: 18,
          max: 120,
          errorMessage: 'You must be at least 18 years old',
        },
      },
      {
        name: 'dateOfBirth',
        label: 'Date of Birth',
        type: 'date',
        helperText: 'Your date of birth',
        validation: {
          required: false,
        },
      },
      {
        name: 'bio',
        label: 'Bio',
        type: 'textarea',
        placeholder: 'Tell us about yourself...',
        helperText: 'Optional brief introduction (max 500 characters)',
        validation: {
          required: false,
          maxLength: 500,
        },
      },
      {
        name: 'newsletter',
        label: 'Subscribe to newsletter',
        type: 'checkbox',
        helperText: 'Receive updates about new features and promotions',
        defaultValue: true,
        validation: {
          required: false,
        },
      },
    ];
  }
}

// Map shadcn components to AuthSome UI interface
const uiComponents: UIComponents = {
  Input: Input,
  Button: Button,
  Field: {
    Field,
    FieldLabel,
    FieldDescription,
    FieldError,
  },
  Checkbox: Checkbox,
  Textarea: Textarea,
  Select: {
    Root: Select,
    Trigger: SelectTrigger,
    Value: SelectValue,
    Content: SelectContent,
    Item: SelectItem,
  },
  Alert: Alert,
  Divider: ({ label }) => (
    <div className="relative flex items-center gap-2">
      <Separator className="flex-1" />
      {label && <span className="text-xs uppercase">{label}</span>}
      <Separator className="flex-1" />
    </div>
  ),
  Link: ({ href, children, onClick, className }) => (
    <a
      href={href}
      onClick={onClick}
      className={`text-primary underline-offset-4 hover:underline ${className || ''}`}
    >
      {children}
    </a>
  ),
};

export default function DynamicSignupFieldsExample() {
  const [client] = useState(() => {
    const adapter = new MockDynamicFieldsAdapter();
    return new AuthClient(adapter, {
      apiUrl: 'https://api.example.com',
    });
  });

  const [signupData, setSignupData] = useState<any>(null);

  const signupFlow = getFlowConfig(FlowConfigType.EMAIL_PASSWORD_SIGN_UP);

  const rendererConfig: RendererConfig = {
    authMethods: {
      emailPassword: true,
      oauth: false,
      magicLink: false,
      phone: false,
      passkey: false,
      username: false,
    },
    signUp: {
      useDynamicFields: true,
      showTermsCheckbox: true,
      termsText: 'I agree to the Terms of Service and Privacy Policy',
    },
    labels: {
      signUp: 'Create Account',
    },
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <Link href="/examples">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Examples
            </Button>
          </Link>
          
          <div className="mt-6">
            <h1 className="text-4xl font-bold tracking-tight">Dynamic Signup Fields</h1>
            <p className="text-muted-foreground mt-2">
              Backend-driven signup form fields fetched from your API
            </p>
          </div>
        </div>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>About Dynamic Signup Fields</CardTitle>
            <CardDescription>
              This example demonstrates how to use dynamic signup fields that are fetched from your backend API.
              The fields are defined server-side and rendered client-side with full validation support.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Features:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Fields are fetched from the backend during adapter initialization</li>
                <li>Full field type support: text, email, tel, number, date, select, checkbox, textarea</li>
                <li>Server-side validation rules (required, min/max, pattern, length)</li>
                <li>Custom error messages from the backend</li>
                <li>Helper text and placeholder support</li>
                <li>Default values for fields</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Implementation:</h3>
              <div className="bg-muted rounded-lg p-4">
                <pre className="text-xs overflow-x-auto">
{`// 1. Implement getSignupFields in your adapter
class MyAdapter extends AuthSomeAdapter {
  async getSignupFields(): Promise<FieldDefinition[]> {
    // Fetch from your API
    const response = await fetch('/api/auth/signup/fields');
    return response.json();
  }
}

// 2. API Response Example
{
  "fields": [
    {
      "name": "firstName",
      "label": "First Name",
      "type": "text",
      "validation": {
        "required": true,
        "minLength": 2
      }
    }
  ]
}

// 3. Enable in renderer config
const config: RendererConfig = {
  signUp: {
    useDynamicFields: true // true by default
  }
};`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Demo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Sign Up Form</CardTitle>
              <CardDescription>
                Try filling out the form with dynamic fields. The fields below are fetched from the mock adapter.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AuthProvider client={client}>
                <AuthFlow
                  flow={signupFlow}
                  uiComponents={uiComponents}
                  rendererConfig={rendererConfig}
                  onSuccess={(data) => {
                    console.log('Signup successful:', data);
                    setSignupData(data);
                  }}
                  onError={(error) => {
                    console.error('Signup failed:', error);
                  }}
                />
              </AuthProvider>
            </CardContent>
          </Card>

          {/* Preview/Result */}
          <Card>
            <CardHeader>
              <CardTitle>Form Data Preview</CardTitle>
              <CardDescription>
                The data that will be sent to your backend on signup
              </CardDescription>
            </CardHeader>
            <CardContent>
              {signupData ? (
                <div className="space-y-2">
                  <Alert>
                    <div className="font-semibold">Signup Successful!</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Form data captured and ready to send to backend.
                    </div>
                  </Alert>
                  
                  <div className="bg-muted rounded-lg p-4 mt-4">
                    <div className="text-xs font-mono">
                      <pre className="overflow-x-auto">
                        {JSON.stringify(signupData, null, 2)}
                      </pre>
                    </div>
                  </div>

                  <Button 
                    onClick={() => setSignupData(null)} 
                    variant="outline" 
                    className="w-full mt-4"
                  >
                    Reset
                  </Button>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  <p>Fill out the signup form to see the data preview here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Field Types Table */}
        <Card>
          <CardHeader>
            <CardTitle>Supported Field Types</CardTitle>
            <CardDescription>
              All available field types for dynamic signup forms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-semibold">Type</th>
                    <th className="text-left p-2 font-semibold">Description</th>
                    <th className="text-left p-2 font-semibold">Validations</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="p-2 font-mono">text</td>
                    <td className="p-2">Text input field</td>
                    <td className="p-2 text-xs">required, minLength, maxLength, pattern</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono">email</td>
                    <td className="p-2">Email input field</td>
                    <td className="p-2 text-xs">required, pattern</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono">tel</td>
                    <td className="p-2">Phone number input</td>
                    <td className="p-2 text-xs">required, pattern</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono">number</td>
                    <td className="p-2">Numeric input</td>
                    <td className="p-2 text-xs">required, min, max</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono">date</td>
                    <td className="p-2">Date picker</td>
                    <td className="p-2 text-xs">required</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono">url</td>
                    <td className="p-2">URL input field</td>
                    <td className="p-2 text-xs">required, pattern</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono">select</td>
                    <td className="p-2">Dropdown selection</td>
                    <td className="p-2 text-xs">required, options</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono">checkbox</td>
                    <td className="p-2">Boolean checkbox</td>
                    <td className="p-2 text-xs">required</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono">textarea</td>
                    <td className="p-2">Multi-line text area</td>
                    <td className="p-2 text-xs">required, minLength, maxLength</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

