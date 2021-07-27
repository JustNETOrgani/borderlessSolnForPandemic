export default {
  set_token (state, token) {
    state.token = token
    // sessionStorage.token = token;
    sessionStorage.setItem('API-HTTP-AUTHORIZATION', token)
    console.log('API-HTTP-AUTHORIZATION token: ', token)
  },
  del_token (state) {
    state.token = null
    sessionStorage.removeItem('API-HTTP-AUTHORIZATION')
  },
  set_user_type (state, userType) {
    state.user_type = userType
    sessionStorage.setItem('USER-TYPE', userType)
  },
  del_user_type (state) {
    state.student_info = null
    sessionStorage.removeItem('USER-TYPE')
  }
}
