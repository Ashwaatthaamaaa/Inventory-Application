const axios = require('axios');

const baseURL = process.env.baseURL;
const key  = process.env.api_key;


if(!baseURL || !key){
    console.error('api not configured',err);
    throw new Error("API configuration is missing.");

}

const apiClient = axios.create({

    baseURL: baseURL,
    params:{
        'access-key' : key
    }

});



