export default function reducer(state, action) {
    switch(action.type) {
        case "isLogin":{
            return{...state,isLogin:action.isLogin}
        }
        case "check_top": {
            return { ...state,title_top_check: action.title_top_check }
        }
        case "check_left": {
            return { ...state,title_left_check: action.title_left_check }
        }
        case "userData": {
            return { ...state,userData: action.userData }
        }
        case "model_list":{
            return { ...state,model_list: action.model_list}
        }
        case "buildLabel_list":{
            return {...state,buildLabel_list:action.buildLabel_list}
        }
        case "textLabel_list":{
            return{...state,textLabel_list:action.textLabel_list}
        }
        default:
            return state
    }
}