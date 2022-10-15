<template>
  <div>
    <v-row class="my-2">
      <v-col sm="3">
        <v-select
          v-model="selectedExchange"
          item-text="name"
          return-object
          :items="getExchanges"
          outlined
          dense
          hide-details
          background-color="rgba(0,0,0,0.4)"
          label="Exchange"
          @change="getNetworks"
        />
      </v-col>
      <v-col sm="3">
        <v-btn
          v-if="selectedExchange && notDuplicateCurrencies.length > 0"
          color="primary"
          block
          @click="dialog = true"
        >
          Add Currency
        </v-btn>
      </v-col>
    </v-row>
    <v-card v-for="(data, index) in mainData" :key="index" class="mb-5 card-background" rounded="xl">
      <v-card-title>
        {{ data.name }}
        <v-row justify="end" class="pr-3">
          <v-col cols="6" sm="3">
            <v-select
              v-model="data.newFromNetwork"
              :items="baseNetworks"
              outlined
              dense
              hide-details
              label="from_Network"
              @change="set(index,data.newFromNetwork)"
            />
          </v-col>
          <v-col cols="6" sm="3">
            <v-btn
              block
              color="primary"
              :disabled="!data.newFromNetwork"
              @click="postFromNetwork(data)"
            >
              Add
            </v-btn>
          </v-col>
        </v-row>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="5" sm="3">
            from
          </v-col>
          <v-col cols="7" sm="9">
            to
          </v-col>
        </v-row>
        <div v-for="(network, index2) in data.networkList" :key="index2">
          <v-divider />
          <v-row class="mt-4">
            <v-col cols="5" sm="3">
              <h3>
                {{ network.name }}
              </h3>
            </v-col>
            <v-col cols="7" sm="9">
              <v-chip
                v-for="(to_network, index3) in network.to_networks"
                :key="index3"
                class="mr-2 mb-2"
                :close="network.to_networks.length > 1"
                @click:close="removeNetwork(network, to_network)"
              >
                {{ to_network }}
              </v-chip>
            </v-col>
          </v-row>
          <v-row justify="end" class="mb-2">
            <v-col cols="6" sm="3">
              <v-select
                v-model="network.newNetwork"
                :items="baseNetworks"
                outlined
                dense
                hide-details
                label="to_Network"
              />
            </v-col>
            <v-col cols="6" sm="3">
              <v-btn
                color="primary"
                block
                :disabled="!network.newNetwork"
                @click="postToNetwork(network)"
              >
                Add
              </v-btn>
            </v-col>
          </v-row>
        </div>
      </v-card-text>
    </v-card>
    <PostcurrencyInExchange
      v-if="dialog"
      :exchange-obj="selectedExchange"
      :not-duplicate-currencies="notDuplicateCurrencies"
      @getNetworks="getNetworks"
      @close="close"
    />
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import { globalDatas } from '@/mixins/globalDatas'
export default {
  mixins: [globalDatas],
  data () {
    return {
      networks: [],
      currencies: [],
      selectedExchange: '',
      newCurrency: '',
      dialog: false
    }
  },
  computed: {
    ...mapGetters('store', ['getAccount', 'getExchanges', 'getCurrencies']),
    mainData () {
      const list = []
      const currencies = JSON.parse(JSON.stringify(this.currencies))
      if (this.selectedExchange) {
        currencies.forEach((currency) => {
          currency.networkList = this.networks.filter((network) => {
            return (network.currency_id === currency.id)
          })
          if (currency.networkList.length > 0) {
            list.push(currency)
          }
        })
      }
      return list
    },
    notDuplicateCurrencies () {
      if (this.mainData.length > 0) {
        const mainList = this.mainData.map((main) => {
          return (main.name)
        })
        const list = this.getCurrencies.filter((currency) => {
          return (!mainList.includes(currency.name))
        })
        return list
      } else {
        return []
      }
    }
  },
  async mounted () {
    this.loading = true
    await this.setCurrencies(false)
    await this.setExchanges(false)
    this.currencies = JSON.parse(JSON.stringify(this.getCurrencies))
    this.loading = false
  },
  methods: {
    set (i, network) {
      this.currencies[i].newFromNetwork = network
    },
    ...mapActions('store', ['setExchanges', 'setCurrencies']),
    async getNetworks () {
      if (this.selectedExchange) {
        const exchangeId = this.selectedExchange.id
        const where = ['exchange_id', '==', exchangeId]
        this.networks = await this.$getDb('from_networks', 'name', where)
          .catch((e) => {
            alert('DBリクエストエラー')
            console.log(e)
            return []
          })
      } else {
        this.networks = []
      }
    },
    postFromNetwork (obj) {
      const account = this.getAccount
      const postObj = {
        name: obj.newFromNetwork,
        currency_id: obj.networkList[0].currency_id,
        exchange_id: obj.networkList[0].exchange_id,
        to_networks: [],
        updated_by: account
      }
      this.$postDb('from_networks', postObj)
        .then(() => {
          this.getNetworks()
        })
        .catch((e) => {
          alert('DB保存エラー')
          console.log(e)
        })
    },
    postToNetwork (Obj) {
      const list = JSON.parse(JSON.stringify(Obj.to_networks))
      const account = this.getAccount
      if (!list.includes(Obj.newNetwork) && Obj.name !== Obj.newNetwork) {
        list.push(Obj.newNetwork)
        list.sort()
        const putObj = {
          to_networks: list,
          updated_by: account
        }
        this.$putDb('from_networks', Obj.id, putObj)
          .then(() => {
            Obj.to_networks = list
          })
          .catch((e) => {
            alert('DB保存エラー')
            console.log(e)
          })
      }
      Obj.newNetwork = ''
    },
    removeNetwork (Obj, network) {
      const account = this.getAccount
      const list = Obj.to_networks.filter((to) => {
        return (to !== network)
      })
      const putObj = {
        to_networks: list,
        updated_by: account
      }
      this.$putDb('from_networks', Obj.id, putObj)
        .then(() => {
          Obj.to_networks = list
        })
        .catch((e) => {
          alert('DB保存エラー')
          console.log(e)
        })
    },
    close () {
      this.dialog = false
    }
  }
}
</script>
