export const REQUEST_TYPES = {
  createOrder: 'create_order',
  getOrder: 'get_order',
  updateOrder: 'update_order',
  checkTradeState: 'check_trade_state',
  orderNotify: 'order_notify',
  goodsInfo: 'goods_info',

  JSAPIWepay: 'JSAPI',
  NATIVEWepay: 'NATIVE'
}

export const MPAPI_REQUEST_TYPES = {
  getAccessToken: 'get_access_token',
  getJsAPITicket: 'get_js_api_ticket',
  getCardAPITicket: 'get_card_api_ticket'
}

export const MPAUTH_REQUEST_TYPES = {
  snsapiBase: 'snsapi_base',
  snsapiUserinfo: 'snsapi_userinfo',
  userInfo: 'user_info'
}

export const SECURITY_CHECK_REQUEST_TYPES = {
  checkTextSecurity: 'check_text_security'
}

export const BOARD_REQUEST_TYPES = {
  getPosts: 'get_posts',
  createPost: 'create_post'
}

export const TRADE_STATES = {
  notpay: 'NOTPAY',
  success: 'SUCCESS',
  refund: 'REFUND',
  closed: 'CLOSED',
  revoked: 'REVOKED',
  paying: 'USERPAYING',
  payerror: 'PAYERROR'
}
