<template>
  <div id="app" class="container">
    <div class="hero-body">
      <div class="container">
        <h1 class="title">Image Hub</h1>
        <h2 class="subtitle">[{{ $registry }}] browser</h2>
      </div>
    </div>
    <b-input v-model="search" placeholder="Search"></b-input>

    <b-modal :active.sync="tagConfirmDelete" has-modal-card>
        <bb-confirm :items="tagsChecked" :confirm="deleteTagConfirmed" />
    </b-modal>

    <b-tabs v-model="activeTab" @input="tabChange">
        <b-tab-item label="Images">
            <bb-image :images="filteredImages" :select="imageSelect" :loading="imagesLoading" :taglen="true" />
        </b-tab-item>
        <b-tab-item label="Tags" :visible="tagTabVisible">
            <p class="control">
                <b-button class="button" type="is-danger" size="is-small" @click="deleteTag">Delete {{ tagsChecked.length }} tags</b-button>
                <b-button class="button" size="is-small" @click="() => {this.tagsChecked = []}">Clear</b-button>
            </p>
            <bb-image :images="sortedTags" :select="tagSelect" :loading="tagsLoading" :checkable="true" :checked.sync="tagsChecked" :gitcols="true" :copy="true" />
        </b-tab-item>
        <b-tab-item label="Info" :visible="infoTabVisible">
            <bb-info :info="infoData" />
        </b-tab-item>
    </b-tabs>
  </div>
</template>


<script>
 import BbImage from "./components/Image.vue";
 import BbInfo from "./components/Info.vue";
 import BbConfirm from "./components/Confirm.vue";

 export default {
   name: 'app',
   components: {
     BbImage,
     BbInfo,
     BbConfirm,
   },
   data() {
     return {
       activeTab: 0,
       search: "",

       images: [],
       imagesLoadingCount: 0,
       imagesLoading: false,
       imageSelected: "",

       tagMap: {},
       tagTabVisible: false,
       tagConfirmDelete: false,
       tagsLoading: false,
       tagsLoadingCount: 0,
       tagsChecked: [],
       tagsDeletingCount: 0,

       infoTabVisible: false,
       infoMap: {},
       infoSortMap: {},
       infoData: {},

       sortedTags: [],
     }
   },
   methods: {
     deleteTag() {
       this.tagConfirmDelete = true;
     },
     deleteTagConfirmed() {
       this.tagsChecked.map((item) => {
         this.$http.get(`/v2/${item.image}/manifests/${item.tag}`, {
           headers: {'Accept': 'application/vnd.docker.distribution.manifest.v2+json'}
         })
             .then(({headers}) => {
               const digest = headers['docker-content-digest'];
               this.$http.delete(`/v2/${item.image}/manifests/${digest}`)
                   .then(() => {
                     delete this.infoSortMap[`${item.data.created}_${item.name}`]
                     delete this.infoMap[item.name];
                     this.updateInfo();
                     this.$snackbar.open({
                       duration: 2000,
                       type: 'is-success',
                       message: `Deleted ${item.name}.`,
                       queue: false,
                     })
                   })
                   .catch(() => {
                     this.$snackbar.open({
                       duration: 2000,
                       type: 'is-danger',
                       message: `Unable to delete ${item.name}.`,
                       queue: false,
                     })
                   });
             })
             .catch(() => {
               this.$snackbar.open({
                 duration: 2000,
                 type: 'is-danger',
                 message: `Unable to delete ${item.name}.`,
                 queue: false,
               })
             });
       });
       this.tagsChecked = [];
     },
     loadImages() {
       this.images = [];
       this.$http.get('/v2/_catalog')
           .then(({data}) => {
             for (var imageName of data.repositories) {
               this.imagesLoadingCount++;
               this.loadTags(imageName);
             }
           });
     },
     loadTags(imageName) {
       this.$http.get(`/v2/${imageName}/tags/list`)
           .then(({data}) => {
             if (data.tags && data.tags.length > 0) {
               this.images.push({
                 name: imageName,
                 tags: data.tags.length,
               })
               this.tagMap[imageName] = data.tags.map((name) => {
                 return {
                   'name': `${imageName}:${name}`,
                   'image': imageName,
                   'tag': name,
                 }
               });
             }
             this.imagesLoadingCount--;
           })
           .catch(() => {
             this.$snackbar.open({
               duration: 2000,
               type: 'is-danger',
               message: `No image named ${imageName} found.`,
               queue: false,
             })
             this.imagesLoadingCount--;
           })
     },
     loadInfo(tag) {
       this.$http.get(`/v2/${tag.image}/manifests/${tag.tag}`)
           .then(({data}) => {
             if ('history' in data && 0 in data.history) {
               const tagInfo = JSON.parse(data.history[0].v1Compatibility);
               this.infoMap[tag.name] = {
                 'name': tag.name,
                 'image': tag.image,
                 'tag': tag.tag,
                 'data': tagInfo,
               }
               if (tagInfo['container_config'] && tagInfo['container_config']['Labels']) {
                 this.infoMap[tag.name] = Object.assign(this.infoMap[tag.name], {
                   'gitUrl': tagInfo['container_config']['Labels']['org.label-schema.vcs-url'],
                   'gitRef': tagInfo['container_config']['Labels']['org.label-schema.vcs-ref'],
                 });
               }
               this.infoSortMap[`${tagInfo.created}_${tag.name}`] = tag.name;
             }
             this.tagsLoadingCount--;
             this.updateInfo();
           })
           .catch(() => {
             this.$snackbar.open({
               duration: 2000,
               type: 'is-danger',
               message: `No tag named ${tag.name} found.`,
               queue: false,
             })
             this.tagsLoadingCount--;
           })
     },
     updateInfo() {
       var keys = Object.keys(this.infoSortMap).sort().reverse();
       var infos = [];
       keys.map((key) => {
         var name = this.infoSortMap[key];
         var info = this.infoMap[name];
         infos.push(info);
       })
       this.sortedTags = infos;
     },
     imageSelect(image) {
       if (image in this.tagMap) {
         this.tagTabVisible = true;
         this.activeTab = 1;
         this.tags = this.tagMap[image];
         this.sortedTags = [];
         this.tagsChecked = [];
         this.infoMap = {};
         this.infoSortMap = {};
         this.imageSelected = image;
         for (var tag of this.tags) {
           this.tagsLoadingCount++;
           this.loadInfo(tag);
         }
       } else {
         this.$snackbar.open({
           duration: 2000,
           type: 'is-danger',
           message: `No image named ${image} found.`,
         });
       }
     },
     tagSelect(image) {
       this.infoData = this.infoMap[image];
       this.infoTabVisible = true;
       this.activeTab = 2;
     },
     tabChange(tab) {
       if (tab == 0) {
         this.$router.push('/');
       } else if (tab == 1) {
         this.$router.push(`/image/${encodeURIComponent(this.imageSelected)}`);
       } else if (tab == 2) {
         this.$router.push(`/image/${encodeURIComponent(this.infoData.name)}`);
       }
     },
   },
   mounted() {
     this.$router.push('/');
     this.$clip.on('success', () => {
       this.$snackbar.open({
         duration: 2000,
         type: 'is-success',
         message: `copied.`,
         queue: false,
       })
     });
     this.loadImages();
   },
   computed: {
     filteredImages() {
       return this.images.filter(i => {return i.name.includes(this.search)});
     },
     tagActive() {
       return this.$route.params.image;
     },
   },
   watch: {
     '$route'(to) {
       if (to.path == '/' || to.path == '/image/') {
         this.activeTab = 0;
       } else if ('image' in to.params && to.params.image.includes(':')) {
         this.tagSelect(to.params.image);
       } else if ('image' in to.params && to.params.image) {
         this.imageSelect(to.params.image);
       }
     },
     imagesLoadingCount(to) {
       this.imagesLoading = !(to <= 0);
     },
     tagsLoadingCount(to) {
       this.tagsLoading = !(to <= 0);
     },
   }
 }

</script>

