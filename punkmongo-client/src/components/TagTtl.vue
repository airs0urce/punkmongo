<template>
    <div class="info-tag info-tag-ttl no-select" 
        :class="{
            disabled: ttlIndexes.length == 0, 
            info: ttlIndexes.length > 0, 
            'info-tag-ttl-fixed-width': fixedWidth
        }"
        @mouseenter="showDetails(true)" 
        @mouseleave="showDetails(false)"
    >

        <span v-show="ttlIndexes.length == 0">no TTL</span>
        <span v-show="ttlIndexes.length > 0">
            TTL <font-awesome-icon icon="question-circle" class="question-icon" />
            <div class="info-tag-details with-select" ref="infoTagDetails" :class="{'info-on-left': detailsOnLeft}">
                <div class="tag-details-title">
                    TTL indexes<a href="https://docs.mongodb.com/manual/core/index-ttl" target="_blank">
                        <font-awesome-icon icon="question-circle" class="icon-help" /> 
                    </a>
                </div>
                
                <table>
                    <colgroup>
                        <col width="50%" valign="top">
                        <col width="50%" valign="top">
                    </colgroup>
                    <thead>
                        <tr>
                            <th>index key</th>
                            <th>expires after</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="ttlIndex of ttlIndexes">
                            <td>{{ttlIndex.key}}</td>
                            <td>{{formatExpiresAfter(ttlIndex.expireAfterSeconds)}}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </span>
        
    </div>

</template>

<script>
import { gsap } from 'gsap'
import * as moment from 'moment'

export default { 
    data: function() {
        return {
            detailsAnim: null,
            detailsAnimTimeout: 0,
        }
    },
    props: {
        ttlIndexes: Array,
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
        showDetails(bool) {
            if (bool) {
                clearTimeout(this.detailsAnimTimeout);
                if (this.detailsAnim) {
                    this.detailsAnim.play();
                    return;
                }
                this.detailsAnim = gsap.fromTo(this.$refs.infoTagDetails, 
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
                this.detailsAnimTimeout = setTimeout(() => {
                    this.detailsAnim.reverse();
                    if (! this.hideDetailsAnimation) {
                        this.detailsAnim.progress(0);
                    }
                }, this.hideDetailsDelay);
            }
        },
        formatExpiresAfter(seconds) {
            const duration = moment.duration(seconds, 'seconds');
            if (seconds < 60) {
                return `${duration.asSeconds()} seconds`;
            } else if (seconds < 60 * 60) {
                const minutes = Math.floor(duration.asMinutes());
                const seconds = duration.seconds();

                let text = `${minutes} minute${minutes > 1 ? 's': ''}`;
                if (seconds) {
                    text += ` ${seconds} second${seconds > 1 ? 's': ''}`;
                }
                return text;
            } else if (seconds < 60 * 60 * 24) {
                const hours = Math.floor(duration.asHours());
                const minutes = duration.minutes();
    
                let text = `${hours} hour${hours > 1 ? 's': ''}`;
                if (minutes) {
                    text += ` ${minutes} minute${minutes > 1 ? 's': ''}`;
                }
                return text;
            } else if (seconds < 60 * 60 * 24 * 30) {
                const days = Math.floor(duration.asDays());
                const hours = duration.hours();

                let text = `${days} day${days > 1 ? 's': ''} `;
                if (hours) {
                    text += ` ${hours} hour${hours > 1 ? 's': ''}`;
                }
                return text;
            } else {
                const months = Math.floor(duration.asMonths());
                const days = duration.days();
                
                let text = `${months} month${months > 1 ? 's': ''}`;
                if (days) {
                    text += ` ${days} day${days > 1 ? 's': ''}`;
                }
                return text;
            } 
        }
    },
    mounted() {
        
    },
    destroyed() {
        if (this.detailsAnim) {
            this.detailsAnim.kill()
        }
    },
}

</script>

<style lang="scss">
    @import '@/scss/tags.scss';

    .info-tag.info-tag-ttl .info-tag-details {
        width: 30rem;
        table {
            width: 100%;
        }
    }

    .info-tag-ttl-fixed-width {
        width: 4rem;
        text-align: center;
    }
</style>