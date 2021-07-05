<template>
    <div class="info-tag no-select" 
        :class="{disabled: !collectionOptions.collation, info: collectionOptions.collation, 'info-tag-collation-fixed-width': fixedWidth}"
        @mouseenter="showCollationDetails(true)" 
        @mouseleave="showCollationDetails(false)">
        <span v-show="!collectionOptions.collation">default collation</span>
        <span v-show="collectionOptions.collation">
            custom collation 
            <font-awesome-icon icon="question-circle" class="question-icon" />

            <div class="info-tag-details info-tag-details-collation with-select" ref="infoTagDetails" :class="{'info-on-left': detailsOnLeft}">
                <div class="tag-details-title">
                    Custom Collation<a href="https://docs.mongodb.com/master/reference/collation/" target="_blank">
                        <font-awesome-icon icon="question-circle" class="icon-help" /> 
                    </a>
                </div>


                <table class="collation-info">
                    <colgroup>
                        <col width="20%" valign="top">
                        <col width="17%" valign="top">
                        <col width="63%" valign="top">
                    </colgroup>
                    <thead>
                        <tr>
                            <th>option</th>
                            <th>value</th>
                            <th>value description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item of getCollationInfo()" :class="{'default': item.default, 'non-default': !item.default}">
                            <td>{{item.title}}</td>
                            <td :class="{'bold': !item.default}">
                                {{JSON.stringify(item.value)}}
                            </td>
                            <td>
                                {{item.valueInfo}}
                            </td>
                        </tr>
                    </tbody>
                </table>
                

            </div>
        </span>
        
    </div>

</template>

<script>
import collectionOptions from '../collectionOptions'
import { gsap } from 'gsap'

export default { 
    data: function() {
        return {
            customCollationAnim: null,
            collationDetailsHideTimeout: 0,
        }
    },
    props: {
        collectionOptions: Object,
        hideDetailsDelay: {
            type: Number,
            default: 100
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
        getCollationInfo() {
            const valueByField = this.collectionOptions.collation;
            if (! valueByField) {
                return [];
            }

            const collationInfoArr = [];
            for (let field in collectionOptions) {
                const collectionOption = collectionOptions[field].values.find((valueItem) => {
                    return (valueItem.value == valueByField[field]); 
                })
                const valueText = collectionOption.text;

                collationInfoArr.push({
                    title: collectionOptions[field].title,
                    value: valueByField[field],
                    default: (valueByField[field] === collectionOptions[field].default),
                    valueInfo: valueText
                });
            }

            return collationInfoArr;
        },
        showCollationDetails(bool) {
            if (bool) {
                clearTimeout(this.collationDetailsHideTimeout);
                if (this.customCollationAnim) {
                    this.customCollationAnim.play();
                    return;
                }
                this.customCollationAnim = gsap.fromTo(this.$refs.infoTagDetails, 
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
                );
            } else {
                this.collationDetailsHideTimeout = setTimeout(() => {
                    this.customCollationAnim.reverse();
                    if (! this.hideDetailsAnimation) {
                        this.customCollationAnim.progress(0);
                    }
                }, this.hideDetailsDelay);
            }
        }
    },
    mounted() {
        
    },
    destroyed() {
        if (this.customCollationAnim) {
            this.customCollationAnim.kill()
        }
    },
}

</script>

<style lang="scss">
    @import '@/scss/tags.scss';

    .info-tag-details {
        width: 60rem;
        z-index: 200;
    }
    .info-tag-details-collation {
        transform: translate(10em, 0px);
    }
    .collation-info {
        white-space: initial;
    }
    .info-tag-collation-fixed-width {
        width: 10rem;
        text-align: center;
    }
</style>