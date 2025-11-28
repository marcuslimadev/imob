/**
 * Exporta permissões do Directus para versionamento
 */
require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'marcus@admin.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Teste@123';

async function login() {
  console.log('🔑 Fazendo login...');
  const response = await axios.post(`${DIRECTUS_URL}/auth/login`, {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  return response.data.data.access_token;
}

async function exportPermissions(token) {
  const headers = { Authorization: `Bearer ${token}` };
  
  console.log('📥 Exportando roles...');
  const rolesResp = await axios.get(`${DIRECTUS_URL}/roles`, { headers });
  
  console.log('📥 Exportando policies...');
  const policiesResp = await axios.get(`${DIRECTUS_URL}/policies`, { headers });
  
  console.log('📥 Exportando permissions...');
  const permsResp = await axios.get(`${DIRECTUS_URL}/permissions`, { headers });
  
  const exportData = {
    version: '1.0',
    exported_at: new Date().toISOString(),
    directus_version: '11.12.0',
    roles: rolesResp.data.data,
    policies: policiesResp.data.data,
    permissions: permsResp.data.data
  };
  
  const outputPath = path.join(__dirname, 'access', 'permissions.json');
  fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));
  console.log(`✅ Exportado para: ${outputPath}`);
  console.log(`📊 Total: ${exportData.roles.length} roles, ${exportData.policies.length} policies, ${exportData.permissions.length} permissions`);
}

async function main() {
  try {
    const token = await login();
    await exportPermissions(token);
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
    process.exit(1);
  }
}

main();
