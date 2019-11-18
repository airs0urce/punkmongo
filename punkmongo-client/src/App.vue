<!-- <router-link to="/">Home</router-link> |
<router-link to="/about">About</router-link> -->


<template>
  
  <div class="main-container" @mousemove="onMouseMove" @mouseup="disableResizerMoving">
    <div class="left-panel" :style="{flex: '0 0 ' + $store.state.persistent.resizerPosition + 'px'}" v-if="$store.state.persistent.showLeftPanel">
      <div>
        <div class="left-panel-header padding" >
          <router-link class="left-panel-header-link" to="/overview/databases">Overview</router-link>  
        </div>
        <div class="line" />
        <div class="padding" style="padding-top: 0;">
          <DatabasesNavigation />
        </div>
      </div>  
    </div>
    <div class="split-adjust-handler" 
      @mousedown="enableResizerMoving" 
      :class="{hover: movingResizer, 'left-panel-hidden': !$store.state.persistent.showLeftPanel}"
    ></div>
    <div class="right-panel">
      <div class="padding">
        <div class="content">
          <router-view />    
        </div>
      </div>
    </div>
  </div>
</template>

<script type="text/javascript">

  import '@/assets/css/reset.css'
  import '@/assets/css/main.css'
  import DatabasesNavigation from '@/components/DatabasesNavigation'
  import * as mutations from './store/mutations'

  export default {
    components: {
      DatabasesNavigation,
      
    },
    data: function() {
      return {
        movingResizer: false,
        leftPanelSizeLimits: {min: 150, max: 600},
        showLeftPanel: true
      }
    },
    mounted: function() {
      
    },
    methods: {
      enableResizerMoving(event) {
        this.movingResizer = true;
        this.movingStartPos = event.clientX;
      },
      onMouseMove(event) {
        const persistent = this.$store.state.persistent;

        let resizerPosition = 0;
        if (this.movingResizer) {
          resizerPosition = event.clientX;

          if (resizerPosition < 30 && persistent.showLeftPanel) {
            this.toggleLeftPanel();
          } else if (resizerPosition > 30 && !persistent.showLeftPanel) {
            this.toggleLeftPanel();
            resizerPosition = 0;
          } else {
            if (resizerPosition > this.leftPanelSizeLimits.max) {
              resizerPosition = this.leftPanelSizeLimits.max;
            }
            if (resizerPosition < this.leftPanelSizeLimits.min && persistent.showLeftPanel) {
              resizerPosition = this.leftPanelSizeLimits.min;
            }
          }

          this.$store.commit(mutations.SET_RESIZER_POSITION, resizerPosition);
        }
        
      },
      disableResizerMoving(event) {
        this.movingResizer = false;
        const movingEndPos = event.clientX;
        if (this.movingStartPos == movingEndPos) {
          this.toggleLeftPanel();
        }
      },
      toggleLeftPanel() {
        this.$store.commit(mutations.TOGGLE_LEFT_PANEL);
        if (this.$store.state.persistent.resizerPosition < this.leftPanelSizeLimits.min) {
          this.$store.commit(mutations.SET_RESIZER_POSITION, this.leftPanelSizeLimits.min);
        }
      },

    }
  }
</script>

<style lang="scss">

body {
  font-size: 12px;
  font-family:"Courier New", Arial;
  /* font-family:"Akzidenz", "Helvetica Neue", Helvetica, Arial, sans-serif; */
  text-rendering: geometricPrecision;
}

a {
  text-decoration: none;
  color: #004499;
}
a:hover {
  color: blue;
}
.main-container {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  min-height: 100vh;
}
.padding {
  padding: 0.8em;
}

.left-panel {
  background-color: #eeefff;
  height: 100vh;
  overflow: auto;
  white-space: nowrap;
}

.line {
  margin-bottom: 1em;
  border-bottom: 1px #ccc solid;
}
.split-adjust-handler {
  height: 100vh;
  flex: 0 0 0.7em;
  background-color: #ddd;
  border: 1px solid #BBB;
  display: flex;
  flex-direction: column;
  justify-content: center;
  &:hover, &.hover {
    background-color: #C4E1A4;
    cursor: pointer;
    user-select: none;
  }
  &.left-panel-hidden {
    flex: 0 0 1.2em;
  }
}

.right-panel {
  flex-grow: 1;
  height: 100vh;
  overflow: auto;
  padding-bottom: 1.5em;
}
.right-panel .line {
  border-bottom-color: #999;
}


table {
  background-color: rgb(204, 204, 204);
  border-collapse: separate;
  border-spacing: 1px;
  th {
    background-color: #cccccc;
    font-weight: bold;
    padding: 0.5em;
    text-align: center;
    user-select: none;
  }
  td {
    background-color: #fffeee;
    padding: 0.3em;
  }
  tfoot td {
    font-weight: bold;
  }
}

div.gap {
  height: 20px;
}

.left-panel-header-link {
  padding-left: 1.6em;
  background: url('./assets/imgs/world.png') no-repeat;
  background-size: 13px;
  background-position: 0px 0.5px;
}

</style>








