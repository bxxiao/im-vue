import Vue from 'vue'
import Vuex from 'vuex'
import {createSession} from "../utils/network/chat";

import state from "./state";
import mutations from "./mutations";
import actions from "./actions";

/*
* TODO：把部分状态尝试转移到对应的组件的data
* */

Vue.use(Vuex)

export default new Vuex.Store({
  state,
  mutations,
  getters: {
    getAvatar(state) {
      return uid => {
        if (state.dialogue.type === 1)
          return state.dialogue.avatar;
        else if (state.dialogue.type === 2)
          return state.dialogue.avatarMap.get(uid.toString());
        else
          return ''
      }
    }
  },
  actions,

  modules: {},
})
