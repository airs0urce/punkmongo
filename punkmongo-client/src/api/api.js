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
        this.jsonRPCErrorCodes = {
            '-32601': 'Method not found', 
            '-32603': 'Internal error',
            '-32604': 'Unauthorized', 
            '-32602': 'Invalid params', 
            '-32700': 'Parse error',
            '-32600': 'Invalid request', 
        };
    }

    // you can send JSON RPC 2.0 notification if you pass undefined in "id" parameter
    async request(method, params = {}, timeout = 30 * 60000) {
        let response;

        nprogress.start();
        response = await axios.post(this.endpoint, {
            jsonrpc: '2.0',
            method: method,
            params: params,
            id: uuidv4()
        }, {
            responseType: 'json',
            timeout: timeout
        });

        nprogress.done();
        
        const responseData = response.data;
        if (responseData.error) {
            if (this.jsonRPCErrorCodes[responseData.error.code]) {
                const errorCodeMeaning = this.jsonRPCErrorCodes[responseData.error.code];
                const error = `[${responseData.error.code} ${errorCodeMeaning}] - ${responseData.error.message}`;
                store.commit(mutations.SET_ERROR, {error: error});
            }
        }

        console.log('| ', method, JSON.stringify(params, null, '  '));
        console.log('| res: ', responseData.result);
        console.log('===');
        
        

        return responseData;
    }

}


export default new API()