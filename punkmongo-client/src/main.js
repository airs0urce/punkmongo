import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { 
    faAngleLeft, 
    faAngleRight,
    faCaretDown,
    faPen,
    faTimes,
    faCaretRight,
    faPlus,
    faQuestionCircle,
    faTrashAlt,
    faArrowRight,
    faLongArrowAltRight,
    faCircle,
    faCheck,
} from '@fortawesome/free-solid-svg-icons'
import VueWorker from 'vue-worker'

library.add(faAngleLeft)
library.add(faAngleRight)
library.add(faCaretDown)
library.add(faPen)
library.add(faTimes)
library.add(faCaretRight)
library.add(faPlus)
library.add(faQuestionCircle)
library.add(faTrashAlt)
library.add(faArrowRight)
library.add(faLongArrowAltRight)
library.add(faCircle)
library.add(faCheck)




Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.use(require('vue-shortkey'))
Vue.use(VueWorker)

Vue.config.productionTip = false


new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')


