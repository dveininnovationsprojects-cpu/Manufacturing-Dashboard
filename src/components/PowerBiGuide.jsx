import React, { useState } from 'react';
import { Key, ShieldAlert, Cpu, Palette, Terminal, Copy, Check, ExternalLink } from 'lucide-react';

export default function PowerBiGuide() {
  const [activeSubTab, setActiveSubTab] = useState('azure');
  const [copiedKey, setCopiedKey] = useState('');

  const handleCopy = (key, text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const nodeCode = `// Backend implementation (Node.js + Express)
// Run: npm install msal-node axios dotenv
const express = require('express');
const axios = require('axios');
const msal = require('@azure/msal-node');
require('dotenv').config();

const app = express();

const msalConfig = {
  auth: {
    clientId: process.env.CLIENT_ID, // Azure App Client ID
    authority: \`https://login.microsoftonline.com/\${process.env.TENANT_ID}\`, // Azure Tenant ID
    clientSecret: process.env.CLIENT_SECRET, // Azure Client Secret
  }
};

const cca = new msal.ConfidentialClientApplication(msalConfig);

// Helper to get AAD Access Token
async function getAADToken() {
  const tokenRequest = {
    scopes: ['https://analysis.windows.net/powerbi/api/.default'],
  };
  const response = await cca.acquireTokenByClientCredential(tokenRequest);
  return response.accessToken;
}

// Endpoint to generate Embed Token and URL for React Frontend
app.get('/api/get-embed-info', async (req, res) => {
  try {
    const aadToken = await getAADToken();
    const workspaceId = process.env.WORKSPACE_ID;
    const reportId = process.env.REPORT_ID;

    // 1. Get Report Details (Embed URL)
    const reportDetails = await axios.get(
      \`https://api.powerbi.com/v1.0/myorg/groups/\${workspaceId}/reports/\${reportId}\`,
      { headers: { Authorization: \`Bearer \${aadToken}\` } }
    );

    const embedUrl = reportDetails.data.embedUrl;

    // 2. Generate Embed Token
    const tokenResponse = await axios.post(
      \`https://api.powerbi.com/v1.0/myorg/groups/\${workspaceId}/reports/\${reportId}/GenerateToken\`,
      { accessLevel: 'View' },
      { headers: { Authorization: \`Bearer \${aadToken}\`, 'Content-Type': 'application/json' } }
    );

    const embedToken = tokenResponse.data.token;

    res.json({
      reportId: reportId,
      embedUrl: embedUrl,
      accessToken: embedToken
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Token generation failed', details: err.message });
  }
});

app.listen(5000, () => console.log('Backend server running on port 5000'));`;

  const pythonCode = `# Backend implementation (Python + Flask)
# Run: pip install flask msal requests python-dotenv
import os
import requests
from flask import Flask, jsonify
from msal import ConfidentialClientApplication
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)

CLIENT_ID = os.getenv('CLIENT_ID')
CLIENT_SECRET = os.getenv('CLIENT_SECRET')
TENANT_ID = os.getenv('TENANT_ID')
WORKSPACE_ID = os.getenv('WORKSPACE_ID')
REPORT_ID = os.getenv('REPORT_ID')

def get_aad_token():
    authority_url = f"https://login.microsoftonline.com/{TENANT_ID}"
    app_client = ConfidentialClientApplication(
        CLIENT_ID, authority=authority_url, client_secret=CLIENT_SECRET
    )
    result = app_client.acquire_token_for_client(
        scopes=["https://analysis.windows.net/powerbi/api/.default"]
    )
    if "access_token" in result:
        return result["access_token"]
    raise Exception("Could not retrieve Azure Active Directory Token")

@app.route('/api/get-embed-info', methods=['GET'])
def get_embed_info():
    try:
        aad_token = get_aad_token()
        headers = {'Authorization': f'Bearer {aad_token}', 'Content-Type': 'application/json'}
        
        # 1. Get Report Details
        report_url = f"https://api.powerbi.com/v1.0/myorg/groups/{WORKSPACE_ID}/reports/{REPORT_ID}"
        report_res = requests.get(report_url, headers=headers).json()
        embed_url = report_res.get('embedUrl')
        
        # 2. Generate Embed Token
        token_url = f"https://api.powerbi.com/v1.0/myorg/groups/{WORKSPACE_ID}/reports/{REPORT_ID}/GenerateToken"
        token_payload = {"accessLevel": "View"}
        token_res = requests.post(token_url, json=token_payload, headers=headers).json()
        embed_token = token_res.get('token')
        
        return jsonify({
            'reportId': REPORT_ID,
            'embedUrl': embed_url,
            'accessToken': embed_token
        })
    except Exception as e:
        return jsonify({'error': 'Token generation failed', 'details': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)
`;

  const reactEmbedCode = `// React implementation (Frontend)
// Run: npm install powerbi-client-react powerbi-client
import React, { useEffect, useState } from 'react';
import { PowerBIEmbed } from 'powerbi-client-react';
import { models } from 'powerbi-client';

export default function EmbeddedDashboard() {
  const [embedConfig, setEmbedConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Call backend API to retrieve the tokens securely
    fetch('/api/get-embed-info')
      .then(res => res.json())
      .then(data => {
        setEmbedConfig({
          type: 'report',
          id: data.reportId,
          embedUrl: data.embedUrl,
          accessToken: data.accessToken,
          tokenType: models.TokenType.Embed,
          settings: {
            panes: {
              filters: { expanded: false, visible: false },
              pageNavigation: { visible: true }
            },
            background: models.BackgroundType.Transparent
          }
        });
        setLoading(false);
      })
      .catch(err => console.error("Error loading embed tokens:", err));
  }, []);

  if (loading) return <div>Loading Live Power BI Dashboard...</div>;

  return (
    <div style={{ height: '80vh', width: '100%' }}>
      <PowerBIEmbed
        embedConfig={embedConfig}
        cssClassName="w-full h-full border-none"
      />
    </div>
  );
}`;

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="glass-panel p-6 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-900/20 dark:to-indigo-900/20 border-l-4 border-blue-500 rounded-r-xl rounded-l-none">
        <h3 className="text-base font-extrabold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
          <ShieldAlert className="text-blue-500 w-5 h-5" />
          Power BI Embedded - "App Owns Data" Integration
        </h3>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 max-w-4xl leading-relaxed">
          To securely embed your Power BI reports for authenticated users, implement the Azure Active Directory "App Owns Data" flow. Follow the steps below to establish a secure synchronization between your frontend and backend.
        </p>
      </div>

      {/* Steps Selector */}
      <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-px">
        <button
          onClick={() => setActiveSubTab('azure')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
            activeSubTab === 'azure'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          1. Azure Active Directory Setup
        </button>
        <button
          onClick={() => setActiveSubTab('backend')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
            activeSubTab === 'backend'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          2. Backend API Endpoint Codes
        </button>
        <button
          onClick={() => setActiveSubTab('frontend')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
            activeSubTab === 'frontend'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          3. React Frontend Integration
        </button>
      </div>

      {/* Tab Panels */}
      {activeSubTab === 'azure' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel p-5 space-y-4">
            <h4 className="font-bold text-zinc-850 dark:text-zinc-200 text-sm flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-500" />
              Step 1: Create Microsoft Azure App Registration
            </h4>
            <ol className="list-decimal list-inside text-xs text-zinc-600 dark:text-zinc-400 space-y-3.5 leading-relaxed font-medium">
              <li>
                Log in to the{' '}
                <a 
                  href="https://portal.azure.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-blue-500 hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  Azure Portal <ExternalLink className="w-3 h-3" />
                </a>.
              </li>
              <li>
                Search for and select <b>App Registrations</b>, then click <b>New Registration</b>.
              </li>
              <li>
                Name the application (e.g., <i>Enterprise-PowerBI-Link</i>), configure the account access, and click <b>Register</b>.
              </li>
              <li>
                From the app overview page, copy and save the <b>Application (Client) ID</b> and the <b>Directory (Tenant) ID</b>.
              </li>
              <li>
                Navigate to <b>Certificates & Secrets</b>, create a <b>New Client Secret</b>, and copy the secret value immediately for your <code>.env</code> file.
              </li>
            </ol>
          </div>

          <div className="glass-panel p-5 space-y-4">
            <h4 className="font-bold text-zinc-850 dark:text-zinc-200 text-sm flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-500" />
              Step 2: Connect Azure to Power BI Service Workspace
            </h4>
            <ol className="list-decimal list-inside text-xs text-zinc-600 dark:text-zinc-400 space-y-3.5 leading-relaxed font-medium">
              <li>
                Log in to the{' '}
                <a 
                  href="https://app.powerbi.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-blue-500 hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  Power BI Cloud Admin Portal <ExternalLink className="w-3 h-3" />
                </a>.
              </li>
              <li>
                Open <b>Tenant Settings</b> and enable the option: <i>"Allow service principals to use Power BI APIs"</i>. Associate it with your security group.
              </li>
              <li>
                Open the target report <b>Workspace</b> in the Power BI portal.
              </li>
              <li>
                Click <b>Manage Access</b>, add your registered Azure App name (Service Principal), and assign it <b>Member</b> or <b>Admin</b> role permissions.
              </li>
              <li>
                Extract the Workspace ID and Report ID from the report URL segment:
                <code className="text-xs bg-zinc-100 dark:bg-zinc-800 text-rose-500 px-1 rounded block mt-1.5 font-mono">
                  app.powerbi.com/groups/<b>[WORKSPACE_ID]</b>/reports/<b>[REPORT_ID]</b>
                </code>
              </li>
            </ol>
          </div>
        </div>
      )}

      {activeSubTab === 'backend' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Node.js Block */}
          <div className="glass-panel p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2">
              <span className="font-bold text-zinc-800 dark:text-zinc-200 text-sm flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-500" />
                Node.js (Express) Endpoint
              </span>
              <button 
                onClick={() => handleCopy('node', nodeCode)}
                className="flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-blue-500 dark:hover:text-blue-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded border border-zinc-200/50 dark:border-zinc-700/50 transition-all"
              >
                {copiedKey === 'node' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'node' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="text-xs font-mono p-3 bg-zinc-950 text-zinc-300 rounded-lg overflow-x-auto max-h-[380px]">
              {nodeCode}
            </pre>
          </div>

          {/* Python Block */}
          <div className="glass-panel p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2">
              <span className="font-bold text-zinc-800 dark:text-zinc-200 text-sm flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-blue-500" />
                Python (Flask) Endpoint
              </span>
              <button 
                onClick={() => handleCopy('python', pythonCode)}
                className="flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-blue-500 dark:hover:text-blue-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded border border-zinc-200/50 dark:border-zinc-700/50 transition-all"
              >
                {copiedKey === 'python' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'python' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="text-xs font-mono p-3 bg-zinc-950 text-zinc-300 rounded-lg overflow-x-auto max-h-[380px]">
              {pythonCode}
            </pre>
          </div>
        </div>
      )}
      {activeSubTab === 'frontend' && (
        <div className="glass-panel p-5 space-y-4 max-w-4xl mx-auto">
          <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2">
            <span className="font-bold text-zinc-800 dark:text-zinc-200 text-sm flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-blue-500" />
              React Embed Component (Frontend)
            </span>
            <button 
              onClick={() => handleCopy('react', reactEmbedCode)}
              className="flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-blue-500 dark:hover:text-blue-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded border border-zinc-200/50 dark:border-zinc-700/50 transition-all"
            >
              {copiedKey === 'react' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'react' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            Install Microsoft's official integration package in your frontend: 
            <code className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 text-blue-500 px-1.5 py-0.5 rounded ml-1">
              npm install powerbi-client-react powerbi-client
            </code>.
          </p>
          <pre className="text-xs font-mono p-3 bg-zinc-950 text-zinc-300 rounded-lg overflow-x-auto max-h-[400px]">
            {reactEmbedCode}
          </pre>
        </div>
      )}
    </div>
  );
}
