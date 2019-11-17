import axios from 'axios'
import config from '../../../config'
import uuidv4 from 'uuid/v4'

class API {
  constructor() {
    this.endpoint = `${config.client.protocol}${config.client.host}:${config.client.port}`;
  }

  // you can send JSON RPC 2.0 notification if you pass undefined in "id" parameter
  async request(method, params = {}, id = 'auto') {
    if ('auto' === id) {
      id = uuidv4();
    }
    let response;

    response = await axios.post(this.endpoint, {
      jsonrpc: '2.0',
      method: method,
      params: params,
      id: id
    });
    const responseData = response.data;
    if (responseData.error) {
      throw Error(`[${responseData.error.code}] - ${responseData.error.message}`);
    }
    return responseData.result;
  }

}


export default new API()