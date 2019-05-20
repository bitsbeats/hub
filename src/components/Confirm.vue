<template>
    <form @submit.prevent>
        <div class="modal-card" style="width: auto">
            <header class="modal-card-head">
                <p class="modal-card-title">Delete</p>
            </header>
            <section class="modal-card-body">
                <div class="content">
                    Do your want to delete these tags?
                    <ul>
                        <li v-for="item in items" v-bind:key="item.name">{{ item.name }}</li>
                    </ul>
                </div>
            </section>
            <footer class="modal-card-foot">
                <button class="button" type="button" @click="$parent.close()">Close</button>
                <button class="button is-danger" @click="submit">Delete</button>
            </footer>
        </div>
    </form>
</template>

<script>
  export default {
    name: 'BbConfirm',
    data() {
      return {
        nil: 'nil',
      };
    },
     props: {
       items: {
         type: Array,
         default: () => [],
       },
       confirm: {
         type: Function,
         default: () => undefined,
       },
    },
    methods: {
      submit(){
        this.$parent.close();
        this.confirm();
      }
    },
    mounted() {
    }
  }
</script>
