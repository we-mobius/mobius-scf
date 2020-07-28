const REQUEST_TYPES = {
  createOrder: 'create_order',
  getOrder: 'get_order',
  updateOrder: 'update_order',
  checkTradeState: 'check_trade_state',
  orderNotify: 'order_notify',
  goodsInfo: 'goods_info',
  JSAPIWepay: 'JSAPI',
  NATIVEWepay: 'NATIVE',
}

const TRADE_STATES = {
  notpay: 'NOTPAY',
  success: 'SUCCESS',
  refund: 'REFUND',
  closed: 'CLOSED',
  revoked: 'REVOKED',
  paying: 'USERPAYING',
  payerror: 'PAYERROR',
}

module.exports = {
  REQUEST_TYPES: REQUEST_TYPES,
  TRADE_STATES: TRADE_STATES
}
