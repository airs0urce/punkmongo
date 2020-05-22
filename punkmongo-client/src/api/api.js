import axios from 'axios'
import config from '../../../config'
import uuidv4 from 'uuid/v4'

class API {
    constructor() {
        this.endpoint = `${config.client.protocol}${config.client.host}:${config.client.port}`;
    }

    // you can send JSON RPC 2.0 notification if you pass undefined in "id" parameter
    async request(method, params = {}, timeout = 30 * 60000) {
        let response;

        response = await axios.post(this.endpoint, {
            jsonrpc: '2.0',
            method: method,
            params: params,
            id: uuidv4()
        }, {
            responseType: 'json',
            timeout: timeout
        });
        const responseData = response.data;
        if (responseData.error) {
            const error = `[${responseData.error.code}] - ${responseData.error.message}`;
            alert(error);
            console.log(`${error} - ${responseData.error.data}`);
            throw Error(error);
        }
        return responseData.result;
    }

}


export default new API()