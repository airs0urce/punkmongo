

<template>
    <span class="pagination">
        <span class="pages-list" @mouseenter="toggleGotoPage(true)" @mouseleave="toggleGotoPage(false)">
            <span class="pages no-select">
                <a class="pagination-btn" title="Previous Page" :class="{'disabled': currentPage == 1}"  @click="changePage(currentPage - 1)"><font-awesome-icon class="pagination-arrows" icon="angle-left" /></a>
                <a class="pagination-btn" title="Next Page" :class="{'disabled': currentPage == totalPages}" @click="changePage(currentPage + 1)"><font-awesome-icon class="pagination-arrows" icon="angle-right" /></a>

                <a v-if="!pagesToShow.includes(1)" :class="{'active': currentPage == 1, 'loading': (1 == loadingPage)}" class="pagination-btn" @click="changePage(1)">1</a>
                <span v-if="!pagesToShow.includes(1)" class="pagination-btn dots">…</span>

                <a v-for="n in pagesToShow" 
                    class="pagination-btn" 
                    :class="{'active': currentPage == n, 'loading': (n == loadingPage)}" 
                    @click="changePage(n)">{{n}}</a>
                
                <span v-if="!pagesToShow.includes(totalPages)" class="pagination-btn dots">…</span>
                <a v-if="!pagesToShow.includes(totalPages)" :class="{'active': currentPage == totalPages, 'loading': (totalPages == loadingPage)}"  class="pagination-btn" @click="changePage(totalPages)">{{totalPages}}</a>
            </span>
            
            <transition name="gotopage" v-on:enter="gotoPageAnimStarted">
                <span v-show="showGotoPage" class="goto-container">
                    <span class="separator"></span>        
                    <span class="goto">
                        <input type="number" min="0" :max="totalPages" v-model.number="goPageNumber" placeholder="#" ref="pageNumInput" @keyup.enter="changePage(goPageNumber)" />    
                        <button @click="changePage(goPageNumber)">Go</button>
                    </span>
                </span>
            </transition>
        </span>
        <span class="separator"></span>
        <span class="separator"></span>
        
        <span class="page-size no-select">
            <span><strong>{{numberWithCommas(this.totalRecords)}}</strong> docs</span> 
            <span class="separator"></span>    
            <span class="separator"></span>    
            <span> per page </span>
            <select :value="pageSize" @input="changePageSize">
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="30">30</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="500">500</option>
                <option value="1000">1000</option>
                <option value="2000">2000</option>
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
            loadingPage: Number,
            showPagesAround: {
                type: Number,
                default: 5
            },

        },
        data: function() {
            return {
                goPageNumber: '',
                showGotoPage: false,
            }
        },
        watch: {
            pageSize: function() {
                if (this.currentPage > this.totalPages) {
                    this.changePage(this.totalPages);
                }
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
            },
            numberWithCommas: utils.numberWithCommas,
            toggleGotoPage(bool) {
                if (bool) {
                    this.showGotoPage = true;
                    this.$nextTick(() => {
                        this.$refs.pageNumInput.focus();
                    });
                } else {
                    this.showGotoPage = false;
                }
            },
            gotoPageAnimStarted() {
                console.log('gotoPageAnimStarted');
            }
            
        }
    }

</script>

<style lang="scss" scoped>
    .pagination {
        strong {
            display: inline-block;
        }
    }
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
        &.loading {
            color: #777;
        }
        
        &.disabled {
            color: #bbb;
            cursor: default;
        }
    }

    
    .separator {
        margin-left: 0.5em;
        margin-right: 0.5em;
    }
    .page-size {
        width: 8rem;
        white-space: nowrap;
    }

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

.pages-list {
    white-space: nowrap;
    display: inline-flex;
    .pages {
        background-color: #fff;
    }
}

.goto-container {
    z-index: -1;    
}
.goto {
    display: inline !important;
    overflow: hidden;
    white-space: nowrap;

    input {
        width: 5em;    
    }
    span {
        color: #777;    
    }
}


.gotopage-enter-active {
    transition: all 0.4s ease 0.5s;
}
.gotopage-leave-active {
    transition: all 0.4s ease-out;   
}
.gotopage-enter, .gotopage-leave-to {
    transform: translateX(-100px);
    opacity: 0;
}


</style>









