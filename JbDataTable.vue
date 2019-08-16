<template>


    <v-data-table
        class="elevation-1"
        :headers="headers"
        :items="datatableItens"
        :search="search"
        :footer-props="footerProps"
        :items-per-page="itemsPerPage"

        :sortBy.sync="sortBy"
        :sort-desc="sortDesc"
        :multi-sort="multiSort"

        ref="jb-datatable"
    >

        <template v-slot:item="{item, select, isSelected, expand, isExpanded, headers, index}">
            <tr>
                <template v-for="(cada, key) in headers" >
                    <td v-if="!cada.onlyheader" class="text-center" :key="key">{{ headerFunction(cada, item[cada.value]) }}</td>
                </template>

                <!-- actions -->
                <td class="justify-center layout px-0">
                    <slot name="actions" :item="item"> </slot>
                </td>
            </tr>
        </template>

        <template slot="no-data" >
            <v-alert color="info" icon="info"> Nenhum item cadastrado. </v-alert>
        </template>

    </v-data-table>


</template>


<script>

export default {
    props:{
        headers:Array,
        items:Array,
        itemsPerPage:{type:Number, default:5},
        footerProps:{type:Array,default(){return{
            showFirstLastPage: true,
            firstIcon: 'mdi-arrow-collapse-left',
            lastIcon: 'mdi-arrow-collapse-right',
            prevIcon: 'mdi-minus',
            nextIcon: 'mdi-plus',
            itemsPerPageOptions: [25, 50, 75, 100, {text:'Todos',value:-1}]
        }}},

        sortBy:{type:Array, default(){return['id']}},
        sortDesc:{type:Array, default(){return[false]}},
        multiSort:Boolean,

        search:String,

    },
    data() { return {
    }},
    computed: {
        datatableItens(){ return this.items },
    },
    created () {
        this.items = typeof this.items=='string' ? JSON.parse(this.items) : this.items
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
        changeSort (column) {
            if (this.sortBy.sortBy === column) {
                this.sortBy.descending = !this.sortBy.descending
            } else {
                this.sortBy.sortBy = column
                this.sortBy.descending = false
            }
        },

    },

}
</script>
