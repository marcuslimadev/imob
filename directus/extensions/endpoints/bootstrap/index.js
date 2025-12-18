// Endpoint para criar primeiro usuário admin (bootstrap)
// Deve ser removido após uso por segurança

module.exports = (router, { services, database, getSchema }) => {
  router.post('/create-first-admin', async (req, res) => {
    try {
      const { UsersService } = services;
      const schema = await getSchema();
      
      // Verificar se já existe algum usuário
      const users = await database('directus_users').count('* as count');
      
      if (users[0].count > 0) {
        return res.status(403).json({
          error: 'Usuários já existem no sistema. Este endpoint só funciona para bootstrap inicial.'
        });
      }
      
      // Buscar role de Administrator
      const adminRole = await database('directus_roles')
        .where({ admin_access: true })
        .first();
      
      if (!adminRole) {
        return res.status(500).json({
          error: 'Role de administrador não encontrada'
        });
      }
      
      // Buscar primeira empresa (se houver)
      const company = await database('companies').first();
      
      // Criar usuário admin
      const usersService = new UsersService({ schema, accountability: null });
      
      const newUser = await usersService.createOne({
        email: 'admin@imobi.com',
        password: 'Admin123!',
        first_name: 'Admin',
        last_name: 'Sistema',
        role: adminRole.id,
        company_id: company?.id || null,
        status: 'active'
      });
      
      res.json({
        success: true,
        message: 'Usuário admin criado com sucesso!',
        user: {
          id: newUser,
          email: 'admin@imobi.com',
          role: adminRole.name,
          company_id: company?.id || null
        },
        credentials: {
          email: 'admin@imobi.com',
          password: 'Admin123!'
        }
      });
      
    } catch (error) {
      console.error('Erro ao criar primeiro admin:', error);
      res.status(500).json({
        error: 'Erro ao criar usuário admin',
        details: error.message
      });
    }
  });
};
