const React = require('react');
const { View } = require('react-native');

const SafeAreaProvider = ({ children }) => React.createElement(View, null, children);
const SafeAreaView = ({ children, style }) => React.createElement(View, { style }, children);
const SafeAreaConsumer = ({ children }) => children({ top: 0, right: 0, bottom: 0, left: 0 });
const useSafeAreaInsets = () => ({ top: 0, right: 0, bottom: 0, left: 0 });
const useSafeAreaFrame = () => ({ x: 0, y: 0, width: 390, height: 844 });
const initialWindowMetrics = { insets: { top: 0, right: 0, bottom: 0, left: 0 }, frame: { x: 0, y: 0, width: 390, height: 844 } };

module.exports = {
  SafeAreaProvider,
  SafeAreaView,
  SafeAreaConsumer,
  useSafeAreaInsets,
  useSafeAreaFrame,
  initialWindowMetrics,
};
