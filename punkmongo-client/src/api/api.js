import axios from 'axios'
import config from '../../../config'
import uuidv4 from 'uuid/v4'
import * as mutations from '../store/mutations';
import store from '../store/index';
import utils from '../utils';

import 'nprogress/nprogress.css'
import nprogress from 'nprogress/nprogress.js'


class API {
    constructor() {
        this.endpoint = `${config.client.protocol}${config.client.host}:${config.client.port}`;
    }

    async request(method, params = {}, timeout = 30 * 60000) {
        let response;

        nprogress.start();
        response = await axios.post(this.endpoint + '/api/' + method, {
            id: uuidv4(),
            params: params,
        }, {
            responseType: 'json',
            timeout: timeout
        });

        nprogress.done();
        
        const responseData = response.data;
        if (! responseData.success) {      
            if (responseData.error && responseData.error.code >= 100) {
                // this is generic error that we will show on top of page
                let error = responseData.error.message;
                if (100 === responseData.error.code) {
                    error = `[${responseData.error.code} Uncaught Server Error] ${error}`;
                } else {
                    error = `[${responseData.error.code} Server Error] ${error}`;
                }

                store.commit(mutations.SET_UNCAUGHT_SERVER_ERROR, {error: error});
            }
        }

        return responseData;
    }

}


export default new API()