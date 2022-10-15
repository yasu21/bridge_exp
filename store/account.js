export const state = () => ({
  account: null
})

export const getters = {
  address (state) {
    return state.account
  }
}

export const actions = {
  set (vuexContext, account) {
    vuexContext.commit('SET', account)
  }
}

export const mutations = {
  SET (state, account) {
    state.account = account
  }
}
