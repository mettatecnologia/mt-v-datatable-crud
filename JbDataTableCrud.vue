<template>
<div>

    <slot name="toolbar">
        <v-toolbar flat color="white">
            <v-btn v-if="podeCriar" color="primary" dark class="mb-2" @click="novo()">{{toolbarBtnTitulo || tituloNovo || 'Adicionar'}}</v-btn>
            <v-spacer></v-spacer>
            <v-text-field v-model="datatable.search" append-icon="search" label="Search" single-line hide-details ></v-text-field>
        </v-toolbar>
    </slot>


    <v-data-table
        class="elevation-1"
        :items="datatableItens"
        :search="datatableSearch"
        :headers="datatable.headers"
        :disable-initial-sort="datatable.disableInitialSort"
        :rows-per-page-items="datatable.rowsPerPageItems"
        :pagination.sync="datatable.pagination"
    >

        <template v-slot:items="props">

            <template v-for="(cada, key) in datatable.headers" >
                <td v-if="!cada.onlyheader" class="text-xs-center" :key="key">{{ headerFunction(cada, props.item[cada.value]) }}</td>
            </template>

            <!-- actions -->
            <td class="justify-center layout px-0">
                <slot :itens="props" name="actions">
                    <div class="mr-2 mt-3">
                        <slot name="actionsExtra" :datatable_props="props"></slot>

                        <jb-icon color="orange" v-if="podeEditar" small tt-text="Editar" @click="editar(props.item)" > edit </jb-icon>
                        <jb-icon v-if="podeDeletar" color="red" small tt-text="Deletar" @click="deletarConfirm(props.item)" > delete </jb-icon>

                        <jb-icon v-if="podeAtivarInativar" small :tt-text="props.item.ativo ? 'Inativar' : 'Ativar'" @click="ativarInativarConfirm(props.item)" > {{ props.item.ativo ? 'fas fa-level-down-alt' : 'fas fa-level-up-alt'}} </jb-icon>

                    </div>
                </slot>
            </td>

        </template>
        <template slot="no-data" >
            <v-alert :value="true" color="info" icon="info"> Nenhum item cadastrado. </v-alert>
        </template>

    </v-data-table>

    <jb-dialog v-model="dialog.mostrar" @fechar="fecharDialog" :titulo="formTitulo" :fullscreen="dialogFullscreen" :persistent="dialogPersistent" :max-width="dialogMaxWidth || '750px'">

        <jb-loading v-model="loading.mostrar"></jb-loading>

        <jb-form validar v-model="form.valid" ref="form" :mensagens="form.mensagens.mensagens" :mensagens-tipo="form.mensagens.tipo" :mensagens-detalhes="form.mensagens.detalhes" :reset="form.reset" @keyup.native.enter="submitEnter" :reset-validation="form.resetValidation">
            <slot name="form" :datatable_form="form"></slot>

            <v-card-actions slot="botoes">
                <v-spacer></v-spacer>
                <slot name="botao-cancelar">
                    <v-btn color="primary" flat @click="fecharDialog()">Cancelar</v-btn>
                </slot>
                <slot name="botao-salvar">
                    <v-btn color="primary" flat @click="saveConfirm()" :disabled="!form.valid || !formValid">Salvar</v-btn>
                </slot>
            </v-card-actions>
        </jb-form>

    </jb-dialog>

</div>
</template>


<script>

export default {
    beforeCreate () {
    },
    props:{
        podeCriar:{type:Boolean, default:true},
        podeEditar:{type:Boolean, default:true},
        podeAtivarInativar:{type:Boolean, default:true},
        podeDeletar:{type:Boolean, default:false},

        tituloNovo:String,
        tituloEditar:String,

        //form
        action:String, csrf:String,
        formValid:{type:Boolean, default:true},
        formMensagens:{type:Object, default:{mensagens:null, tipo:null, detalhes:null}},

        //---- Toolbar
        toolbarBtnTitulo:String,

        //---- Datatable
        headers:Array,
        items:Array,
        disableInitialSort:Boolean,
        rowsPerPageItems:{type:Array, default:v=>([25,50,100,{"text":"$vuetify.dataIterator.rowsPerPageAll","value":-1}])},
        pagination:Object,
        search:String,

        //---- Dialog
        dialogPersistent:Boolean,
        dialogMaxWidth:String,
        dialogFullscreen:Boolean,
        dialogMostrar:Boolean,

        //actions
        preNovo:{type:Function, default:v=>(v)},
        posNovo:{type:Function, default:v=>(v)},
        preEditar:{type:Function, default:v=>(v)},
        posEditar:{type:Function, default:v=>(v)},
        preAtivarInativar:{type:Function, default:v=>(v)},
        posAtivarInativar:{type:Function, default:v=>(v)},
        preDeletar:{type:Function, default:v=>(v)},
        posDeletar:{type:Function, default:v=>(v)},

        preSalvar:{type:Function, default:v=>(v)},

        //model
        vueapiqueryModel:Object,
        value:Object,
        httpUrl:String,

    },
    data() {
        return {
            modeloDefaultSave:JSON.parse(JSON.stringify(this.value)),
            AxiosModel: this.vueapiqueryModel,

            dialog:{
                mostrar: this.dialogMostrar,
            },
            form: {
                valid: false,
                reset: false,
                resetValidation: false,
                mensagens:{
                    mensagens:null,
                    tipo:null,
                    detalhes:null,
                },
            },
            loading:{
                mostrar:false
            },
            datatable:{
                indexItem: -1,
                headers: this.headers,
                search: null,
                pagination: this.pagination,
                rowsPerPageItems: this.rowsPerPageItems,
                disableInitialSort: this.disableInitialSort,
            },
        }
    },
    computed: {
        formTitulo() { return this.datatable.indexItem === -1 ? this.tituloNovo :  this.tituloEditar },
        datatableSearch(){ return this.search || this.datatable.search },
        datatableItens(){ return this.items },
    },
    created () {
        this.datatable.items = typeof this.items=='string' ? JSON.parse(this.items) : this.items
        this.initialize()
    },
    watch:{
        'dialog.mostrar'(abrindo){
            //seta focus no mozilla firefox e edge
            if(abrindo){ this.$setFocus('form') }
        },
        formMensagens:{
            handler(v){
                this.form.mensagens = this.$criarObjetoMensagensForm(this.formMensagens.mensagens, this.formMensagens.tipo, this.formMensagens.detalhes);
            },
            deep:true
        }
    },
    methods: {
        headerFunction(header, value){
            if(header.metodo){
                value = header.metodo(value)
            }
            if(header.format || header.formato){
                let formato = header.format || header.formato
                switch (formato) {
                    case 'datetime':
                    case 'date':
                        if(value){ value = this.$passaDatetimeParaPtbr(value) }
                        break;
                    case 'credit-card':
                    case 'cartao-credito':
                        if(value){ value = this.$formataNumeroParaCartaoCredito(value) }
                        break;
                    case 'currency':
                    case 'moeda':
                        if(value){ value = this.$formataNumeroParaMoeda(value) }
                        break;
                }

            }
            return value
        },
        initialize(){
            if(Object.keys(this._events).indexOf('dialog-inicializar') > -1){
                this.$emit('dialog-inicializar', this);
            }
            else {
                this.form.mensagens = this.$criarObjetoMensagensForm(this.formMensagens.mensagens, this.formMensagens.tipo, this.formMensagens.detalhes);
                this.form.reset = true
                this.form.resetValidation = true

                this.value = Object.assign(this.value, this.modeloDefaultSave)

                this.datatable.indexItem = -1
            }

        },
        abrirDialog(){
            this.dialog.mostrar=true
        },
        fecharDialog() {
            this.dialog.mostrar = false
            this.initialize()
        },

        // ==== Operacoes do Datatable
        changeSort (column) {
            if (this.datatable.pagination.sortBy === column) {
                this.datatable.pagination.descending = !this.datatable.pagination.descending
            } else {
                this.datatable.pagination.sortBy = column
                this.datatable.pagination.descending = false
            }
        },

        // ==== Operações das Actions do Datatable
        novo(){
            this.form.reset = true
            this.preNovo()
            this.abrirDialog()
        },
        editar (item) {
            item = this.preEditar(item)

            this.datatable.indexItem = this.datatable.items.indexOf(item)
            this.value = Object.assign(this.value, item)

            this.form.reset = false
            this.abrirDialog()
        },
        submitEnter(){
            if(this.form.valid && this.formValid){
                this.saveConfirm()
            }
        },
        ativarInativarConfirm (item) {
            this.$dialog.confirm({
                title: 'Alerta!',
                text: 'Tem certeza que deseja inativar?',
                actions: {
                    false: 'Não',
                    true: {
                        color: 'red',
                        text: 'Sim',
                        handle: () => {
                            return new Promise(resolve => {
                                this.ativarInativar(item)
                                setTimeout(resolve, 300)
                            })
                        }
                    }
                }
            })
        },
        deletarConfirm (item) {
            this.$dialog.confirm({
                title: 'Alerta!',
                text: 'Tem certeza que deseja excluir este item?',
                actions: {
                    false: 'Não',
                    true: {
                        color: 'red',
                        text: 'Sim',
                        handle: () => {
                            return new Promise(resolve => {
                                this.deletar(item)
                                setTimeout(resolve, 300)
                            })
                        }
                    }
                }
            })
        },
        saveConfirm () {

            this.form.valid = false

            let item = this.value

            this.$dialog.confirm({
                title: 'Alerta!',
                text: 'Tem certeza que quer salvar?',
                actions: {
                    false: {
                        color: 'blue',
                        text: 'Não',
                        handle: () => {
                            this.form.valid = true
                        }
                    },
                    true: {
                        color: 'red',
                        text: 'Sim',
                        handle: () => {
                            return new Promise(resolve => {
                                this.save(item)
                                setTimeout(resolve, 300)
                            })
                        }
                    }
                }
            })
        },

        // ==== Operações HTTP
        ativarInativar(item){

            item = this.preAtivarInativar(item)
            item.ativo = item.ativo ? 0 : 1

            this.AxiosModel
                .preparaRequest({url:this.httpUrl})
                .preparaItem(item)
                .createAndSave()
                .then(v => {
                    this.loading.mostrar = false
                    let response = v.__response

                    if(response.erro){
                        this.form.mensagens = this.$criarObjetoMensagensForm(response.mensagens[0], response.mensagens_tipo, response.exception);
                    }
                    else {
                        let indexItem = this.datatable.items.indexOf(item)

                        Object.assign(this.datatable.items[indexItem], response.dados)
                        this.$dialog.message.success(response.mensagens.join('-'), {timeout: 5000});
                    }
            });
        },
        deletar(item){

            item = this.preDeletar(item)

            const index = this.datatable.items.indexOf(item)

            this.AxiosModel
                .preparaRequest({url:this.httpUrl})
                .createAndDelete(item)
                .then(v => {
                    let response = v.data.__response
                    if(response.erro){
                        //deu erro
                        this.$dialog.message.error(response.mensagens.join('-'), {timeout: 5000})
                    }
                    else {
                        //deu certo
                        this.$dialog.message.success(response.mensagens.join('-'), {timeout: 3000})
                        this.datatable.items.splice(index, 1)

                    }
            });
        },
        save (item) {

            this.loading.mostrar = true

            item = this.preSalvar(item)

            let indexItem = this.datatable.indexItem

            this.AxiosModel
                .preparaRequest({url:this.httpUrl})
                .preparaItem(item)
                .createAndSave()
                .then(v => {

                    this.loading.mostrar = false
                    let response = v.__response

                    if(response.erro){
                        this.form.mensagens = this.$criarObjetoMensagensForm(response.mensagens[0], response.mensagens_tipo, response.exception);
                    }
                    else {
                        if (indexItem > -1) {
                            Object.assign(this.datatable.items[indexItem], response.dados)
                        } else {
                            this.datatable.items.push(response.dados)
                        }
                        this.$dialog.message.success(response.mensagens.join('-'), {timeout: 5000});

                        this.fecharDialog()

                        this.posNovo(response, item)
                        this.posEditar(response, item)

                    }
            });

            this.form.valid = true
        },
    },

}
</script>
