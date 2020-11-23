import Vue from 'vue';
import VueRouter from 'vue-router';

import App from './App.vue';
import Buefy from 'buefy';
import 'buefy/dist/buefy.css';
import axios from 'axios';
import ClipBoard from 'clipboard';

Vue.use(Buefy);
Vue.use(VueRouter);
Vue.prototype.$http = axios;
Vue.prototype.$clip = new ClipBoard('.copy', {});
Vue.prototype.$registry = process.env.VUE_APP_REGISTRY || '';

// icons
import GithubBoxIcon from "vue-material-design-icons/GithubBox.vue";
import SourceCommitIcon from "vue-material-design-icons/SourceCommit.vue";
import ContentCopyIcon from "vue-material-design-icons/ContentCopy.vue";
import "vue-material-design-icons/styles.css";

Vue.component("github-box-icon", GithubBoxIcon);
Vue.component("source-commit-icon", SourceCommitIcon);
Vue.component("content-copy-icon", ContentCopyIcon);


Vue.config.productionTip = false;

const router = new VueRouter({
  mode: 'history',
  base: __dirname,
  routes: [
    {path: '/image/:image', component: App},
    {path: '/tag/:image/:tag', component: App},
  ],
});

new Vue({
  render: h => h(App),
  router,
}).$mount('#app');
