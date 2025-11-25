export default {
  id: 'imobi-homepage',
  name: 'iMOBI - Homepage',
  icon: 'home',
  routes: [
    {
      path: '',
      component: () => import('./homepage.vue'),
    },
  ],
  hidden: false,
  preRegisterCheck(user, permissions) {
    // Público - todos podem acessar
    return true;
  },
};
