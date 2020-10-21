

<template>
    <span class="pagination" @mouseleave="toggleGotoPage(false)">
        <span class="pages-list">
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
            
            <span class="goto-container" ref="gotoContainer" @mouseenter="toggleGotoPage(true)" >
                <span class="separator"></span>        
                <span class="goto">
                    <input type="number" 
                        min="0" 
                        :max="totalPages" 
                        v-model.number="goPageNumber" 
                        placeholder="page #" 
                        ref="pageNumInput" 
                        @keyup.enter="changePage(goPageNumber)" 
                    />    
                    <button @click="changePage(goPageNumber)" class="go-button">Go</button>
                </span>
                <font-awesome-icon  class="btn-show-go-pagenumber" icon="caret-right" />
            </span>
        </span>
        <span class="separator"></span>
        <span class="separator"></span>
        <span class="page-size no-select" ref="pageSizeEl">
            <span><strong>{{numberWithCommas(this.totalRecords)}}</strong> docs</span> 
            <span class="separator"></span>    
            <span class="separator"></span>    
            
            <select :value="pageSize" @input="changePageSize">
                <option value="10">10/page</option>
                <option value="20">20/page</option>
                <option value="30">30/page</option>
                <option value="50">50/page</option>
                <option value="100">100/page</option>
                <option value="500">500/page</option>
                <option value="1000">1000/page</option>
                <option value="2000">2000/page</option>
                <option value="5000">5000/page</option>
            </select> 
        </span>

    </span>
</template>

<script>
    import utils from '@/utils'
    import { gsap } from "gsap"
    
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
        mounted: async function() {
            
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
                this.goPageNumber = '';
            },
            changePageSize(event) {
                let pageSize = +event.target.value;
                this.$emit('change-page-size', pageSize);
            },
            numberWithCommas: utils.numberWithCommas,
            toggleGotoPage(bool) {

                if (!this.timelineGoto) {
                    this.timelineGoto = gsap.timeline({
                        paused: true,
                        onComplete: () => {
                            gsap.set(this.$refs.pageNumInput, {cursor: 'text'});
                        },
                        onStart: () => {
                            gsap.set(this.$refs.pageNumInput, {cursor: 'default'});
                        }
                    });
                    this.timelineGoto.to(
                        this.$refs.gotoContainer, 
                        {x: 0, opacity: 1, duration: 0.6},
                    );
                    this.timelineGoto.to(
                        this.$refs.pageSizeEl, 
                        {x: 0, duration: 0.4},
                        '<'
                    );
                }
                
                if (bool) {
                    this.timelineGoto.play();
                    this.$nextTick(() => {
                        this.$refs.pageNumInput.focus();
                    });
                } else {
                    gsap.set(this.$refs.pageNumInput, {cursor: 'default'});
                    this.timelineGoto.reverse();
                }
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
        transform: translateX(-120px);
        width: 8rem;
        white-space: nowrap;
        display: inline-block;
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
        z-index: 2;
    }
}

.goto {
    display: inline !important;
    overflow: hidden;
    white-space: nowrap;

    input {
        width: 5em;    
        cursor: default;
    }
    span {
        color: #777;    
    }
}


.goto-container {
    transform: translateX(-133px);
    opacity: 1;
}

.btn-show-go-pagenumber {
    margin-left: 1rem;
    color: #777;
    vertical-align: -0.2em;
}

.go-button {
    border-left: 0;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
}
</style>









