const REQUEST_TYPES = {
  createOrder: 'create_order',
  getOrder: 'get_order',
  updateOrder: 'update_order',
  checkTradeState: 'check_trade_state',
  orderNotify: 'order_notify',
  goodsInfo: 'goods_info',

  JSAPIWepay: 'JSAPI',
  NATIVEWepay: 'NATIVE'
}

const MPAPI_REQUEST_TYPES = {
  getAccessToken: 'get_access_token',
  getJsAPITicket: 'get_js_api_ticket',
  getCardAPITicket: 'get_card_api_ticket'
}

const SECURITY_CHECK_REQUEST_TYPES = {
  checkTextSecurity: 'check_text_security'
}

const BOARD_REQUEST_TYPES = {
  getPosts: 'get_posts',
  createPost: 'create_post'
}

const TRADE_STATES = {
  notpay: 'NOTPAY',
  success: 'SUCCESS',
  refund: 'REFUND',
  closed: 'CLOSED',
  revoked: 'REVOKED',
  paying: 'USERPAYING',
  payerror: 'PAYERROR'
}

module.exports = {
  REQUEST_TYPES: REQUEST_TYPES,
  TRADE_STATES: TRADE_STATES,
  BOARD_REQUEST_TYPES: BOARD_REQUEST_TYPES,
  MPAPI_REQUEST_TYPES: MPAPI_REQUEST_TYPES,
  SECURITY_CHECK_REQUEST_TYPES: SECURITY_CHECK_REQUEST_TYPES
}
