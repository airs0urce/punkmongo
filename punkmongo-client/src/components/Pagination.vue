

<template>
    <div class="pagination">
        <a class="pagination-btn control" @click="changePage(1)"><font-awesome-icon class="pagination-arrows" icon="angle-double-left" /></a>
        <a class="pagination-btn control" @click="changePage(currentPage - 1)"><font-awesome-icon class="pagination-arrows" icon="angle-left" /></a>

        <a v-for="n in getPagesToShow()" class="pagination-btn" :class="{'active': currentPage == n}" @click="changePage(n)">{{n}}</a>

        <a class="pagination-btn control" @click="changePage(currentPage + 1)"><font-awesome-icon class="pagination-arrows" icon="angle-right" /></a>
        <a class="pagination-btn control" @click="changePage(totalPages)"><font-awesome-icon class="pagination-arrows" icon="angle-double-right" /></a>
    </div>
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
                
            }
        },
        methods: {
            changePage(pageNumber) { 
                this.$emit('change-page', pageNumber);
            },
            getTotalPages() {
                return Math.ceil(this.totalRecords/this.pageSize);
            },
            getPagesToShow() {
                const pagesToShow = [];
                const totalPages = this.getTotalPages();                

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
            }
            

        }
    }

</script>

<style lang="scss" scoped>
    a.pagination-btn {
        display: inline-block;
        min-width: 2em;
        line-height: 1.5;
        text-align: center;
        cursor: pointer;
        color: #000;
        margin: 0 0.1em;
        padding: 0.3em;

        &:hover {
            background-color: #f7fafc;
        }
        &.active {
            background-color: #38b2ac;
        }
        &.control {
            background-color: #edf2f7;
        }
    }
    

</style>









