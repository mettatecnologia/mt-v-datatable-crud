let Vue = window.Vue

if( ! Vue.$_vuetifydialog_installed){
    console.warn(
                    `VuetifyDialog é uma dependência necessária para este componente, siga os seguintes passos:\n
                    => Certifique que o mesmo está instalado com a versão 1.0.0-alpha.2 (provavelmente já está) com o comando: npm list --depth=0 | grep vuetify-dialog
                       -- Se não estiver, instale-o conforme https://www.npmjs.com/package/vuetify-dialog/v/1.0.0-alpha.2 \n
                    => Com o pacote instalado, configure-o conforme https://github.com/yariksav/vuetify-dialog/issues/46 ou https://codesandbox.io/s/vuetify-2-dialog-example-iwdcf
                    => Adicione ao seu arquivo app.js ou main.js a variável %cwindow.Vue.$_vuetifydialog_installed = true
                ` , 'color:blue');
}

Vue.component('jb-datatable', require('./JbDataTable.vue').default);
Vue.component('jb-datatable-crud', require('./JbDataTableCrud.vue').default);
