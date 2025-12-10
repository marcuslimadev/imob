import { defineModule } from '@directus/extensions-sdk';
import ModuleComponent from './module.vue';
import DashboardRoute from './routes/dashboard.vue';
import ConversasRoute from './routes/conversas.vue';
import LeadsRoute from './routes/leads.vue';
import ImoveisRoute from './routes/imoveis.vue';

export default defineModule({
  id: 'imobi-crm',
  name: 'CRM',
  icon: 'business',
  routes: [
    {
      name: 'imobi-crm',
      path: '',
      component: ModuleComponent,
      children: [
        {
          name: 'imobi-crm-dashboard',
          path: 'dashboard',
          component: DashboardRoute,
        },
        {
          name: 'imobi-crm-conversas',
          path: 'conversas',
          component: ConversasRoute,
        },
        {
          name: 'imobi-crm-leads',
          path: 'leads',
          component: LeadsRoute,
        },
        {
          name: 'imobi-crm-imoveis',
          path: 'imoveis',
          component: ImoveisRoute,
        },
      ],
    },
  ],
});
