// Mock para react-native-vector-icons en el entorno de tests
const React = require('react');
const { Text } = require('react-native');
const Icon = (props) => React.createElement(Text, null, props.name || '');
Icon.Button = (props) => React.createElement(Text, null, props.children);
module.exports = Icon;
