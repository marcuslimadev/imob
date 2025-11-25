import { defineModule } from '@directus/extensions-sdk';
import ModuleComponent from './module.vue';

export default defineModule({
  id: 'imobi-crm',
  name: 'CRM',
  icon: 'business',
  routes: [
    {
      path: '',
      component: ModuleComponent,
    },
  ],
});
