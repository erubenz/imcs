const React = require('react');
module.exports = {
  MemoryRouter: ({ children }) => React.createElement('div', null, children),
  useParams: () => ({}),
};
