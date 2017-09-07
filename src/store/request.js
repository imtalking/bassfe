import axios from 'axios';
import {isJWTokenExpire} from "./util";
import {store} from "./index"

// 创建axios实例

const httpClient = axios.create({
    timeout: 30000, // 请求超时时间,
    // request payload
    headers: {
        'Content-Type': 'application/json;charset=UTF-8'
    },
    baseURL: "/api/"
    // 修改请求数据,去除data.q中为空的数据项,只针对post请求
});

httpClient.interceptors.request.use(config => {
    //过滤 登陆请求
    if (config.url.includes('login') || config.url.includes('register') || config.url.includes('captcha') || config.url.includes('meta')) {
        return config
    }
    const errp = {response: {status: 412}};
    if (isJWTokenExpire()) {
        return Promise.reject(errp)
    }
    let token = localStorage.getItem('token');
    if (!token) {
        return Promise.reject(errp)
    }
    config.headers['Authorization'] = 'Bearer ' + token; // 让每个请求携带自定义token 请根据实际情况自行修改
    return config;
}, error => {

    // 对请求错误做些什么
    // let loading = Loading.httpClient({target:'#felix'});
    // loading.close();    //关闭加载前，记得重新定义实例
    return Promise.reject(error);
});

// http response 拦截器
httpClient.interceptors.response.use(response => {
        console.log(response)
        let res = response.data;
        if (res.code === 200 && res.data != null) {
            return res.data
        }
        return false;
    },
    error => {
        //console.log(error)

        // eslint-disable-next-line no-console
        store.commit('setError', error)

        //return Promise.reject(error)

    });

export default httpClient