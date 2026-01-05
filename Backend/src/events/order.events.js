const EventEmitter = require("events");
class OrderEventBus extends EventEmitter {}
const orderEvents = new OrderEventBus();

module.exports = orderEvents;
