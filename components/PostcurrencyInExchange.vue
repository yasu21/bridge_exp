<template>
  <v-dialog v-model="dialog" width="70%" persistent>
    <v-card class="pb-2">
      <v-card-title>
        {{ exchangeObj.name }} : Add Currency
      </v-card-title>
      <v-card-text class="my-2">
        <v-row>
          <v-col cols="6" sm="3">
            <v-select
              v-model="currencyId"
              item-text="name"
              item-value="id"
              :items="notDuplicateCurrencies"
              outlined
              hide-details
              label="Currency"
            />
          </v-col>
          <v-col v-if="type == 'DEX'" cols="6" sm="3">
            <v-select
              v-model="fromNetwork"
              :items="baseNetworks"
              outlined
              hide-details
              label="from Network"
            />
          </v-col>
          <v-col v-if="type == 'CEX'" cols="6" sm="3">
            <v-text-field
              v-model="fromNetwork"
              outlined
              hide-details
              disabled
              label="from Network"
            />
          </v-col>
        </v-row>
        <v-row>
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
        <v-btn color="accent" width="150" @click="close">
          Close
        </v-btn>
        <v-btn color="primary" width="150" :disabled="disablePost" @click="postFromNetwork">
          Add
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import { mapGetters } from 'vuex'
import { globalDatas } from '@/mixins/globalDatas'
export default {
  mixins: [globalDatas],
  props: {
    exchangeObj: {
      type: Object,
      default: () => ({})
    },
    notDuplicateCurrencies: {
      type: Array,
      default: () => ([])
    }
  },
  data () {
    return {
      dialog: true,
      exchangeId: '',
      currencyId: '',
      type: '',
      fromNetwork: '',
      toNetworks: []
    }
  },
  computed: {
    ...mapGetters('store', ['getAccount']),
    disablePost () {
      if (this.currencyId && this.fromNetwork && this.toNetworks.length > 0) {
        return false
      } else {
        return true
      }
    }
  },
  mounted () {
    this.exchangeId = this.exchangeObj.id
    this.type = this.exchangeObj.type
    if (this.type === 'CEX') {
      this.fromNetwork = 'common'
    }
  },
  methods: {
    postFromNetwork () {
      this.toNetworks.sort()
      const account = this.getAccount
      const postObj = {
        exchange_id: this.exchangeId,
        currency_id: this.currencyId,
        name: this.fromNetwork,
        to_networks: this.toNetworks,
        updated_by: account
      }
      this.$postDb('from_networks', postObj)
        .then(() => {
          this.$emit('getNetworks')
          this.toNetworks = []
          this.fromNetwork = ''
        })
        .catch((e) => {
          alert('DB追加エラー')
          console.log(e)
        })
    },
    close () {
      this.$emit('close')
    }
  }
}
</script>
