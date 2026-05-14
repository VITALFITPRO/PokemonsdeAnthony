// Mock de react-native-tts para Jest
const Tts = {
  speak: jest.fn(),
  stop: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  setDefaultLanguage: jest.fn(() => Promise.resolve()),
  setDefaultRate: jest.fn(),
  setDefaultPitch: jest.fn(),
};

export default Tts;
