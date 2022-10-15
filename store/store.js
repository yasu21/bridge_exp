export const state = () => ({
  account: null,
  exchanges: [],
  currencies: []
})

export const getters = {
  getAccount (state) {
    return state.account
  },
  getExchanges (state) {
    return state.exchanges
  },
  getCurrencies (state) {
    return state.currencies
  }
}

export const actions = {
  setAccount (vuexContext, account) {
    vuexContext.commit('SetAccount', account)
  },
  setExchanges (vuexContext, force) {
    if (vuexContext.state.exchanges.length === 0 || force) {
      this.$getDb('exchanges', 'name')
        .then((res) => {
          vuexContext.commit('SetExchanges', res)
        })
        .catch((e) => {
          console.log(e)
          vuexContext.commit('SetExchanges', [])
        })
    }
  },
  setCurrencies (vuexContext, force) {
    if (vuexContext.state.currencies.length === 0 || force) {
      this.$getDb('currencies', 'name')
        .then((res) => {
          vuexContext.commit('SetCurrencies', res)
        })
        .catch((e) => {
          console.log(e)
          vuexContext.commit('SetCurrencies', [])
        })
    }
  }
}

export const mutations = {
  SetAccount (state, account) {
    state.account = account
  },
  SetExchanges (state, list) {
    state.exchanges = list
  },
  SetCurrencies (state, list) {
    state.currencies = list
  }
}
