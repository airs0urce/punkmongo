<!-- <router-link to="/">Home</router-link> |
<router-link to="/about">About</router-link> -->


<template>
  <div class="main-container" @mousemove="onMouseMove" @mouseup="disableResizerMoving">
    <div class="left-panel" :style="{width: $store.state.persistent.resizerPosition + 'px'}">
      <div>
        <div class="left-panel-header padding">
          <router-link class="left-panel-header-link" to="/overview/databases">Overview</router-link>  
        </div>
        <div class="line" />
        <div class="padding">
          <DatabasesNavigation />
        </div>
      </div>  
    </div>
    <div class="split-adjust-handler" @mousedown="enableResizerMoving" :class="{hover: movingResizer}"></div>
    <div class="right-panel">
      <div class="padding">
        <ul class="x">
          <li><router-link to="/overview/databases">Databases</router-link></li>
          <li><router-link to="/overview/server-info">Server info</router-link></li>
        </ul>
        <div class="line" />
        <div class="content">
          <router-view/>    
        </div>
      </div>
    </div>
  </div>
</template>

<script type="text/javascript">

  import '@/assets/css/reset.css'
  import '@/assets/css/main.css'
  import DatabasesNavigation from '@/components/DatabasesNavigation'
  import { SET_RESIZER_POSITION } from './store/mutation-types'

  const leftPanelSizeLimits = {min: 200, max: 500}

  export default {
    components: {
      DatabasesNavigation,
      
    },
    data: function() {
      return {
        movingResizer: false
      }
    },
    mounted: function() {
      
    },
    methods: {
      enableResizerMoving(event) {
        this.movingResizer = true;
      },
      onMouseMove(event) {
        let resizerPosition = 0;
        if (this.movingResizer) {
          resizerPosition = event.clientX;
          if (resizerPosition > leftPanelSizeLimits.max) {
            resizerPosition = leftPanelSizeLimits.max;
          }
          if (resizerPosition < leftPanelSizeLimits.min) {
            resizerPosition = leftPanelSizeLimits.min;
          }
          this.$store.commit(SET_RESIZER_POSITION, resizerPosition);
        }
        
      },
      disableResizerMoving(event) {
        this.movingResizer = false;
      }

    }
  }
</script>

<style>

body {
  font-size: 12px;
  font-family:"Courier New", Arial;
}

a {
  text-decoration: none;
  color: #004499;
  line-height: 1.5;
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
  padding: 0.5em;
}

.left-panel {
  flex-grow: 20%;
  background-color: #eeefff;
  width: 200px;
  height: 100vh;
  overflow: auto;
  white-space: nowrap;
}
.left-panel ul li:hover {
  background-color: #e1e2f1;
}

.line {
  margin-bottom: 10px;
  border-bottom: 1px #ccc solid;
}
.split-adjust-handler {
  width: 6px;
  background-color: #ddd;
}
  .split-adjust-handler:hover,
  .split-adjust-handler.hover {
    width: 6px;
    background-color: #C4E1A4;
    cursor: w-resize;
    user-select: none;
  }

.right-panel {
  flex-grow: 1;
}
.right-panel .line {
  border-bottom-color: #999;
}

ul.x {
  display: flex;
}

ul.x li {
  margin-right: 0.5em;
  border-right: 1px solid #ddd;
  padding-right: 0.5em;
}

table {
  background-color: rgb(204, 204, 204);
  border-collapse: separate;
  border-spacing: 1px;
}
table th {
  background-color: #cccccc;
  font-weight: bold;
  padding: 2px;
}
table td {
  background-color: #fffeee;
  padding: 2px;
}

div.gap {
  height: 20px;
}

.flex {
  display: flex;
}

.left-panel-header-link {
  padding-left: 1.6em;
  background: url('./assets/imgs/world.png') no-repeat;
  background-size: 13px;
  background-position: 0px 0.5px;
}
</style>








