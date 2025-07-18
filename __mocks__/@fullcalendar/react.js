const React = require('react');
module.exports = {
  __esModule: true,
  default: React.forwardRef(({ events }, ref) => {
    React.useImperativeHandle(ref, () => ({ getApi: () => ({ changeView: () => {} }) }), []);
    return React.createElement('div', null, events.map(e => React.createElement('div', { key: e.id }, e.title)));
  }),
};
