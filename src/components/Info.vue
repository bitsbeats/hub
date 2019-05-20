<template>
  <div class="content">
      <p v-if="info && info.data">
          Name: {{info.name}}<br />
          Tag: {{info.tag}}<br />
          <br />
          Entrypoint: {{info.data.config.Entrypoint}}<br />
          Cmd: {{info.data.config.Cmd || nil}}<br />
          Env:
          <ul>
            <li v-bind:key="env" v-for="env in info.data.config.Env">{{env}}</li>
          </ul>
          Labels:
          <ul>
              <li v-bind:key="label" v-for="(value, label) in info.data.config.Labels">
                  <em>{{label}}:</em>
                  {{value}}
              </li>
          </ul>
      </p>
  </div>
</template>

<script>
  export default {
    name: 'BbInfo',
    data() {
      return {
        nil: 'nil',
      };
    },
     props: {
       info: {
         type: Object,
         default: () => {},
       },
    },
    mounted() {
    }
  }
</script>
