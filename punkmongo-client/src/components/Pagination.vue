

<template>
    <span class="pagination no-select">
        <a class="pagination-btn" :class="{'disabled': currentPage == 1}"  @click="changePage(currentPage - 1)"><font-awesome-icon class="pagination-arrows" icon="angle-left" /></a>
        <a class="pagination-btn" :class="{'disabled': currentPage == totalPages}" @click="changePage(currentPage + 1)"><font-awesome-icon class="pagination-arrows" icon="angle-right" /></a>

        <a v-if="!pagesToShow.includes(1)" class="pagination-btn" @click="changePage(1)">1</a>
        <span v-if="!pagesToShow.includes(1)" class="pagination-btn dots">…</span>

        <a v-for="n in pagesToShow" class="pagination-btn" :class="{'active': currentPage == n}" @click="changePage(n)">{{n}}</a>
        
        <span v-if="!pagesToShow.includes(totalPages)" class="pagination-btn dots">…</span>
        <a v-if="!pagesToShow.includes(totalPages)"  class="pagination-btn" @click="changePage(totalPages)">{{totalPages}}</a>
        <span class="separator"></span>        
        
        <div class="edit-wrapper" @click="togleGotoPage()">
            <font-awesome-icon class="edit-page" icon="pen" />    
        </div>
        
        <span class="separator"></span>
        <span class="goto" v-show="showGotoPage">
            <input type="number" min="0" :max="totalPages" v-model.number="goPageNumber" placeholder="#" ref="pageNumInput" @keyup.enter="changePage(goPageNumber)" />    
            <button @click="changePage(goPageNumber)">Go</button>
        </span>
        <span class="separator"></span>
        <span class="separator"></span>
        <span class="page-size">
            <span>total {{numberWithCommas(this.totalRecords)}} docs by </span> 
            <select :value="pageSize" @input="changePageSize">
                <option value="10">10</option>
                <option value="30">30</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="500">500</option>
                <option value="1000">1000</option>
                <option value="2000">2000</option>
                <option value="3000">3000</option>
                <option value="5000">5000</option>
            </select>
        </span>

    </span>
</template>

<script>
    import utils from '@/utils'
    
    export default {
        props: {
            totalRecords: Number,
            pageSize: Number,
            currentPage: Number,
            // loadingPage: [Number, Boolean],
            showPagesAround: {
                type: Number,
                default: 5
            },
        },
        data: function() {
            return {
                goPageNumber: '',
                showGotoPage: false
            }
        },
        computed: {

            pagesToShow() {
                const pagesToShow = [];
                const totalPages = this.totalPages;                

                let fromPage = Math.ceil(this.currentPage - this.showPagesAround/2);
                if (fromPage < 1) {
                    fromPage = 1;
                }
                
                const alreadyUsed = this.currentPage - fromPage;

                let toPage = (this.currentPage + (this.showPagesAround - alreadyUsed));
                if (toPage > this.totalPages) {
                    toPage = this.totalPages;
                }

                
                for (let i = fromPage; i <= toPage; i++) {
                    pagesToShow.push(i);
                }

                return pagesToShow;
            },
            totalPages() {
                return Math.ceil(this.totalRecords/this.pageSize);
            }
        },
        methods: {
            changePage(pageNumber) { 
                if (pageNumber < 1) {
                    return;
                }
                if (pageNumber > this.totalPages) {
                    pageNumber = this.totalPages;
                }
                this.$emit('change-page', pageNumber);
                this.showGotoPage = false;
                this.goPageNumber = '';
            },
            changePageSize(event) {
                let pageSize = +event.target.value;
                this.$emit('change-page-size', pageSize);
                this.changePage(1);
                
            },
            numberWithCommas: utils.numberWithCommas,
            togleGotoPage() {
                this.showGotoPage = !this.showGotoPage;
                if (this.showGotoPage) {
                    this.$nextTick(() => {
                        this.$refs.pageNumInput.focus();
                    });
                }
            }
            
        }
    }

</script>

<style lang="scss" scoped>
    .pagination-btn {
        display: inline-block;
        min-width: 2em;
        line-height: 1.5;
        text-align: center;
        cursor: pointer;
        color: #000;
        padding: 0.453em 0.5em;

        &.dots {
            cursor: default;
            text-decoration: none !important;
            padding-left: 0;
            padding-right: 0;
            min-width: 0;
        }
        &:hover {
            // background-color: #eeefff;
            color: #333;
        }
        &.active {
            background-color: #eeefff;
        }
        
        &.disabled {
            color: #bbb;
            cursor: default;
        }
    }

    .goto {
        position: relative;
        input {
            width: 5em;    
        }
    }
    .separator {
        margin-left: 1em;
    }
    .page-size {
        position: relative;
        width: 8rem;
    }

    .goto span,
    .page-size span {
        // position: absolute;
        // top: -1.7em;
        
    }
    .goto span,
    .page-size span {
        color: #777;
    }
    .edit-wrapper {
        display: inline-block;
        padding: 0.453em 0.5em;
        cursor: pointer;
        &:hover {
            .edit-page {
                color: #666;
            }
        }
    }
    .edit-page {
        color: #888;
    }    

</style>









