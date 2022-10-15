<template>
  <v-card class="mt-4 py-3 px-2 card-background" rounded="xl">
    <v-card-title>
      Post Exchange
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-col>
          <v-text-field
            v-model="exchangeName"
            outlined
            hide-details
            label="Exchange Name"
          />
        </v-col>
        <v-col>
          <v-select
            v-model="type"
            :items="types"
            outlined
            hide-details
            label="Exchange Type"
          />
        </v-col>
        <v-col>
          <v-select
            v-model="currencyId"
            item-text="name"
            item-value="id"
            :items="currencies"
            outlined
            hide-details
            label="Currency Name"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="4">
          <v-text-field
            v-if="type == 'CEX'"
            v-model="fromNetwork"
            outlined
            hide-details
            disabled
            label="from Network"
          />
          <v-select
            v-if="type == 'DEX'"
            v-model="fromNetwork"
            :items="baseNetworks"
            outlined
            hide-details
            height="30"
            label="from Network"
          />
        </v-col>
        <v-col>
          <v-select
            v-model="toNetworks"
            :items="baseNetworks"
            outlined
            multiple
            chips
            hide-details
            label="to Network"
          />
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn color="primary" width="200" :disabled="disablePost" @click="postData">
        Add
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
<script>
import { globalDatas } from '@/mixins/globalDatas'
export default {
  mixins: [globalDatas],
  data () {
    return {
      exchangeName: '',
      currencyId: '',
      fromNetwork: '',
      toNetworks: [],
      types: ['DEX', 'CEX'],
      type: ''
    }
  },
  computed: {
    currencies () { return this.gotData.currencies },
    disablePost () {
      if (this.exchangeName && this.type && this.fromNetwork && this.toNetworks.length > 0) {
        return false
      } else {
        return true
      }
    }
  },
  watch: {
    type () {
      this.fromNetwork = (this.type === 'CEX') ? 'common' : ''
    }
  },
  mounted () {
  },
  methods: {
    async postData () {
      const post = await this.postExchange()
      if (post) {
        await this.postFromNetwork(post.id)
          .then(() => {
            this.getGlobaldata(true)
          })
          .catch((e) => {
            console.log(e)
          })
      }
    },
    async postExchange () {
      const account = this.$store.getters['account/get']
      const postObj = {
        name: this.exchangeName,
        type: this.type,
        updated_by: account
      }
      const post = await this.$postDb('exchanges', postObj)
      return post
    },
    async postFromNetwork (exchangeId) {
      const account = this.$store.getters['account/get']
      this.toNetworks = this.toNetworks.filter((network) => {
        return (network !== this.fromNetwork)
      })
      this.toNetworks.sort()
      const postObj = {
        exchange_id: exchangeId,
        currency_id: this.currencyId,
        name: this.fromNetwork,
        to_networks: this.toNetworks,
        updated_by: account
      }
      const post = await this.$postDb('from_networks', postObj)
      return post
    }
  }
}
</script>
