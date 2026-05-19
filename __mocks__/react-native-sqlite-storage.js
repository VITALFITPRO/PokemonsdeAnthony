const mockDb = {
  executeSql: jest.fn(() =>
    Promise.resolve([{ rows: { length: 0, item: jest.fn(() => null) } }])
  ),
};

module.exports = {
  enablePromise: jest.fn(),
  openDatabase: jest.fn(() => Promise.resolve(mockDb)),
};
