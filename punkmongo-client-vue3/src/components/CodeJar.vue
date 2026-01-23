<template>
    <div
        ref="codejarEl"
        :class="'language-' + language"
        @keydown="onKeydown"
    ></div>
</template>

<script>
import { CodeJar } from 'codejar'
import Prism from '@/vendor/prismjs/prism'
import '@/vendor/prismjs/prism.css'

export default {
    props: {
        language: String,
        modelValue: String,
        shortkey: Object,
    },
    emits: ['update:modelValue', 'shortkey'],
    watch: {
        modelValue(newVal) {
            if (newVal != this.queryEditor.toString()) {
                this.queryEditor.updateCode(newVal)
            }
        }
    },
    methods: {
        onKeydown(event) {
            // Handle shortkey - check if ctrl+enter or cmd+enter
            if (this.shortkey) {
                const keys = Object.keys(this.shortkey)
                for (const key of keys) {
                    const parts = key.split('+')
                    const requiresCtrl = parts.includes('ctrl')
                    const requiresMeta = parts.includes('meta')
                    const mainKey = parts.find(p => p !== 'ctrl' && p !== 'meta')

                    if (mainKey === 'enter' && event.key === 'Enter') {
                        if ((requiresCtrl && event.ctrlKey) || (requiresMeta && event.metaKey)) {
                            event.preventDefault()
                            this.$emit('shortkey')
                            return
                        }
                    }
                }
            }
        }
    },
    mounted() {
        this.queryEditor = CodeJar(
            this.$refs.codejarEl,
            Prism.highlightElement,
            { tab: ' '.repeat(2), addClosing: false }
        )
        this.queryEditor.updateCode(this.modelValue || '')
        this.queryEditor.onUpdate(code => {
            this.$emit('update:modelValue', code)
        })
    },
    unmounted() {
        if (this.queryEditor) {
            this.queryEditor.destroy()
        }
    }
}
</script>

<style lang="scss">
</style>
