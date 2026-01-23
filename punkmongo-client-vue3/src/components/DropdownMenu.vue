<template>
    <span class="dropdown">
        <button @click="toggleMenu">
            <font-awesome-icon icon="caret-down" />
            <span>{{buttonText}}</span>
            <div class="items" v-if="open">
                <span v-for="(item, index) in items" :key="index" @click="itemClick(item)">{{item.text}}</span>
            </div>
        </button>
    </span>
</template>

<script>
export default {
    props: {
        buttonText: String,
        items: Array
    },
    data() {
        return {
            open: false
        }
    },
    methods: {
        toggleMenu() {
            this.open = !this.open
        },
        itemClick(item) {
            item.click()
        }
    }
}
</script>

<style lang="scss" scoped>
.dropdown button {
    position: relative;
    span {

    }

    .items {
        position: absolute;
    }
}
</style>
