/**
 * Adiciona campo created_at nas collections
 */

const axios = require('axios');

const DIRECTUS_URL = 'http://localhost:8055';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'd1r3ctu5';

let headers = {};

async function login() {
  const res = await axios.post(`${DIRECTUS_URL}/auth/login`, {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  headers = { Authorization: `Bearer ${res.data.data.access_token}` };
}

async function addField(collection, field, type = 'timestamp', special = ['date-created']) {
  try {
    await axios.post(`${DIRECTUS_URL}/fields/${collection}`, {
      field,
      type,
      schema: {
        has_auto_increment: false,
        is_nullable: true,
      },
      meta: {
        special,
        interface: 'datetime',
        readonly: true,
      },
    }, { headers });
    console.log(`✅ ${collection}.${field} criado`);
  } catch (e) {
    const msg = e.response?.data?.errors?.[0]?.message || e.message;
    if (msg.includes('exists')) {
      console.log(`⚠️  ${collection}.${field} já existe`);
    } else {
      console.log(`❌ ${collection}.${field}: ${msg}`);
    }
  }
}

async function main() {
  console.log('\n🔧 Adicionando campos created_at...\n');
  await login();

  const collections = ['companies', 'leads', 'properties', 'conversas', 'mensagens'];
  
  for (const coll of collections) {
    await addField(coll, 'created_at');
    await addField(coll, 'updated_at', 'timestamp', ['date-updated']);
  }

  console.log('\n✅ Concluído!\n');
}

main().catch(console.error);
