<template>
  <div>
    <div v-if="!getAccount">
      <div v-if="!disableMsg">
        <v-btn color="primary" :loading="loginLoading" @click="checkWeb3">
          MetaMask Login
        </v-btn>
        <div class="mt-3">
          メタマスクからアドレスを取得し、署名で認証します。 テストネットでも接続可能です。<br>
          ブロックチェーンには何も書き込みません。
        </div>
      </div>
      <div v-else>
        {{ disableMsg }}
      </div>
    </div>
    <div v-else>
      <v-row justify="end" class="my-2 pr-2">
        <div class="pt-2 px-3" style="word-break: break-all;">
          {{ getAccount }}
        </div>
        <v-btn color="accent" @click="logout">
          Logout
        </v-btn>
      </v-row>
      <v-tabs v-model="tab" class="mb-2" color="#fff">
        <v-tab>取引所編集</v-tab>
        <v-tab>取引所追加</v-tab>
      </v-tabs>
      <EditExchange v-if="tab===0" />
      <div v-if="tab===1">
        soon...
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { getAuth, signOut, signInWithCustomToken } from 'firebase/auth'
import { getFunctions, httpsCallable } from 'firebase/functions'

export default {
  name: 'EditPost',
  data () {
    return {
      tab: 0,
      newUserNonce: null,
      loginLoading: false,
      disableMsg: null,
      userId: ''
    }
  },
  computed: {
    ...mapGetters('store', ['getAccount'])
  },
  mounted () {
    if (!window.ethereum || !window.ethereum.isMetaMask) {
      this.disableMsg = 'MetaMaskをインストールしてください。'
    }
  },
  methods: {
    // WEB3
    checkWeb3 () {
      this.loginLoading = true
      window.ethereum
        .request({ method: 'eth_accounts' })
        .then((res) => {
          if (res[0]) {
            this.login(res[0])
          } else {
            this.connectWeb3()
          }
        })
        .catch((error) => {
          this.loginLoading = false
          alert('MetaMaskにログインしてください。')
          console.log(error)
        })
    },
    connectWeb3 () {
      window.ethereum
        .request({ method: 'eth_requestAccounts' })
        .then((res) => {
          if (res[0]) {
            this.login(res[0])
          } else {
            alert('MetaMaskにログインしてください。')
          }
        })
        .catch((err) => {
          console.log(err)
          this.loginLoading = false
        })
    },

    ...mapActions('store', ['setAccount']),
    // sign & firestoreLogin
    async login (account) {
      try {
        const nonceMsg = await this.getNonceMsg(account)
        const signObj = await this.sign(nonceMsg, account)
        const credential = await this.fireStoreLogin(signObj)
        if (credential) {
          if (this.newUserNonce) {
            this.userPost(account)
          } else {
            this.userPut(account)
          }
          this.setAccount(account)
          this.checkAccount()
        } else {
          alert('署名Loginエラー')
          this.setAccount(null)
          this.logout()
        }
      } catch (error) {
        this.logout()
        console.log(error)
      }
      this.loginLoading = false
    },

    // nonce取得
    async getNonceMsg (account) {
      const wheres = ['uid', '==', account]
      const nonceMsg = await this.$getDb('users', null, wheres)
        .then((res) => {
          if (res.length > 0) {
            const msg = 'Login-DefiBridgeEx : ' + res[0].nonce
            this.userId = res[0].id
            return msg
          } else {
            this.newUserNonce = this.randomNumber()
            const msg = 'Login-DefiBridgeEx : ' + this.newUserNonce
            return msg
          }
        })
        .catch((e) => {
          alert('DBリクエストエラー')
          throw e
        })
      return nonceMsg
    },
    // web3 署名
    async sign (msg, account) {
      const web3 = this.$web3
      const sig = await web3.eth.personal.sign(msg, account)
        .catch((e) => {
          alert('署名エラー')
          throw e
        })
      const obj = {
        uid: account,
        sig,
        msg
      }
      return obj
    },
    // fireStore ログイン
    async fireStoreLogin (obj) {
      const auth = getAuth()
      let customToken = this.$cookie.get('customToken')
      if (customToken) {
        console.log('from-cookie')
      } else {
        const functions = getFunctions()
        const authFunc = httpsCallable(functions, 'auth')
        const customTokenObj = await authFunc(obj)
          .catch((e) => {
            alert('cloud-funcエラー')
            throw e
          })
        customToken = customTokenObj.data
        this.$cookie.set('customToken', customToken,
          { expires: '55m', SameSite: 'strict', Secure: false }
        )
      }
      const credential = await signInWithCustomToken(auth, customToken)
        .catch((e) => {
          alert('custom-loginエラー')
          throw e
        })
      // const idToken = credential._tokenResponse.idToken
      return credential
    },

    // userData post
    async userPost (account) {
      const data = {
        uid: account,
        nonce: this.newUserNonce,
        updated_by: account
      }
      await this.$postDb('users', data)
        .then(() => {
          this.newUserNonce = null
        })
        .catch((e) => {
          console.log(e)
        })
    },

    // userData put
    async userPut (account) {
      const nonce = this.randomNumber()
      const data = {
        updated_by: account,
        nonce
      }
      await this.$putDb('users', this.userId, data)
        .catch((e) => {
          console.log(e)
        })
    },

    randomNumber () {
      return Math.floor(Math.random() * 100000001)
    },

    // event Lisner func
    handleAccountsChanged (accounts) {
      if (accounts.length === 0 || this.getAccount !== accounts[0]) {
        this.logout()
      }
    },
    // add lisner
    checkAccount () {
      window.ethereum.on('accountsChanged', this.handleAccountsChanged)
    },
    logout () {
      // remove lisner
      window.ethereum.removeListener('accountsChanged', this.handleAccountsChanged)
      this.setAccount(null)
      const auth = getAuth()
      signOut(auth)
        .then(() => {
          console.log('done-logout')
        })
        .catch((error) => {
          console.log(error.code, error.message)
        })
    }
  }
}
</script>
