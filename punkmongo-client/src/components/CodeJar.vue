<template>
    <div 
        ref="codejarEl" 
        :class="'language-' + language"
        v-shortkey="shortkey" 
        @shortkey="onShortkey()"
    ></div>
</template>

<script>
import {CodeJar} from 'codejar';
import Prism from '@/vendor/prismjs/prism';
import '@/vendor/prismjs/prism.css'

export default {
    props: {
        language: String,
        value: String,
        shortkey: Object,
    },
    watch: { 
        value: function(newVal) {
            if (newVal != this.queryEditor.toString()) {
                this.queryEditor.updateCode(newVal);
            }
            
        }
    },
    methods: {
        onShortkey() {
            this.$emit('shortkey');
        }
    },
    mounted() {
        this.queryEditor = CodeJar(
            this.$refs.codejarEl,
            Prism.highlightElement,
            {tab: ' '.repeat(2), addClosing: false}
        );
        this.queryEditor.updateCode(this.value);
        this.queryEditor.onUpdate(code => {
            this.$emit('input', code);
        })
        
    },
    destroyed: async function() {
        this.queryEditor.destroy();
    }
}

</script>

<style lang="scss">

</style>