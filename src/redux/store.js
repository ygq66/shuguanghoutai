import { createStore } from 'redux';
import reducer from './reducers';

export function makeStore() {
    return createStore(reducer, {
        isLogin:false,
        title_top_check:null,
        title_left_check:-1,
        userData:{},
        model_list:{},
        buildLabel_list:{},
        textLabel_list:{}
    })
}