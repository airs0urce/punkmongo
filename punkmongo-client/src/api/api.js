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
        this.mainErrorCodes = {
            100: 'Input Parameters Error',
            101: 'Generic Server Error'
        };
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
            if (this.mainErrorCodes[responseData.error.code]) {
                const errorCodeMeaning = this.mainErrorCodes[responseData.error.code];
                const error = `[${responseData.error.code} ${errorCodeMeaning}] ${responseData.error.message}`;
                store.commit(mutations.SET_ERROR, {error: error});
            }
        }

        return responseData;
    }

}


export default new API()