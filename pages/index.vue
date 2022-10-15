<template>
  <div>
    <v-row justify="start">
      <v-col sm="3">
        <v-select
          v-model="currencyObj"
          return-object
          item-text="name"
          :items="getCurrencies"
          :loading="loading"
          outlined
          dense
          background-color="rgba(0,0,0,0.4)"
          label="Currency"
          @change="getNetworks"
        />
      </v-col>
      <v-col v-if="currencyObj" sm="3">
        <v-select
          v-model="type"
          :items="types"
          outlined
          dense
          label="Type"
          background-color="rgba(0,0,0,0.4)"
        />
      </v-col>
    </v-row>
    <v-card v-for="(i, index) in mainData" :key="index" class="mb-5 card-background" rounded="xl">
      <v-card-title>
        {{ i.name }}
      </v-card-title>
      <v-card-text>
        <span class="pr-3">currency : {{ currencyObj.name }}</span>
        <span>type : {{ i.type }}</span>
        <v-row class="my-2">
          <v-col cols="5" sm="4" class="pb-0">
            from
          </v-col>
          <v-col cols="7" sm="8" class="pb-0">
            to
          </v-col>
        </v-row>
        <div v-for="(n, index2) in i.networkList" :key="index2">
          <v-divider />
          <v-row class="mb-3 mt-2">
            <v-col cols="5" sm="4">
              <h3>
                {{ n.name }}
              </h3>
            </v-col>
            <v-col cols="7" sm="8">
              <v-chip v-for="(t, index3) in n.to_networks" :key="index3" class="mr-2 mb-2">
                {{ t }}
              </v-chip>
            </v-col>
          </v-row>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import { globalDatas } from '@/mixins/globalDatas'
export default {
  mixins: [globalDatas],
  data () {
    return {
      currencyObj: '',
      networks: [],
      type: 'All',
      types: ['All', 'DEX', 'CEX']
    }
  },
  computed: {
    ...mapGetters('store', ['getAccount', 'getExchanges', 'getCurrencies']),
    mainData () {
      let list = []
      const exchanges = JSON.parse(JSON.stringify(this.getExchanges))
      if (this.currencyObj) {
        exchanges.forEach((ex) => {
          ex.networkList = this.networks.filter((n) => {
            return n.exchange_id === ex.id
          })
          if (ex.networkList.length > 0) {
            list.push(ex)
          }
        })
        if (this.type !== 'All') {
          list = list.filter((li) => {
            return li.type === this.type
          })
        }
      }
      return list
    }
  },
  async mounted () {
    this.loading = true
    await this.setCurrencies(false)
    await this.setExchanges(false)
    this.loading = false
  },
  methods: {
    ...mapActions('store', ['setExchanges', 'setCurrencies']),
    async getNetworks () {
      this.loading = true
      if (this.currencyObj) {
        const where = ['currency_id', '==', this.currencyObj.id]
        this.networks = await this.$getDb('from_networks', 'name', where)
          .catch((err) => {
            console.log(err)
            return []
          })
      } else {
        this.networks = []
      }
      this.loading = false
    },
    async dev () {
      const devices = await navigator.usb.getDevices()
      if (devices.length > 0) {
        const device = devices[0]
        device.open()
          .then(() => device.selectConfiguration(1))
          .then(() => device.selectConfiguration(1))
          .then(() => console.log(1))
          .then(() => device.claimInterface(1)) // インターフェイス#2の排他的な制御を要求。
          .then(() => console.log(2))
          // .then(() => device.clearHalt('in', 2))
          .then(() => device.transferIn(2, 64)) // エンドポイント#5から64バイトのデータを待機。
          .then((result) => {
            console.log(result)
            const decoder = new TextDecoder()
            if (result && result.data) {
              console.log(result.data)
              console.log('Received: ' + decoder.decode(result.data))
              return true
            }
          })
          .then(() => device.close())
          .catch((error) => { console.error(error) })
      }
    }
  }
}
</script>
