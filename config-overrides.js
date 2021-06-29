const { override, adjustStyleLoaders,fixBabelImports,addLessLoader } = require("customize-cra");

module.exports = override(
    //全局引入公共scss
    adjustStyleLoaders(rule => {
        if (rule.test.toString().includes('scss')) {
            rule.use.push({
                loader: require.resolve('sass-resources-loader'),
                options: {
                    resources: [
                        './src/style/indexScss.scss'
                    ]
                }
            });
        }
    }),
    //按需加载ant_design样式
    fixBabelImports('import', {
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: true
    }), 
    //ant_design主题样式更改
    addLessLoader({
        javascriptEnabled: true,
        modifyVars: { "@primary-color":"#f9ab2c"}
    })
);

/* 重启服务后生效 */