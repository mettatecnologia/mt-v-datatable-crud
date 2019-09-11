<!-- V-SLOTS DISPONÍVEIS EM 09/09/2019

    <template v-slot:body="{ items, pagination, options, groupedItems, updateOptions, sort, group, headers, isMobile }" ></template>
    <template v-slot:body.append="{ items, pagination, options, groupedItems, updateOptions, sort, group, headers, isMobile }" ></template>
    <template v-slot:body.prepend="{ items, pagination, options, groupedItems, updateOptions, sort, group }" ></template>

    <template v-slot:footer="{ items, pagination, options, groupedItems, updateOptions, sort, group, headers, isMobile }" ></template>
    <template v-slot:footer.page-text="{ pageStart, pageStop, itemsLength }" ></template>

    <template v-slot:group="{ items, pagination, options, groupedItems, updateOptions, sort, group }" ></template>
    <template v-slot:group.header="{ items, pagination, options, groupedItems, updateOptions, sort, group }" ></template>
    <template v-slot:group.summary="{ items, pagination, options, groupedItems, updateOptions, sort, group }" ></template>

    <template v-slot:header="{ props, on }" ></template>
    <template v-slot:header.name="{ header }" ></template>
    <template v-slot:header.data-table-select="{ props, on }" ></template>

    <template v-slot:item="{ item, select, isSelected, expand, isExpanded, headers, index }" ></template>
    <template v-slot:item.<name>="{ item, header, value }" ></template>
    <template v-slot:item.data-table-expand="{ item, select, isSelected, expand, isExpanded, headers }" ></template>
    <template v-slot:item.data-table-select="{ item, select, isSelected, expand, isExpanded, headers }" ></template>

    <template v-slot:expanded-item="{ item, headers }" ></template>

    <template v-slot:loading ></template>
    <template v-slot:no-data ></template>
    <template v-slot:no-results ></template>
    <template v-slot:progress="{ items, pagination, options, groupedItems, updateOptions, sort, group }" ></template>
    <template v-slot:top="{ items, pagination, options, groupedItems, updateOptions, sort, group }" ></template>

-->
<template>


    <v-data-table class="elevation-1" :ref="vuetify_ref" >
        <!-- O V-SLOT ABAIXO ATIVA TODOS OS V-SLOTS PARA MESCLAGEM NO METODO 'mesclarComponentesHeranca' -->
        <template v-slot:body.append="{ items, pagination, options, groupedItems, updateOptions, sort, group, headers, isMobile }" > </template>

    </v-data-table>


</template>


<script>

export default {

    extends: window.Vue._VDataTable,
    computed:{
        vuetify_ref(){
            return this.ref || 'v-data-table'
        }
    },
    created(){
        this.alterarItemsPeloHeader()
    },
    mounted(){
        this.mesclarComponentesHeranca();
    },
    methods: {
        aplicarHeaderMetodo(metodo, value){
            return value = metodo(value)
        },
        aplicarHeaderFormato(formato, value){
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
            return value
        },
        aplicarHeaderAlteracoes(header, value){
            let metodo = header.metodo || header.method
            let formato = header.format || header.formato
            if(metodo){
                value = this.aplicarHeaderMetodo(metodo, value)
            }
            if(formato){
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
        alterarItemsPeloHeader(){
            for (const key_header in this.headers) {
                const header = this.headers[key_header];
                if(header.method || header.metodo || header.format || header.formato){
                    for (const key_item in this.items) {
                        const item = this.items[key_item];
                        item[header.value] = this.aplicarHeaderAlteracoes(header, item.nome)
                    }

                }

            }
        },
        mesclarComponentesHeranca(){
            let vuetify_comp = this.$refs[this.vuetify_ref]

            Object.assign(vuetify_comp._props, this._props)
            Object.assign(vuetify_comp.$scopedSlots, this.$scopedSlots)
            Object.assign(vuetify_comp.$slots, this.$slots)
        },


    },

}
</script>
