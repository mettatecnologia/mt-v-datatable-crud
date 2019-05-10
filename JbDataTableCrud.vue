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
                <td v-if="!cada.onlyheader" class="text-xs-center" :key="key">{{ props.item[cada.value] }}</td>
            </template>

            <!-- actions -->
            <td class="justify-center layout px-0">
                <slot name="actions">
                    <div class="mr-2 mt-3">
                        <jb-icone v-if="podeEditar" small tt-text="Editar" @click="editar(props.item)" > edit </jb-icone>
                        <jb-icone v-if="podeDeletar" small tt-text="Deletar" @click="deletarConfirm(props.item)" > delete </jb-icone>

                        <jb-icone v-if="podeAtivarInativar" small :tt-text="props.item.ativo!='N' ? 'Inativar' : 'Ativar'" @click="ativarInativarConfirm(props.item)" > {{ props.item.ativo!='N' ? 'fas fa-level-down-alt' : 'fas fa-level-up-alt'}} </jb-icone>

                    </div>
                </slot>
            </td>

        </template>
        <template slot="no-data" >
            <v-alert :value="true" color="info" icon="info"> Nenhum item cadastrado. </v-alert>
        </template>

    </v-data-table>
 
    <jb-dialog v-model="dialog.mostrar" @fechar="fecharDialog" :titulo="formTitulo" :fullscreen="dialogFullscreen" :persistent="dialogPersistent" :max-width="dialogMaxWidth || '750px'">

        <jb-loading v-model="dialog.loading.mostrar"></jb-loading>

        <jb-formulario @keyup.native.enter="submitEnter" v-model="dialog.form.valid" ref="form" validar :mensagens="dialog.form.mensagens_data" :mensagens-tipo="dialog.form.mensagensTipo_data" :mensagens-detalhes="dialog.form.mensagens_detalhes" :reset="dialog.form.reset" cancelar-submit>
            <slot name="form"></slot>

            <v-card-actions slot="botoes">
                <v-spacer></v-spacer>
                <v-btn color="primary" flat @click="fecharDialog()">Cancelar</v-btn>
                <v-btn color="primary" flat @click="saveConfirm()" :disabled="!dialog.form.valid || !valid">Salvar</v-btn>
            </v-card-actions>
        </jb-formulario>

    </jb-dialog>

    <slot name="conteudo-extra"></slot>
</div>
</template>


<script>

export default {
    props:{
        podeCriar:{type:Boolean, default:true},
        podeEditar:{type:Boolean, default:true},
        podeDeletar:{type:Boolean, default:false},
        podeAtivarInativar:{type:Boolean, default:true},

        tituloNovo:String,
        tituloEditar:String,

        //form
        action:String, csrf:String,
        mensagens:String, mensagensTipo:String,
        valid:{type:Boolean, default:true},

        //---- Toolbar
        toolbarBtnTitulo:String,

        //---- Datatable
        headers:Array,
        items:Array,
        disableInitialSort:Boolean,
        rowsPerPageItems:Array,
        pagination:Object,
        search:String,
        
        //---- Dialog
        model:Object,
        modelFields:Object,
        dialogPersistent:Boolean,
        dialogMaxWidth:String,
        dialogFullscreen:Boolean,

        //actions
        preNovo:{type:Function, default:v=>(v)},
        posNovo:{type:Function, default:v=>(v)},
        preEditar:{type:Function, default:v=>(v)},
        posEditar:{type:Function, default:v=>(v)},
        preAtivarInativar:{type:Function, default:v=>(v)},
        posAtivarInativar:{type:Function, default:v=>(v)},
        preDeletar:{type:Function, default:v=>(v)},
        posDeletar:{type:Function, default:v=>(v)},

        //model
        preSalvar:{type:Function, default:v=>(v)},

        httpUrl:String,
        
    },
    data() {
        return {
            modeloDefaultSave:JSON.parse(JSON.stringify(this.modelFields)),
            Model: this.model,
            
            dialog:{
                mostrar: false,
                form: {
                    valid: false,
                    reset: false,
                    mensagens_data: this.mensagens,
                    mensagensTipo_data: this.mensagensTipo,
                    mensagens_detalhes:null,
                },
                loading:{
                    mostrar:false
                }
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
    methods: {
        initialize(){
            this.dialog.form.mensagens_data = null
            this.dialog.form.reset = true
            
            this.modelFields = Object.assign(this.modelFields, this.modeloDefaultSave)
            
            this.datatable.indexItem = -1
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
            this.dialog.form.reset = true
            this.preNovo()
            this.abrirDialog()
        },
        editar (item) {
            item = this.preEditar(item)

            this.datatable.indexItem = this.datatable.items.indexOf(item)
            this.modelFields = Object.assign(this.modelFields, item)
            
            this.dialog.form.reset = false
            this.abrirDialog()
        },
        submitEnter(){
            if(this.dialog.form.valid && this.valid){
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
            
            this.valid = false

            let item = this.modelFields

            this.$dialog.confirm({
                title: 'Alerta!',
                text: 'Tem certeza que quer salvar?',
                actions: {
                    false: {
                        color: 'blue',
                        text: 'Não',
                        handle: () => {
                            this.valid = true
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

            item.ativobool = item.ativo=='N' //inverte os ativo

            this.Model
                .preparaRequest({url:this.httpUrl})
                .preparaItem(item)
                .createAndSave()
                .then(v => {
                    this.dialog.loading.mostrar = false
                    let response = v.__response

                    if(response.erro){
                        this.dialog.form.mensagensTipo_data = response.mensagens_tipo
                        this.dialog.form.mensagens_data = response.mensagens
                        this.dialog.form.mensagens_detalhes = response.exception 
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

            this.Model
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

            this.dialog.loading.mostrar = true

            item = this.preSalvar(item)

            let indexItem = this.datatable.indexItem 

            this.Model
                .preparaRequest({url:this.httpUrl})
                .preparaItem(item)
                .createAndSave()
                .then(v => {
                    
                    this.dialog.loading.mostrar = false
                    let response = v.__response
                    
                    if(response.erro){
                        this.dialog.form.mensagensTipo_data = response.mensagens_tipo
                        this.dialog.form.mensagens_data = response.mensagens
                        this.dialog.form.mensagens_detalhes = response.exception 
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

                        // delete this.Model.__response;
                        
                    }
            });

            this.valid = true
        },
    },
    watch:{
        mensagens(v){ this.dialog.form.mensagens_data = v },
        mensagensTipo(v){ this.dialog.form.mensagensTipo_data = v },
        'dialog.mostrar'(abrindo){
            if(abrindo){
                //seta focus no mozilla firefox e edge
                let campo = 'form'
                const element = this.$refs[campo].$el.querySelector('input')
                if (element) this.$nextTick(() => { element.focus() })
            }
            
        },
    },
    mounted(){   
    },
}
</script>
