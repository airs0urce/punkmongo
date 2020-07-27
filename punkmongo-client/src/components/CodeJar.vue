<template>
    <div ref="codejarEl" :class="'language-' + language"></div>
</template>

<script>
import {CodeJar} from '@/vendor/codejar/codejar.js';
import Prism from '@/vendor/prismjs/prism';
import '@/vendor/prismjs/prism.css'

export default {
    props: {
        language: String,
        value: String,
    },
    watch: { 
        value: function(newVal) {
            if (newVal != this.queryEditor.toString()) {
                this.queryEditor.updateCode(newVal);
            }
            
        }
    },
    mounted() {
        this.queryEditor = CodeJar(
            this.$refs.codejarEl,
            Prism.highlightElement,
            {tab: ' '.repeat(2), enableSelfClosing: false}
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