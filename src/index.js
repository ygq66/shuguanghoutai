import React from 'react';
import ReactDOM from 'react-dom';
import './style/index.css';
import 'animate.css'
import App from './App';
import {HashRouter as Router} from "react-router-dom";
import {GlobalStyle} from './style/reset-css.js';
import {Spin, message} from 'antd';
import {ReloadOutlined} from '@ant-design/icons';
import {makeStore} from "./redux/store";
import {StoreContext} from 'redux-react-hook';
import axios from 'axios';
// import DynamicAntdTheme from 'dynamic-antd-theme';
const store = makeStore();
Spin.setDefaultIndicator(<ReloadOutlined style={{fontSize: 30}} spin/>);
window.$message = message;

axios.get("./config.json").then(function (response) {
  global.Url = response.data.Url;//api地址
  ReactDOM.render(
    <StoreContext.Provider value={store}>
      <Router>
        <GlobalStyle/>
        <App/>
      </Router>
    </StoreContext.Provider>,
    document.getElementById('root')
  )
})