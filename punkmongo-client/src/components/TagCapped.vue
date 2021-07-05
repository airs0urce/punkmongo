<template>
    <div class="info-tag info-tag-capped no-select" 
        :class="{'disabled': !collectionOptions.capped, 'info': collectionOptions.capped, 'info-tag-capped-fixed-width': fixedWidth}"
        @mouseenter="showDetails(true)" 
        @mouseleave="showDetails(false)"
        >
        
        <span v-show="!collectionOptions.capped">not capped</span>
        <span v-show="collectionOptions.capped">
            capped <font-awesome-icon v-if="!showInfoInline" icon="question-circle" class="question-icon" />
            <span v-if="showInfoInline">
                <span v-if="collOptionExists('max') && collOptionExists('size')">(<strong>{{collectionOptions.max}}</strong> documents or <strong>{{bytesFormatted(collectionOptions.size, 'MB', 0, false)}})</strong></span>
                <span v-if="collOptionExists('max') && !collOptionExists('size')">(<strong>{{collectionOptions.max}}</strong> documents)</span>
                <span v-if="!collOptionExists('max') && collOptionExists('size')">(<strong>{{bytesFormatted(collectionOptions.size, 'MB', 0, false)}}</strong>)</span>
            </span>
            <div class="info-tag-details info-tag-details-capped with-select" ref="infoTagDetails" :class="{'info-on-left': detailsOnLeft}">
                <div class="tag-details-title">
                    Capped collection <a href="https://docs.mongodb.com/manual/core/capped-collections" target="_blank">
                        <font-awesome-icon icon="question-circle" class="icon-help" /> 
                    </a>
                </div>
                <table class="capped-info-table">
                    <tr>
                        <td>
                            <span v-if="collOptionExists('max') && collOptionExists('size')"><strong>{{collectionOptions.max}}</strong> documents or <strong>{{bytesFormatted(collectionOptions.size, 'MB', 0, false)}}</strong> maximum</span>
                            <span v-if="collOptionExists('max') && !collOptionExists('size')"><strong>{{collectionOptions.max}}</strong> documents maximum and no restriction for collection size</span>
                            <span v-if="!collOptionExists('max') && collOptionExists('size')"><strong>{{bytesFormatted(collectionOptions.size, 'MB', 0, false)}}</strong> maximum and no restriction for amount of documents</span>                    
                        </td>
                    </tr>
                </table>
            </div>
        </span>        
    </div>  

    
</template>

<script>
import utils from '../utils'
import { gsap } from 'gsap'

export default {
    data: function() {
        return {
            cappedAnim: null,
            detailsHideTimeout: 0,
        }
    },
    props: {
        collectionOptions: Object,
        showInfoInline: {
            type: Boolean,
            default: true
        },
        hideDetailsAnimation: {
            type: Boolean,
            default: true 
        },
        fixedWidth: {
            type: Boolean,
            default: false  
        },
        detailsOnLeft: {
            type: Boolean,
            default: false    
        }
    },
    methods: {
        bytesFormatted: utils.bytesFormatted, 
        collOptionExists(key) {
            return (typeof this.collectionOptions[key] != 'undefined' && this.collectionOptions[key] != 0);
        },     
        showDetails(bool) {
            if (bool) {
                clearTimeout(this.detailsHideTimeout);
                if (this.cappedAnim) {
                    this.cappedAnim.play();
                    return;
                }
                
                this.cappedAnim = gsap.fromTo(this.$refs.infoTagDetails, 
                    {
                        y: 5, 
                        opacity: 0,
                    }, 
                    {
                        display: 'block',
                        y: 0, 
                        opacity: 1, 
                        duration: 0.25,
                        onReverseComplete: () => {
                            gsap.set(this.$refs.infoTagDetails, {display: 'none'});
                        }
                    }
                )
            } else {
                this.detailsHideTimeout = setTimeout(() => {
                    this.cappedAnim.reverse();
                    if (! this.hideDetailsAnimation) {
                        this.cappedAnim.progress(0);
                    }
                }, this.hideDetailsDelay);
            }
        } 
    },
    mounted() {
                 
    },
    destroyed() {
        if (this.cappedAnim) {
            this.cappedAnim.kill()
        }
    },
}

</script>

<style lang="scss">
    @import '@/scss/tags.scss';

    .info-tag-capped-fixed-width {
        width: 6rem;
        text-align: center;
    }
    .capped-info-table {
        width: 100%;
        white-space: nowrap;
    }
    .info-tag-details-capped {
        transform: translate(1.3em, 0px);
    }
</style>