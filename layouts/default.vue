<template>
  <v-app>
    <v-app-bar fixed app color="rgba(0,0,0,0.8)">
      <v-toolbar-title>
        <v-icon left>
          mdi-autorenew
        </v-icon>
        {{ title }}
      </v-toolbar-title>
      <v-spacer />
      <v-btn
        v-for="(item, i) in items"
        :key="i"
        :to="item.to"
        router
        text
        class="ml-2"
      >
        <v-icon left>
          {{ item.icon }}
        </v-icon>
        {{ item.title }}
      </v-btn>
    </v-app-bar>
    <v-main class="mt-16 mb-5 py-3">
      <v-container>
        <Nuxt />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'DefaultLayout',
  data () {
    return {
      items: [
        {
          icon: 'mdi-home',
          title: 'Home',
          to: '/'
        },
        {
          icon: 'mdi-pencil',
          title: 'Edit',
          to: '/editlogin'
        }
      ],
      title: 'Defi Briddge Explorer'
    }
  }
}
</script>
