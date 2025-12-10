const axios = require("axios");

const DIRECTUS_URL = "http://localhost:8055";
const ADMIN_EMAIL = "marcus@admin.com";
const ADMIN_PASSWORD = "Teste@123";

async function main() {
  console.log("🔑 Fazendo login como super admin...");
  const loginRes = await axios.post(`${DIRECTUS_URL}/auth/login`, {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });

  const token = loginRes.data.data.access_token;
  const headers = { Authorization: `Bearer ${token}` };

  // 1. Criar empresa Exclusiva
  console.log("🏢 Criando empresa Exclusiva...");
  let companyId;
  try {
    const companyRes = await axios.post(
      `${DIRECTUS_URL}/items/companies`,
      {
        name: "Exclusiva Lar Imóveis",
        slug: "exclusiva",
        custom_domain: "exclusivalarimoveis.com.br",
        email: "contato@exclusivalarimoveis.com.br",
        phone: "(11) 3456-7890",
        city: "São Paulo",
        state: "SP",
        subscription_plan: "pro",
        subscription_status: "active",
      },
      { headers }
    );
    companyId = companyRes.data.data.id;
    console.log("✅ Empresa criada! ID:", companyId);
  } catch (e) {
    if (e.response?.status === 403 || e.response?.data?.errors?.[0]?.extensions?.code === "RECORD_NOT_UNIQUE") {
      console.log("ℹ️  Empresa já existe, buscando...");
      const companiesRes = await axios.get(`${DIRECTUS_URL}/items/companies`, { headers });
      companyId = companiesRes.data.data[0]?.id;
      console.log("✅ Empresa encontrada! ID:", companyId);
    } else {
      throw e;
    }
  }

  // 2. Buscar role de Company Admin
  console.log("🔍 Buscando role Company Admin...");
  const rolesRes = await axios.get(`${DIRECTUS_URL}/roles`, { headers });
  let companyAdminRole = rolesRes.data.data.find(r => r.name === "Company Admin");
  
  if (!companyAdminRole) {
    console.log("📝 Role Company Admin não encontrada! Criando...");
    const createRoleRes = await axios.post(
      `${DIRECTUS_URL}/roles`,
      { name: "Company Admin", admin_access: false, app_access: true },
      { headers }
    );
    companyAdminRole = createRoleRes.data.data;
    console.log("✅ Role criada! ID:", companyAdminRole.id);
  } else {
    console.log("✅ Role encontrada! ID:", companyAdminRole.id);
  }

  // 3. Criar usuário admin da imobiliária
  console.log("👤 Criando usuário administrador da imobiliária...");
  try {
    const userRes = await axios.post(
      `${DIRECTUS_URL}/users`,
      {
        email: "gestor@exclusivalarimoveis.com.br",
        password: "Exclusiva2024!",
        first_name: "Gestor",
        last_name: "Exclusiva",
        role: companyAdminRole.id,
        status: "active",
        company_id: companyId,
      },
      { headers }
    );
    console.log("✅ Usuário criado!");
  } catch (e) {
    if (e.response?.data?.errors?.[0]?.extensions?.code === "RECORD_NOT_UNIQUE") {
      console.log("ℹ️  Usuário já existe!");
    } else {
      throw e;
    }
  }

  console.log("\n📧 CREDENCIAIS LOCAL:");
  console.log("Directus Admin: http://localhost:8055/admin");
  console.log("  Email: marcus@admin.com");
  console.log("  Senha: Teste@123");
  console.log("\nNext.js: http://localhost:4000");
  console.log("  Email: gestor@exclusivalarimoveis.com.br");
  console.log("  Senha: Exclusiva2024!");
  console.log("\nCompany ID:", companyId);
}

main().catch((error) => {
  console.error("❌ Erro:", error.response?.data || error.message);
  process.exit(1);
});
