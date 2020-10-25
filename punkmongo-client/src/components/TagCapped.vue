<template>
    <div class="info-tag no-select" 
        :class="{'disabled': !collectionOptions.capped, 'info': collectionOptions.capped, 'info-tag-capped-fixed-width': fixedWidth}">
        <span v-if="!collectionOptions.capped">not capped</span>
        <span v-if="collectionOptions.capped">
            capped <font-awesome-icon v-if="!showInfoInline" icon="question-circle" class="question-icon" />
            <span v-if="showInfoInline">
                <span v-if="collOptionExists('max') && collOptionExists('size')">(<strong>{{collectionOptions.max}}</strong> documents or <strong>{{bytesFormatted(collectionOptions.size, 'MB', 0, false)}})</strong></span>
                <span v-if="collOptionExists('max') && !collOptionExists('size')">(<strong>{{collectionOptions.max}}</strong> documents)</span>
                <span v-if="!collOptionExists('max') && collOptionExists('size')">(<strong>{{bytesFormatted(collectionOptions.size, 'MB', 0, false)}}</strong>)</span>
            </span>
        </span>        
    </div>  

    
</template>

<script>
import utils from '../utils'

export default {
    props: {
        collectionOptions: Object,
        showInfoInline: {
            type: Boolean,
            default: true
        },
        fixedWidth: {
            type: Boolean,
            default: false  
        }
    },
    methods: {
        bytesFormatted: utils.bytesFormatted, 
        collOptionExists(key) {
            return (typeof this.collectionOptions[key] != 'undefined' && this.collectionOptions[key] != 0);
        },      
    },
    mounted() {
        console.log('showInfoInline:',this.showInfoInline);
    },
}

</script>

<style lang="scss">
    @import '@/scss/tags.scss';

    .info-tag-capped-fixed-width {
        width: 6rem;
        text-align: center;
    }
</style>