import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'

import 'nprogress/nprogress.css'
import nprogress from 'nprogress'

// Store reference - will be set after store is created
let store = null

export function setStore(storeInstance) {
    store = storeInstance
}

class API {
    constructor() {
        // Use relative URL - Vite proxy will handle it
        this.endpoint = ''
    }

    async request(method, params = {}, timeout = 30 * 60000) {
        let response

        nprogress.start()
        response = await axios.post(this.endpoint + '/api/' + method, {
            id: uuidv4(),
            params: params,
        }, {
            responseType: 'json',
            timeout: timeout
        })

        nprogress.done()

        const responseData = response.data
        if (!responseData.success) {
            if (responseData.error && responseData.error.code >= 100) {
                let error = responseData.error.message
                if (100 === responseData.error.code) {
                    error = `[${responseData.error.code} Uncaught Server Error] ${error}`
                } else {
                    error = `[${responseData.error.code} Server Error] ${error}`
                }

                if (store) {
                    store.setUncaughtServerError({ error: error })
                }
            }
        }

        return responseData
    }
}

export default new API()
