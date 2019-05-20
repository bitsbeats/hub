<template>
  <div>
      <b-table :data="this.images" :loading="loading" :checkable="checkable" :checked-rows.sync="newChecked" @check="check">
          <template slot-scope="props">
              <b-table-column field="name" label="Name">
                  <router-link :to="getUrl(props.row.name)">{{ props.row.name }}</router-link>
              </b-table-column>
              <b-table-column v-if="taglen" field="taglen" label="Tags">
                {{ props.row.tags }}
              </b-table-column>
              <b-table-column v-if="gitcols" field="git" label="Git">
                  <a target="_blank" v-if="props.row.gitUrl" :href="props.row.gitUrl"><github-box-icon /></a> 
                  <span v-else>no label</span>
                  <a target="_blank" v-if="props.row.gitRef && props.row.gitRef.length == 40" :href="`${props.row.gitUrl.replace(/.git$/, '')}/commit/${props.row.gitRef}`"><source-commit-icon /></a>
              </b-table-column>
          </template>
      </b-table>
  </div>
</template>

<script>
 export default {
   name: 'BbImage',
   data() {
     return {
       newChecked: [...this.checked],
     };
   },
   props: {
     images: {
       type: Array,
       default: () => []
     },
     select: {
       type: Function,
       default: () => function() {},
     },
     loading: {
       type: Boolean,
       default: () => false,
     },
     checkable: {
       type: Boolean,
       default: () => false,
     },
     checked: {
       type: Array,
       default: () => [],
     },
     gitcols: {
       type: Boolean,
       default: () => false,
     },
     taglen: {
       type: Boolean,
       default: () => false,
     }
   },
   mounted() {
   },
   methods: {
     getUrl(name) {
       name = encodeURIComponent(name);
       return `/image/${name}`;
     },
     check(rows) {
       this.$emit('update:checked', rows);
     }
   },
   watch: {
     checked(rows) {
       this.newChecked = [...rows];
     },
   }
 }
</script>
