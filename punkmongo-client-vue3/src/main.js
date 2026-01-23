import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'
import { useMainStore } from './stores/main'
import { setStore } from './api/api'

// FontAwesome
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

// Add icons to library
library.add(
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
    faCheck
)

// Create app
const app = createApp(App)

// Setup Pinia
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)

// Initialize store and connect to API
const store = useMainStore()
setStore(store)

// Setup router
app.use(router)

// Register FontAwesome component globally
app.component('font-awesome-icon', FontAwesomeIcon)

// Mount app
app.mount('#app')
