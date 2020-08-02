import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { 
    faAngleLeft, 
    faAngleRight,
    faAngleDoubleLeft,
    faAngleDoubleRight,
} from '@fortawesome/free-solid-svg-icons'

library.add(faAngleLeft)
library.add(faAngleRight)
library.add(faAngleDoubleLeft)
library.add(faAngleDoubleRight)

Vue.component('font-awesome-icon', FontAwesomeIcon)




Vue.config.productionTip = false

Vue.use(require('vue-shortkey'))

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')


