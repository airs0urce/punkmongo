

<template>
    <span class="pagination no-select">
        <a class="pagination-btn" :class="{'disabled': currentPage == 1}"  @click="changePage(currentPage - 1)"><font-awesome-icon class="pagination-arrows" icon="angle-left" /></a>
        
        <a v-if="!pagesToShow.includes(1)" class="pagination-btn" @click="changePage(1)">1</a>
        <span v-if="!pagesToShow.includes(1)" class="pagination-btn dots">...</span>

        <a v-for="n in pagesToShow" class="pagination-btn" :class="{'active': currentPage == n}" @click="changePage(n)">{{n}}</a>
        
        <span v-if="!pagesToShow.includes(totalPages)" class="pagination-btn dots">...</span>
        <a v-if="!pagesToShow.includes(totalPages)"  class="pagination-btn" @click="changePage(totalPages)">{{totalPages}}</a>

        <a class="pagination-btn" :class="{'disabled': currentPage == totalPages}" @click="changePage(currentPage + 1)"><font-awesome-icon class="pagination-arrows" icon="angle-right" /></a>
        |
        <span class="records-count">({{getShownRecordsString()}})</span>
        |
        <span class="goto">
            Page <input type="number" min="0" :max="totalPages" v-model.number="goPageNumber" />    
            <button @click="changePage(goPageNumber)">Go</button>
        </span>
    </span>
</template>

<script>
    
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
                goPageNumber: ''
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
                if (pageNumber > this.totalPages || pageNumber < 1) {
                    return;
                }
                this.$emit('change-page', pageNumber);
            },
            getShownRecordsString() {
                let shownRecords = this.currentPage * this.pageSize
                if (shownRecords > this.totalRecords) {
                    shownRecords = this.totalRecords;
                }
                return `${shownRecords}/${this.totalRecords}`;
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
        margin-left: 1em;
        input {
            width: 5em;    
        }
    }
    .records-count {
        margin-left: 1em;
        margin-right: 1em;
    }
    
    

</style>









